import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BotIcon, SparklesIcon } from '../components/Icons';

const Simulator: React.FC = () => {
    const [purchaseDescription, setPurchaseDescription] = useState('');
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const simulatePurchase = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!purchaseDescription || !purchaseAmount || !process.env.API_KEY) {
            alert("Please fill in all fields.");
            return;
        }
        setIsLoading(true);
        setAnalysis(null);
        
        const prompt = `
            You are MindSpend AI, a financial advisor.
            A user is considering a new purchase. Here are the details:
            - Purchase: "${purchaseDescription}"
            - Cost: Rs. ${purchaseAmount}

            Here is the user's simplified monthly financial context (in INR):
            - Monthly Income: Rs. 400000
            - Monthly Fixed Expenses (Rent, Bills): Rs. 200000
            - Monthly Savings Goal: Rs. 40000
            - Current Discretionary Spending this month: Rs. 64000 (out of a Rs. 160000 budget)

            Please provide a "What-If" analysis. Structure your response as markdown. Include these sections:
            1.  **Impact on Budget**: How will this purchase affect their remaining discretionary budget for the month?
            2.  **Impact on Savings Goal**: Will this purchase put their savings goal at risk?
            3.  **AI Recommendation**: Should they proceed? Offer a thoughtful recommendation. Consider if this is a need vs. a want.
            4.  **Alternative Scenarios**: Suggest one or two cheaper alternatives or financial strategies (e.g., waiting a month, looking for a used item, etc.).

            Keep the tone encouraging and helpful, not judgmental. All monetary values in your response should be in Indian Rupees (Rs.).
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            setAnalysis(response.text);
        } catch (error) {
            console.error("Error in simulation:", error);
            setAnalysis("Sorry, I couldn't run the simulation. Please try again later.");
        } finally {
            setIsLoading(false);
        }

    }, [purchaseDescription, purchaseAmount]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center mb-8">
                <BotIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold">What-If Simulator</h1>
                <p className="text-gray-400 mt-2">See the future impact of your spending decisions before you make them.</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <form onSubmit={simulatePurchase} className="space-y-6">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">What are you thinking of buying?</label>
                        <input
                            id="description"
                            type="text"
                            value={purchaseDescription}
                            onChange={(e) => setPurchaseDescription(e.target.value)}
                            placeholder="e.g., A new 4K TV, a weekend trip..."
                            className="w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">How much would it cost?</label>
                        <input
                            id="amount"
                            type="number"
                            value={purchaseAmount}
                            onChange={(e) => setPurchaseAmount(e.target.value)}
                            placeholder="e.g., 60000"
                            className="w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center disabled:bg-gray-500 transition-colors">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                           <>
                           <SparklesIcon className="w-5 h-5 mr-2" />
                           Run Simulation
                           </>
                        )}
                    </button>
                </form>
            </div>
            
            {analysis && (
                 <div className="mt-8 bg-gray-800 p-8 rounded-lg shadow-lg">
                     <h2 className="text-2xl font-bold mb-4">AI Analysis</h2>
                     <div
                        className="prose prose-invert prose-headings:text-indigo-300 prose-strong:text-white"
                        dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    />
                 </div>
            )}
        </div>
    );
};

export default Simulator;
