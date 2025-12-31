
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage: React.FC = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white min-h-screen flex flex-col overflow-x-hidden">
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-[#2a3441] bg-white dark:bg-[#111418] px-10 py-3">
                <div className="flex items-center gap-4 text-[#111418] dark:text-white">
                    <div className="size-8 text-primary">
                        <span className="material-symbols-outlined text-3xl">school</span>
                    </div>
                    <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">StudyFlow</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="size-10 rounded-full bg-gray-100 dark:bg-[#2a3441] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#323d4d] transition-colors"
                        aria-label="Alternar tema"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    <Link to="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-[#111418] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-100 dark:hover:bg-[#2a3441] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                        <span className="truncate">Entrar</span>
                    </Link>
                    <Link to="/planner" className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors shadow-sm">
                        <span className="truncate">Usar gratuitamente</span>
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex flex-col">
                <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="flex-1 text-center lg:text-left z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary text-sm font-bold mb-6 border border-blue-100 dark:border-blue-800">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                                <span>Novo: Modo de Recuperação Intensiva</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111418] dark:text-white tracking-tight mb-6 leading-[1.1]">
                                Organize seus estudos <br className="hidden lg:block" />
                                <span className="text-primary">sem stress</span> e recupere o tempo perdido.
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Crie um plano de recuperação realista e personalizado em segundos. Diga adeus à ansiedade de provas acumuladas e saiba exatamente o que estudar hoje.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link to="/planner" className="w-full sm:w-auto px-8 h-14 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center">
                                    Usar gratuitamente
                                </Link>
                                <Link to="/login" className="text-[#111418] dark:text-white font-bold text-base hover:text-primary transition-colors flex items-center gap-2 px-6 h-14 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1e2732]">
                                    Já tenho uma conta
                                </Link>
                            </div>
                            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white dark:border-[#101922]"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white dark:border-[#101922]"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white dark:border-[#101922]"></div>
                                </div>
                                <p>Usado por mais de 10.000 estudantes</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 dark:opacity-30 animate-pulse"></div>
                            <div className="relative bg-white dark:bg-[#1a202c] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="h-12 border-b border-gray-100 dark:border-gray-700 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <div className="h-2 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                                            <div className="h-6 w-48 bg-gray-800 dark:bg-white rounded"></div>
                                        </div>
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs mb-1 font-medium text-gray-500">
                                            <span>Progresso Semanal</span>
                                            <span>75%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-3/4 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#202836]">
                                            <div className="w-10 h-10 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mr-3">
                                                <span className="material-symbols-outlined">functions</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-4 w-24 bg-gray-800 dark:bg-white rounded mb-1"></div>
                                                <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                            </div>
                                            <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded dark:bg-orange-900/20">Hoje</div>
                                        </div>
                                        <div className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1a202c]">
                                            <div className="w-10 h-10 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-3">
                                                <span className="material-symbols-outlined">biotech</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-4 w-32 bg-gray-800 dark:bg-white rounded mb-1"></div>
                                                <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                            </div>
                                            <div className="text-xs font-bold text-gray-400">Amanhã</div>
                                        </div>
                                        <div className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1a202c]">
                                            <div className="w-10 h-10 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3">
                                                <span className="material-symbols-outlined">history_edu</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-4 w-28 bg-gray-800 dark:bg-white rounded mb-1"></div>
                                                <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                            </div>
                                            <div className="text-xs font-bold text-gray-400">Sexta</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-20 bg-white dark:bg-[#151c24] border-t border-gray-100 dark:border-[#2a3441]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black text-[#111418] dark:text-white mb-4">Por que usar o StudyFlow?</h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Nossa abordagem prática foca no que realmente importa: fazer você aprender o conteúdo atrasado da forma mais eficiente possível.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-2xl bg-background-light dark:bg-[#101922] border border-gray-100 dark:border-[#2a3441] transition-all duration-300 ease-[cubic-bezier(.4,1.6,.4,1)] group shadow-sm hover:shadow-2xl hover:scale-[1.06] focus-within:scale-[1.06] focus-within:shadow-2xl cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_16px_2px_rgba(0,255,255,0.5)]">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform shadow group-hover:shadow-lg">
                                    <span className="material-symbols-outlined text-2xl">schedule</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-3">Planejamento Realista</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Insira suas horas livres reais. O algoritmo ajusta a carga de leitura e exercícios para caber no seu dia, sem promessas impossíveis.
                                </p>
                            </div>
                            <div className="p-8 rounded-2xl bg-background-light dark:bg-[#101922] border border-gray-100 dark:border-[#2a3441] transition-all duration-300 ease-[cubic-bezier(.4,1.6,.4,1)] group shadow-sm hover:shadow-2xl hover:scale-[1.06] focus-within:scale-[1.06] focus-within:shadow-2xl cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_16px_2px_rgba(0,255,255,0.5)]">
                                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform shadow group-hover:shadow-lg">
                                    <span className="material-symbols-outlined text-2xl">tune</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-3">Totalmente Personalizável</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Defina quais dias da semana você pode estudar e priorize as matérias mais críticas. Você está no controle do seu plano.
                                </p>
                            </div>
                            <div className="p-8 rounded-2xl bg-background-light dark:bg-[#101922] border border-gray-100 dark:border-[#2a3441] transition-all duration-300 ease-[cubic-bezier(.4,1.6,.4,1)] group shadow-sm hover:shadow-2xl hover:scale-[1.06] focus-within:scale-[1.06] focus-within:shadow-2xl cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_16px_2px_rgba(0,255,255,0.5)]">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform shadow group-hover:shadow-lg">
                                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#111418] dark:text-white mb-3">Acompanhamento Simples</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Marque o que foi concluído e veja seu progresso. Se perder um dia, nós recalculamos a rota para você não desanimar.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <footer className="bg-background-light dark:bg-[#101922] py-12 border-t border-gray-200 dark:border-[#2a3441]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="size-6 text-primary">
                                <span className="material-symbols-outlined text-2xl">school</span>
                            </div>
                            <span className="text-[#111418] dark:text-white font-bold">StudyFlow</span>
                        </div>
                        <div className="flex gap-8 text-sm text-gray-500 dark:text-gray-400">
                            <a className="hover:text-primary" href="#">Sobre</a>
                            <a className="hover:text-primary" href="#">Privacidade</a>
                            <a className="hover:text-primary" href="#">Termos</a>
                            <a className="hover:text-primary" href="#">Contato</a>
                        </div>
                        <div className="text-sm text-gray-400">
                            © 2025 StudyFlow. Todos os direitos reservados.
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default LandingPage;