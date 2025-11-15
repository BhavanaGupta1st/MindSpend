
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Converse from './pages/Converse';
import Expenses from './pages/Expenses';
import Simulator from './pages/Simulator';
import Challenges from './pages/Challenges';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
};

const MainApp: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }
    
    return (
        <HashRouter>
            {user ? <AuthenticatedApp /> : <Login />}
        </HashRouter>
    );
};

const AuthenticatedApp: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6 md:p-8">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/converse" element={<Converse />} />
                        <Route path="/expenses" element={<Expenses />} />
                        <Route path="/simulator" element={<Simulator />} />
                        <Route path="/challenges" element={<Challenges />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default App;
