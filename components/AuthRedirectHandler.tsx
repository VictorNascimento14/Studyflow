import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const AuthRedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const { isPasswordRecovery } = useAuth();

    useEffect(() => {
        // Redirect if context already knows we are in recovery mode
        if (isPasswordRecovery) {
            navigate('/reset-password');
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/reset-password');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate, isPasswordRecovery]);

    return null;
};

export default AuthRedirectHandler;
