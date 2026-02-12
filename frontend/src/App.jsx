import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AccountDetail from './components/AccountDetail';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;
    if (!user) return <Navigate to="/login" />;

    return <Layout>{children}</Layout>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;
    if (user) return <Navigate to="/" />;

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                    {/* Protected Routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/account/:id" element={
                        <ProtectedRoute>
                            <AccountDetail />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
