import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const AuthRedirectHandler: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/reset-password');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);

    return null;
};

export default AuthRedirectHandler;
