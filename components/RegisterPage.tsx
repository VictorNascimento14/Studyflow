import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
        } else {
            // Sucesso! Pode redirecionar ou avisar para checar o email
            alert('Cadastro realizado com sucesso! Verifique seu e-mail (se configurado) ou faça login.');
            navigate('/login');
        }
        setLoading(false);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white min-h-screen flex flex-col items-center justify-center p-4">
            <div className="absolute top-5 left-5">
                <Link to="/login" className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-bold text-[#111418] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a3441] transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span>Voltar ao login</span>
                </Link>
            </div>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-4 text-[#111418] dark:text-white mb-4">
                        <div className="size-10 text-primary">
                            <span className="material-symbols-outlined text-4xl">school</span>
                        </div>
                        <h2 className="text-[#111418] dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em]">StudyFlow</h2>
                    </div>
                    <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Crie sua conta</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Comece sua jornada de estudos agora mesmo.</p>
                </div>

                <div className="bg-white dark:bg-[#111418] p-8 rounded-xl shadow-lg border border-[#e5e7eb] dark:border-[#2a3441]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleRegister} className="flex flex-col gap-5">
                        <label className="flex flex-col w-full">
                            <span className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Nome Completo</span>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#1a202c] focus:border-primary h-12 placeholder:text-[#9ca3af] px-4 text-base font-normal leading-normal transition-all"
                                placeholder="Seu nome"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </label>
                        <label className="flex flex-col w-full">
                            <span className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Email</span>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#1a202c] focus:border-primary h-12 placeholder:text-[#9ca3af] px-4 text-base font-normal leading-normal transition-all"
                                placeholder="seu@email.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>
                        <label className="flex flex-col w-full">
                            <span className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Senha</span>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#1a202c] focus:border-primary h-12 placeholder:text-[#9ca3af] px-4 text-base font-normal leading-normal transition-all"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 active:scale-95 text-white text-base font-bold leading-normal transition-all shadow-md mt-2 disabled:opacity-50"
                        >
                            {loading ? 'Criando conta...' : 'Cadastrar'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        Já tem uma conta? <Link to="/login" className="font-bold text-primary hover:underline">Faça login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
