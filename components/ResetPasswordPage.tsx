import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const navigate = useNavigate();

    // Check if we have a session (which happens after clicking the email link)
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, the link might be invalid or expired
                setMessage({ type: 'error', text: 'Link inválido ou expirado. Por favor, solicite uma nova redefinição.' });
            }
        });
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Senha atualizada com sucesso! Redirecionando...' });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
        setLoading(false);
    };

    return (
        <div className="bg-gray-100 dark:bg-black min-h-screen flex items-center justify-center p-4 font-body transition-colors duration-300 relative overflow-hidden">

            {/* Background Layer */}
            <div className="fixed inset-0 z-0 w-full h-full pointer-events-none opacity-20 dark:opacity-40">
                <div className="w-[60vw] h-full clip-sharp bg-gray-900 bg-[url('https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                </div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl flex w-full max-w-[1200px] min-h-[750px] overflow-hidden transition-all duration-500">

                {/* Left Side (Image) */}
                <div className="clip-custom hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden bg-gray-900 text-white p-12 bg-[url('https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center m-4 rounded-[32px]">
                    <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/90 via-black/20 to-black/10 pointer-events-none"></div>

                    <div className="relative z-10 flex justify-between items-center w-full">
                        <span className="font-display font-black tracking-widest text-lg italic text-primary drop-shadow-md">STUDYFLOW</span>
                    </div>

                    <div className="relative z-10 max-w-sm">
                        <h3 className="text-4xl font-display font-black leading-tight italic uppercase mb-4">
                            Nova Senha.
                        </h3>
                        <p className="text-white/70 text-sm font-medium leading-relaxed">
                            Crie uma senha forte para manter sua conta segura e continue sua jornada de aprendizado.
                        </p>
                    </div>
                </div>

                {/* Right Side (Form) */}
                <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 lg:px-20 lg:py-16 bg-white dark:bg-gray-800 transition-colors duration-300">

                    <div className="flex justify-between items-center mb-16">
                        <div className="font-display font-black text-2xl tracking-tighter text-gray-900 dark:text-white uppercase italic">
                            STUDYFLOW<span className="text-primary">.</span>
                        </div>
                    </div>

                    <div className="flex flex-col flex-grow justify-center max-w-[420px] w-full mx-auto">
                        <div className="mb-12 text-center">
                            <h1 className="font-display font-black text-4xl lg:text-[46px] text-gray-900 dark:text-white mb-3 tracking-tighter italic uppercase">
                                Definir Senha
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest opacity-60">
                                Cria sua nova senha de acesso
                            </p>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                            {message && (
                                <div className={`p-4 rounded-2xl text-sm font-bold border-2 ${message.type === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <input
                                        className="block px-6 py-4.5 w-full text-base text-gray-900 bg-gray-50/50 rounded-2xl border border-gray-100 appearance-none dark:text-white dark:bg-gray-900/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 font-medium"
                                        type="password"
                                        placeholder="Nova Senha"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input
                                        className="block px-6 py-4.5 w-full text-base text-gray-900 bg-gray-50/50 rounded-2xl border border-gray-100 appearance-none dark:text-white dark:bg-gray-900/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 font-medium"
                                        type="password"
                                        placeholder="Confirmar Nova Senha"
                                        required
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                className="w-full px-4 py-4.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-btn-primary hover:shadow-glow hover:bg-primary-hover transition-all transform active:scale-[0.98] mt-8 flex items-center justify-center gap-3"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Atualizando...' : 'Atualizar Senha'}
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link to="/" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors">
                                Cancelar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    className="bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-primary transition-all group"
                    onClick={() => document.documentElement.classList.toggle('dark')}
                >
                    <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">dark_mode</span>
                </button>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
