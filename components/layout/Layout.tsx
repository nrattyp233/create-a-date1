
import React from 'react';
import BottomNav from './BottomNav';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-gray-900/50 backdrop-blur-sm shadow-2xl shadow-black">
      <main className="flex-grow overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
