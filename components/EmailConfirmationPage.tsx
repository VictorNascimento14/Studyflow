import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const EmailConfirmationPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Optional: Check if we actually have a session now (auto-login happens after link click sometimes)
        // If Supabase handles the session creation from the hash fragment automatically, we might be logged in.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // If already has session, maybe redirect to dashboard after a delay?
                // For now, let's just show the success message and let them choose.
            }
        };
        checkSession();
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-4 text-[#111418] dark:text-white mb-4">
                        <div className="size-16 text-green-500 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Email Confirmado!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Sua conta foi verificada com sucesso.</p>
                </div>

                <div className="bg-white dark:bg-[#111418] p-8 rounded-xl shadow-lg border border-[#e5e7eb] dark:border-[#2a3441] flex flex-col gap-4">
                    <p className="text-center text-[#111418] dark:text-white mb-2">
                        Agora você já pode acessar todas as funcionalidades do StudyFlow.
                    </p>

                    <Link
                        to="/login"
                        className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 active:scale-95 text-white text-base font-bold leading-normal transition-all shadow-md"
                    >
                        Ir para o Login
                    </Link>

                    <Link
                        to="/"
                        className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-gray-100 dark:bg-[#2a3441] hover:bg-gray-200 dark:hover:bg-[#374151] text-[#111418] dark:text-white text-base font-bold leading-normal transition-all"
                    >
                        Voltar para Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmationPage;
