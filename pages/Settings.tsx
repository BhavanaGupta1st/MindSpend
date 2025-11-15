
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
    });
    const [notifications, setNotifications] = useState({
        weeklySummary: true,
        challengeUpdates: true,
        unusualSpendingAlerts: false,
    });
    
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotifications({ ...notifications, [e.target.name]: e.target.checked });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            {/* Profile Settings */}
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-6">Profile</h2>
                <div className="flex items-center space-x-6">
                    <img src={user?.photoURL || ''} alt="Profile" className="w-24 h-24 rounded-full"/>
                    <div className="flex-grow space-y-4">
                         <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-400">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={profile.displayName}
                                onChange={handleProfileChange}
                                className="mt-1 w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                className="mt-1 w-full bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled
                            />
                        </div>
                    </div>
                </div>
                 <div className="mt-6 text-right">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg">Save Changes</button>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-6">Notifications</h2>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                        <label htmlFor="weeklySummary" className="text-gray-300">Weekly Summary Email</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="weeklySummary" name="weeklySummary" className="sr-only peer" checked={notifications.weeklySummary} onChange={handleNotificationChange} />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                   </div>
                   <div className="flex items-center justify-between">
                        <label htmlFor="challengeUpdates" className="text-gray-300">Challenge Updates</label>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="challengeUpdates" name="challengeUpdates" className="sr-only peer" checked={notifications.challengeUpdates} onChange={handleNotificationChange} />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                   </div>
                   <div className="flex items-center justify-between">
                        <label htmlFor="unusualSpendingAlerts" className="text-gray-300">Unusual Spending Alerts</label>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="unusualSpendingAlerts" name="unusualSpendingAlerts" className="sr-only peer" checked={notifications.unusualSpendingAlerts} onChange={handleNotificationChange} />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
