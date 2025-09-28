
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, FireIcon, ChatBubbleBottomCenterTextIcon, UserCircleIcon } from '@heroicons/react/24/solid';

const icons = {
    Swipe: FireIcon,
    Marketplace: HomeIcon,
    Matches: ChatBubbleBottomCenterTextIcon,
    Profile: UserCircleIcon
};

const navItems = [
    { path: '/', label: 'Swipe', icon: icons.Swipe },
    { path: '/marketplace', label: 'Marketplace', icon: icons.Marketplace },
    { path: '/matches', label: 'Matches', icon: icons.Matches },
    { path: '/profile', label: 'Profile', icon: icons.Profile }
];

const BottomNav: React.FC = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-900/80 backdrop-blur-lg border-t border-gray-700 shadow-lg">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full transition-colors duration-300 ${isActive ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`
                            }
                        >
                            <Icon className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
