import { Expense, Challenge, EmotionalSpending, CategorySpending } from '../types';

export const MOCK_EXPENSES: Expense[] = [
    { id: '1', description: 'Morning Coffee', amount: 4.50, category: 'Food & Drink', date: '2023-10-27', vendor: 'Starbucks', emotion: 'Happy' },
    { id: '2', description: 'Monthly Subscription', amount: 14.99, category: 'Subscriptions', date: '2023-10-26', vendor: 'Netflix', emotion: 'Neutral' },
    { id: '3', description: 'Dinner with friends', amount: 65.20, category: 'Food & Drink', date: '2023-10-25', vendor: 'Italian Place', emotion: 'Excited' },
    { id: '4', description: 'New headphones', amount: 199.99, category: 'Shopping', date: '2023-10-24', vendor: 'Best Buy', emotion: 'Stressed' },
    { id: '5', description: 'Groceries', amount: 89.45, category: 'Groceries', date: '2023-10-23', vendor: 'Whole Foods', emotion: 'Neutral' },
    { id: '6', description: 'Taxi home late', amount: 25.00, category: 'Transport', date: '2023-10-22', vendor: 'Uber', emotion: 'Sad' },
];

export const MOCK_CHALLENGES: Challenge[] = [
    { id: '1', title: 'Reduce Food Delivery by 15%', description: 'Try cooking at home more often this week.', progress: 5, goal: 15, isCompleted: false, reward: 'Healthier Wallet Badge' },
    { id: '2', title: 'No Impulse Buys for 7 Days', description: 'Stick to your shopping list. You can do it!', progress: 3, goal: 7, isCompleted: false, reward: 'Mindful Shopper Badge' },
    { id: '3', title: 'Save Rs. 4000 This Week', description: 'Find small ways to cut back and reach your savings goal.', progress: 2000, goal: 4000, isCompleted: false, reward: 'Rs. 4000 Saver Badge'},
    { id: '4', title: 'Meatless Mondays', description: 'Go vegetarian for one day a week.', progress: 4, goal: 4, isCompleted: true, reward: 'Eco-Warrior Badge' },
];

export const MOCK_EMOTIONAL_SPENDING: EmotionalSpending[] = [
    { emotion: 'Happy', amount: 350.75 },
    { emotion: 'Stressed', amount: 450.25 },
    { emotion: 'Excited', amount: 250.00 },
    { emotion: 'Sad', amount: 120.50 },
    { emotion: 'Neutral', amount: 600.00 },
];

export const MOCK_CATEGORY_SPENDING: CategorySpending[] = [
    { name: 'Food & Drink', value: 450 },
    { name: 'Shopping', value: 300 },
    { name: 'Transport', value: 150 },
    { name: 'Groceries', value: 220 },
    { name: 'Subscriptions', value: 80 },
    { name: 'Entertainment', value: 120 },
];
