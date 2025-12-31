import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
        } else {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="bg-gray-100 dark:bg-black min-h-screen flex items-center justify-center p-4 font-body transition-colors duration-300 relative overflow-hidden">

            {/* Camada de Background Estilizada (Trapezóide flutuante) */}
            <div className="fixed inset-0 z-0 w-full h-full pointer-events-none opacity-20 dark:opacity-40">
                <div className="w-[60vw] h-full clip-sharp bg-gray-900 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                </div>
            </div>

            {/* Container Principal do Card de Login */}
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl flex w-full max-w-[1200px] min-h-[750px] overflow-hidden transition-all duration-500">

                {/* LADO ESQUERDO: Imagem com Clip Path (Escondido em Mobile) */}
                <div className="clip-custom hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden bg-gray-900 text-white p-12 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center m-4 rounded-[32px]">
                    <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/90 via-black/20 to-black/10 pointer-events-none"></div>

                    <div className="relative z-10 flex justify-between items-center w-full">
                        <span className="font-display font-black tracking-widest text-lg italic text-primary drop-shadow-md">STUDYFLOW</span>
                        <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-wider">
                            <Link
                                to="/register"
                                className="hover:text-primary transition-colors text-white"
                            >
                                CADASTRAR
                            </Link>
                            <Link
                                to="/login"
                                className="border border-white/40 rounded-full px-6 py-2.5 hover:bg-white/10 transition-colors backdrop-blur-md"
                            >
                                ENTRAR
                            </Link>
                        </div>
                    </div>

                    <div className="relative z-10 max-w-sm">
                        <h3 className="text-4xl font-display font-black leading-tight italic uppercase mb-4">
                            Organize. Estude. Conquiste.
                        </h3>
                        <p className="text-white/70 text-sm font-medium leading-relaxed">
                            Transforme sua rotina de estudos com planejamento inteligente e acompanhamento de progresso em tempo real.
                        </p>
                    </div>


                </div>

                {/* LADO DIREITO: Formulário */}
                <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 lg:px-20 lg:py-16 bg-white dark:bg-gray-800 transition-colors duration-300">

                    <div className="flex justify-between items-center mb-16">
                        <div className="font-display font-black text-2xl tracking-tighter text-gray-900 dark:text-white uppercase italic">
                            STUDYFLOW<span className="text-primary">.</span>
                        </div>
                        <Link
                            to="/"
                            className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 text-xs font-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors uppercase tracking-widest group"
                        >
                            <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            <span>VOLTAR</span>
                        </Link>
                    </div>

                    <div className="flex flex-col flex-grow justify-center max-w-[420px] w-full mx-auto">
                        <div className="mb-12 text-center">
                            <h1 className="font-display font-black text-4xl lg:text-[46px] text-gray-900 dark:text-white mb-3 tracking-tighter italic uppercase">
                                Bem-vindo de Volta
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest opacity-60">
                                Continue sua jornada de estudos
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <input
                                        className="block px-6 py-4.5 w-full text-base text-gray-900 bg-gray-50/50 rounded-2xl border border-gray-100 appearance-none dark:text-white dark:bg-gray-900/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 font-medium"
                                        id="email"
                                        placeholder="Seu E-mail"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="relative group">
                                    <input
                                        className="block px-6 py-4.5 w-full text-base text-gray-900 bg-gray-50/50 rounded-2xl border border-gray-100 appearance-none dark:text-white dark:bg-gray-900/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 font-medium"
                                        id="password"
                                        placeholder="Sua Senha"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end pt-1">
                                <Link to="/forgot-password" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-colors">
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            <div className="relative flex py-4 items-center">
                                <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Ou entre com</span>
                                <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all font-bold text-xs shadow-sm uppercase tracking-widest" type="button">
                                    <img alt="Google" className="w-5 h-5" src="https://www.svgrepo.com/show/475656/google-color.svg" />
                                    Google
                                </button>
                                <button className="flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all font-bold text-xs shadow-sm uppercase tracking-widest" type="button">
                                    <i className="fab fa-github text-lg"></i>
                                    GitHub
                                </button>
                            </div>

                            <button
                                className="w-full px-4 py-4.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-btn-primary hover:shadow-glow hover:bg-primary-hover transition-all transform active:scale-[0.98] mt-8 flex items-center justify-center gap-3"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Entrando...' : 'Entrar no StudyFlow'}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </form>

                        <div className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                            Não tem uma conta?
                            <Link
                                to="/register"
                                className="text-primary hover:underline ml-2"
                            >
                                Cadastre-se
                            </Link>
                        </div>

                        <div className="mt-12 flex justify-center gap-6">
                            <a className="text-gray-400 hover:text-primary transition-colors" href="#"><i className="fab fa-facebook text-xl"></i></a>
                            <a className="text-gray-400 hover:text-primary transition-colors" href="#"><i className="fab fa-twitter text-xl"></i></a>
                            <a className="text-gray-400 hover:text-primary transition-colors" href="#"><i className="fab fa-linkedin-in text-xl"></i></a>
                            <a className="text-gray-400 hover:text-primary transition-colors" href="#"><i className="fab fa-instagram text-xl"></i></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão de Dark Mode Flutuante */}
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

export default LoginPage;