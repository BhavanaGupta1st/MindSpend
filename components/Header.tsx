
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NAV_LINKS } from '../constants';
import { BellIcon, SearchIcon } from './Icons';

const Header: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const currentLink = NAV_LINKS.find(link => link.path === location.pathname);
    const pageTitle = currentLink ? currentLink.name : "MindSpend AI";

    return (
        <header className="flex items-center justify-between p-6 bg-gray-900 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button className="text-gray-400 hover:text-white">
                    <BellIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                    {user?.photoURL && (
                        <img
                            src={user.photoURL}
                            alt="User"
                            className="w-10 h-10 rounded-full"
                        />
                    )}
                    <div>
                        <p className="font-semibold text-white">{user?.displayName}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
