import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { MOCK_EMOTIONAL_SPENDING, MOCK_CATEGORY_SPENDING } from '../services/mockData';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon } from '../components/Icons';

const Insights: React.FC = () => {
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            if (!process.env.API_KEY) {
                setAiInsight("API Key not configured. Cannot fetch AI insights.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const prompt = `
            You are MindSpend AI, a financial wellness coach.
            Analyze the following user spending data (in INR) and provide a concise, actionable insight (2-3 sentences).
            
            Emotional Spending Data (Rs.): ${JSON.stringify(MOCK_EMOTIONAL_SPENDING)}
            Category Spending Data (Rs.): ${JSON.stringify(MOCK_CATEGORY_SPENDING)}

            Focus on the connection between emotions and spending categories.
            For example, identify the top emotion driving spending and which category it impacts most.
            Provide one positive suggestion for more mindful spending.
            Keep the tone supportive and insightful.
            `;
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                setAiInsight(response.text);
            } catch (error) {
                console.error("Error fetching AI insight:", error);
                setAiInsight("Could not fetch AI insight at this time.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsight();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-8">
             <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-3 text-indigo-400" />
                    Your AI Financial Insight
                </h2>
                {isLoading ? (
                    <div className="h-16 flex items-center justify-center">
                        <div className="animate-pulse flex space-x-4">
                           <div className="rounded-full bg-gray-700 h-4 w-4"></div>
                           <div className="flex-1 space-y-2 py-1">
                               <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                               <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                           </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-300">{aiInsight}</p>
                )}
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Emotional Spending Radar</h2>
                 <ResponsiveContainer width="100%" height={400}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_EMOTIONAL_SPENDING}>
                        <PolarGrid stroke="#4b5563" />
                        <PolarAngleAxis dataKey="emotion" stroke="#d1d5db" />
                        <PolarRadiusAxis angle={30} domain={[0, Math.max(...MOCK_EMOTIONAL_SPENDING.map(e => e.amount)) + 50]} stroke="#9ca3af"/>
                        <Radar name="Spending" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none' }} />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Mindful Spending Tips</h2>
                <ul className="space-y-4 text-gray-300">
                    <li className="flex items-start">
                        <span className="bg-indigo-500/20 text-indigo-300 rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold mr-3 mt-1 flex-shrink-0">1</span>
                        <span>
                            <strong>Pause Before Purchasing:</strong> Before buying something impulsively, take 10 minutes. Ask yourself if it's a need or a want and how you're feeling.
                        </span>
                    </li>
                     <li className="flex items-start">
                        <span className="bg-indigo-500/20 text-indigo-300 rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold mr-3 mt-1 flex-shrink-0">2</span>
                        <span>
                            <strong>Identify Your Triggers:</strong> Notice which emotions lead to spending. If you spend when stressed, find alternative coping mechanisms like a walk or listening to music.
                        </span>
                    </li>
                     <li className="flex items-start">
                        <span className="bg-indigo-500/20 text-indigo-300 rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold mr-3 mt-1 flex-shrink-0">3</span>
                        <span>
                            <strong>Unsubscribe from Marketing:</strong> Reduce temptation by unsubscribing from marketing emails and unfollowing brands that encourage impulse buys.
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Insights;
