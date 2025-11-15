import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { MicIcon, StopCircleIcon, UserIcon } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';

// Helper functions for audio encoding/decoding
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


const Converse: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('Idle. Press start to talk.');
    const [transcripts, setTranscripts] = useState<{ author: 'user' | 'model'; text: string }[]>([]);
    
    const { user } = useAuth();

    const sessionRef = useRef<LiveSession | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const nextStartTimeRef = useRef(0);
    const playingSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const startConversation = async () => {
        if (isRecording || !process.env.API_KEY) {
            alert("API Key is not set or recording is already in progress.");
            return;
        }

        try {
            setStatus('Connecting to AI...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('Connection open. Start speaking.');
                        setIsRecording(true);
                        
                        const inputAudioContext = inputAudioContextRef.current!;
                        sourceNodeRef.current = inputAudioContext.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContext.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        sourceNodeRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        handleServerMessage(message);
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('API Error:', e);
                        setStatus(`Error: ${e.message}. Please try again.`);
                        stopConversation();
                    },
                    onclose: (e: CloseEvent) => {
                        setStatus('Connection closed.');
                        setIsRecording(false);
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'You are MindSpend, a friendly and helpful financial assistant. Keep your responses concise and encouraging.',
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });

            sessionRef.current = await sessionPromise;

        } catch (error) {
            console.error('Failed to start conversation:', error);
            setStatus('Error: Could not access microphone.');
        }
    };
    
    const handleServerMessage = useCallback(async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
        } else if (message.serverContent?.inputTranscription) {
            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
        }

        if (message.serverContent?.turnComplete) {
            const fullInput = currentInputTranscriptionRef.current.trim();
            const fullOutput = currentOutputTranscriptionRef.current.trim();
            if (fullInput) setTranscripts(prev => [...prev, { author: 'user', text: fullInput }]);
            if (fullOutput) setTranscripts(prev => [...prev, { author: 'model', text: fullOutput }]);
            currentInputTranscriptionRef.current = '';
            currentOutputTranscriptionRef.current = '';
        }
        
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
            const outputAudioContext = outputAudioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);

            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
            
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.addEventListener('ended', () => {
                playingSourcesRef.current.delete(source);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            playingSourcesRef.current.add(source);
        }

        if (message.serverContent?.interrupted) {
            for (const source of playingSourcesRef.current.values()) {
                source.stop();
            }
            playingSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
        }
    }, []);

    const stopConversation = () => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current?.state !== 'closed') {
            inputAudioContextRef.current?.close();
        }
        if (outputAudioContextRef.current?.state !== 'closed') {
            outputAudioContextRef.current?.close();
        }
        setIsRecording(false);
        setStatus('Idle. Press start to talk.');
    };

    useEffect(() => {
        return () => { // Cleanup on unmount
            stopConversation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="bg-gray-800 p-4 rounded-lg text-center mb-4">
                <p className="font-semibold text-white">Live Conversation Status</p>
                <p className="text-indigo-300">{status}</p>
            </div>
            <div className="flex-grow bg-gray-800 rounded-lg p-6 overflow-y-auto mb-4 space-y-4">
                {transcripts.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p>Your conversation will appear here.</p>
                        <p className="text-sm">Try saying "Log a Rs. 250 coffee from Starbucks."</p>
                    </div>
                )}
                {transcripts.map((t, index) => (
                    <div key={index} className={`flex items-start gap-4 ${t.author === 'user' ? 'justify-end' : ''}`}>
                         {t.author === 'model' && <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><MicIcon className="w-5 h-5 text-white" /></div>}
                        <div className={`max-w-md p-4 rounded-lg ${t.author === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                           {t.text}
                        </div>
                         {t.author === 'user' && <img src={user?.photoURL || ''} alt="user" className="w-10 h-10 rounded-full flex-shrink-0" />}
                    </div>
                ))}
            </div>
            <div className="flex justify-center items-center p-4">
                {!isRecording ? (
                    <button
                        onClick={startConversation}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-6 flex items-center justify-center shadow-lg transition-transform transform hover:scale-105"
                    >
                        <MicIcon className="w-8 h-8" />
                    </button>
                ) : (
                    <button
                        onClick={stopConversation}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 flex items-center justify-center shadow-lg transition-transform transform hover:scale-105"
                    >
                        <StopCircleIcon className="w-8 h-8" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Converse;
