
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CURRENT_USER } from '../constants';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(CURRENT_USER);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-8 space-y-8 bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-white">
                Create-A-Date
            </h1>
            <p className="mt-2 text-gray-300">Find your perfect match.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <input id="email-address" name="email" type="email" required className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm" placeholder="Email address (demo)" defaultValue="riley@example.com" />
                </div>
                <div>
                    <input id="password" name="password" type="password" required className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm" placeholder="Password (demo)" defaultValue="password"/>
                </div>
            </div>
            
            <div>
                <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    onClick={handleLogin}
                >
                    Sign In / Sign Up
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
