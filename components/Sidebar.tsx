
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { LogOutIcon, SparklesIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
    const { logout } = useAuth();
  
    return (
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col p-4">
            <div className="flex items-center mb-10 px-2">
                <SparklesIcon className="w-8 h-8 text-indigo-400" />
                <h1 className="text-2xl font-bold ml-2 text-white">MindSpend</h1>
            </div>
            <nav className="flex-1">
                <ul>
                    {NAV_LINKS.map((link) => (
                        <li key={link.name}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                                        isActive
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div>
                 <button 
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3 my-1 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                    <LogOutIcon className="w-5 h-5 mr-3" />
                    Logout
                 </button>
            </div>
        </div>
    );
};

export default Sidebar;
