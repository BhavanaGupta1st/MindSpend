import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { UploadCloudIcon } from '../components/Icons';
import { MOCK_EXPENSES, MOCK_CATEGORY_SPENDING } from '../services/mockData';
import { Expense } from '../types';

interface ScannedExpense {
    vendor?: string;
    totalAmount?: number;
    date?: string;
    category?: string;
    items?: string[];
}

const Expenses: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Food & Drink', vendor: '', date: new Date().toISOString().split('T')[0]});
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewExpense(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    const scanReceipt = useCallback(async () => {
        if (!receiptFile || !process.env.API_KEY) {
            alert("Please select a receipt image first.");
            return;
        }
        setIsScanning(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToGenerativePart(receiptFile);
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: { parts: [imagePart, { text: "Extract the vendor name, total amount, date, and suggest a category from the following categories: " + MOCK_CATEGORY_SPENDING.map(c => c.name).join(', ') + ". Also list the items purchased." }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            vendor: { type: Type.STRING },
                            totalAmount: { type: Type.NUMBER },
                            date: { type: Type.STRING, description: "in YYYY-MM-DD format" },
                            category: { type: Type.STRING },
                            items: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            
            const parsedResponse: ScannedExpense = JSON.parse(response.text);

            setNewExpense(prev => ({
                ...prev,
                vendor: parsedResponse.vendor || '',
                amount: parsedResponse.totalAmount?.toString() || '',
                date: parsedResponse.date || new Date().toISOString().split('T')[0],
                category: parsedResponse.category || 'Uncategorized',
                description: parsedResponse.items?.join(', ') || 'Scanned Receipt'
            }));

        } catch (error) {
            console.error("Error scanning receipt:", error);
            alert("Failed to scan receipt. Please try again or enter manually.");
        } finally {
            setIsScanning(false);
        }
    }, [receiptFile]);

    const addExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const expenseToAdd: Expense = {
            id: new Date().toISOString(),
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            category: newExpense.category,
            vendor: newExpense.vendor,
            date: newExpense.date,
            emotion: 'Neutral' // Default emotion
        };
        setExpenses(prev => [expenseToAdd, ...prev]);
        setNewExpense({ description: '', amount: '', category: 'Food & Drink', vendor: '', date: new Date().toISOString().split('T')[0] });
        setReceiptFile(null);
        setReceiptPreview(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Manual and OCR Form */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Receipt Scanner */}
                         <div className="bg-gray-700/50 p-6 rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-center">
                            {receiptPreview ? (
                                <img src={receiptPreview} alt="Receipt preview" className="max-h-40 rounded-lg mb-4" />
                            ) : (
                                <>
                                <UploadCloudIcon className="w-12 h-12 text-gray-400 mb-2"/>
                                <label htmlFor="receipt-upload" className="cursor-pointer text-indigo-400 font-semibold">
                                    Upload a receipt
                                    <input id="receipt-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                                </>
                            )}
                             {receiptFile && (
                                <button onClick={scanReceipt} disabled={isScanning} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg w-full disabled:bg-gray-500">
                                    {isScanning ? 'Scanning...' : 'Scan with AI'}
                                </button>
                            )}
                        </div>
                        {/* Manual Form */}
                        <form onSubmit={addExpense} className="space-y-4">
                            <input type="text" name="description" placeholder="Description" value={newExpense.description} onChange={handleInputChange} className="w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                             <input type="text" name="vendor" placeholder="Vendor" value={newExpense.vendor} onChange={handleInputChange} className="w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <div className="flex gap-4">
                               <input type="number" name="amount" placeholder="Amount" value={newExpense.amount} onChange={handleInputChange} className="w-1/2 bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                               <select name="category" value={newExpense.category} onChange={handleInputChange} className="w-1/2 bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {MOCK_CATEGORY_SPENDING.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    <option value="Uncategorized">Uncategorized</option>
                               </select>
                            </div>
                             <input type="date" name="date" value={newExpense.date} onChange={handleInputChange} className="w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">Add Expense</button>
                        </form>
                    </div>
                </div>

                {/* Expense List */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Expense History</h2>
                     <div className="overflow-y-auto max-h-96">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-gray-800">
                                <tr className="border-b border-gray-700">
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-3">
                                            <div>{expense.description}</div>
                                            <div className="text-xs text-gray-400">{expense.vendor}</div>
                                        </td>
                                        <td className="p-3"> <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300">{expense.category}</span></td>
                                        <td className="p-3 text-gray-400">{expense.date}</td>
                                        <td className="p-3 text-right font-medium">Rs. {expense.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
                 <h2 className="text-xl font-semibold mb-4">Monthly Summary</h2>
                 <div className="space-y-4">
                     {MOCK_CATEGORY_SPENDING.map(cat => {
                         const total = MOCK_CATEGORY_SPENDING.reduce((sum, c) => sum + c.value, 0);
                         const percentage = (cat.value / total) * 100;
                         return (
                            <div key={cat.name}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-gray-300">{cat.name}</span>
                                    <span className="text-sm font-medium text-gray-400">Rs. {cat.value}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                         );
                     })}
                 </div>
            </div>
        </div>
    );
};

export default Expenses;
