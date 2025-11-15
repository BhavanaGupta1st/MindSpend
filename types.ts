
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
  emotion: 'Happy' | 'Sad' | 'Neutral' | 'Stressed' | 'Excited';
}

export interface Challenge {
  id: string;
  title: string;
  description:string;
  progress: number;
  goal: number;
  isCompleted: boolean;
  reward: string;
}

export interface EmotionalSpending {
  emotion: string;
  amount: number;
}

export interface CategorySpending {
    name: string;
    value: number;
}
