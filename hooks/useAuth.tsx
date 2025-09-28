
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import { CURRENT_USER } from '../constants';
import { seedIfEmpty, getCurrentUser, setCurrentUser, updateCurrentUser as storageUpdateUser, getBackgroundImage as storageGetBg, setBackgroundImage as storageSetBg } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  backgroundStyle: React.CSSProperties;
  setBackgroundImage: (imageUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('https://picsum.photos/id/119/1920/1080');

  // Seed local storage and restore session/background on first load
  useEffect(() => {
    seedIfEmpty();
    const savedUser = getCurrentUser();
    if (savedUser) setUser(savedUser);
    const bg = storageGetBg();
    if (bg) setBackgroundImage(bg);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setCurrentUser(userData);
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };
  
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const next = { ...user, ...userData } as User;
      setUser(next);
      storageUpdateUser(userData);
    }
  };

  const backgroundStyle = useMemo<React.CSSProperties>(() => ({
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
  }), [backgroundImage]);


  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, backgroundStyle, setBackgroundImage: (url: string) => { setBackgroundImage(url); storageSetBg(url); } }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
