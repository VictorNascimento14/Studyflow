import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // Pode customizar um loader/spinner aqui
        return <div>Carregando...</div>;
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
