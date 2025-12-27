import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Define route redirection to a page that handles the update (usually dashboard or a dedicated reset page)
        // For now, redirecting to login allows them to login with the new credentials or magic link logic
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password', // We might need to handle this route later if we want a dedicated password update screen
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            // Supabase generic success message for security (avoids email enumeration)
            setMessage({
                type: 'success',
                text: 'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.'
            });
        }
        setLoading(false);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white min-h-screen flex flex-col items-center justify-center p-4">
            <div className="absolute top-5 left-5">
                <Link to="/login" className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-bold text-[#111418] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a3441] transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span>Voltar ao Login</span>
                </Link>
            </div>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-4 text-[#111418] dark:text-white mb-4">
                        <div className="size-10 text-primary">
                            <span className="material-symbols-outlined text-4xl">lock_reset</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Redefinir Senha</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Informe seu e-mail para receber as instruções.</p>
                </div>

                <div className="bg-white dark:bg-[#111418] p-8 rounded-xl shadow-lg border border-[#e5e7eb] dark:border-[#2a3441]">
                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm border ${message.type === 'success'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleReset} className="flex flex-col gap-5">
                        <label className="flex flex-col w-full">
                            <span className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Email cadastrado</span>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#1a202c] focus:border-primary h-12 placeholder:text-[#9ca3af] px-4 text-base font-normal leading-normal transition-all"
                                placeholder="seu@email.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 active:scale-95 text-white text-base font-bold leading-normal transition-all shadow-md mt-2 disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
