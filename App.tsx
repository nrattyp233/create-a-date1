
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import SwipePage from './pages/SwipePage';
import MarketplacePage from './pages/MarketplacePage';
import MatchesPage from './pages/MatchesPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/layout/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
    const { user, backgroundStyle } = useAuth();

    return (
        <div 
            className="w-full min-h-screen font-sans text-white bg-gray-900 transition-all duration-1000" 
            style={backgroundStyle}
        >
            <div className="w-full min-h-screen bg-black bg-opacity-50">
                <HashRouter>
                    <Routes>
                        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
                        <Route 
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Routes>
                                            <Route path="/" element={<SwipePage />} />
                                            <Route path="/marketplace" element={<MarketplacePage />} />
                                            <Route path="/matches" element={<MatchesPage />} />
                                            <Route path="/profile" element={<ProfilePage />} />
                                        </Routes>
                                    </Layout>
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </HashRouter>
            </div>
        </div>
    );
};

const App: React.FC = () => (
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
);

export default App;
