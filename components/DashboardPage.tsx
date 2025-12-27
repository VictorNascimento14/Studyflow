import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { dataService, StudyPlanItem } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [planItems, setPlanItems] = useState<StudyPlanItem[]>([]);
    const [quickNote, setQuickNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingNote, setSavingNote] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [plans, note] = await Promise.all([
                    dataService.getStudyPlans(user.id),
                    dataService.getDashboardNote(user.id)
                ]);
                setPlanItems(plans);
                setQuickNote(note);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleToggleTask = async (itemId: string, currentStatus: boolean) => {
        try {
            await dataService.togglePlanStatus(itemId, !currentStatus);
            setPlanItems(items => items.map(item =>
                item.id === itemId ? { ...item, is_completed: !currentStatus, status: !currentStatus ? 'completed' : 'pending' } : item
            ));
        } catch (error) {
            console.error('Error toggling task status:', error);
        }
    };

    const handleClearNotes = async () => {
        if (!user) return;
        if (window.confirm('Tem certeza que deseja limpar suas anotações?')) {
            setQuickNote('');
            try {
                await dataService.saveDashboardNote(user.id, '');
            } catch (error) {
                console.error('Error clearing note:', error);
            }
        }
    };

    const handleSaveQuickNote = async () => {
        if (!user) return;
        setSavingNote(true);
        try {
            await dataService.saveDashboardNote(user.id, quickNote);
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setSavingNote(false);
        }
    };

    const progress = planItems.length > 0
        ? Math.round((planItems.filter(i => i.is_completed).length / planItems.length) * 100)
        : 0;

    const completedAulas = planItems.filter(i => i.is_completed).length;
    const totalAulas = planItems.length;

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Summary Card */}
                        <div className="bg-white dark:bg-[#111418] rounded-xl p-6 shadow-sm border border-[#e5e7eb] dark:border-[#2a3441]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Seu Plano de Recuperação</h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                        {totalAulas > 0
                                            ? `Mantenha o ritmo! Você já recuperou ${progress}% do conteúdo atrasado.`
                                            : "Você ainda não tem um plano ativo. Comece agora!"}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold text-[#111418] dark:text-white">Progresso Geral</span>
                                    <span className="text-3xl font-black text-primary">{progress}%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 mb-6 overflow-hidden relative">
                                <div className="bg-primary h-full rounded-full transition-all duration-500 relative overflow-hidden" style={{ width: `${progress}%` }}>
                                    <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="text-center md:text-left">
                                    <span className="block text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">Aulas Completas</span>
                                    <span className="font-bold text-lg text-[#111418] dark:text-white">{completedAulas} <span className="text-xs font-normal text-gray-400">/ {totalAulas}</span></span>
                                </div>
                                <div className="text-center md:text-left border-l border-gray-100 dark:border-gray-800 pl-4">
                                    <span className="block text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">Itens Restantes</span>
                                    <span className="font-bold text-lg text-[#111418] dark:text-white">{totalAulas - completedAulas}</span>
                                </div>
                                <div className="text-center md:text-left border-l border-gray-100 dark:border-gray-800 pl-4">
                                    <span className="block text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">Status Geral</span>
                                    <span className={`font-bold text-lg ${progress === 100 ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
                                        {progress === 100 ? 'Finalizado' : progress > 0 ? 'Em progresso' : 'Não iniciado'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Schedule / Plan Items */}
                        <div className="flex flex-col gap-5">
                            <div className="flex justify-between items-end">
                                <h2 className="text-xl font-bold text-[#111418] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                                    {totalAulas > 0 ? "Cronograma da Semana" : "Sem tarefas pendentes"}
                                </h2>
                            </div>

                            {planItems.length > 0 ? (
                                <div className="bg-white dark:bg-[#111418] rounded-xl border border-[#e5e7eb] dark:border-[#2a3441] overflow-hidden shadow-sm">
                                    <div className="bg-blue-50/50 dark:bg-[#1a202c] px-6 py-3 border-b border-[#e5e7eb] dark:border-[#2a3441] flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary text-xl">today</span>
                                            <span className="font-bold text-[#111418] dark:text-white">Tarefas Ativas</span>
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded dark:bg-blue-900/30 dark:text-blue-400">{planItems.length} tarefas</span>
                                    </div>
                                    <div className="divide-y divide-[#e5e7eb] dark:divide-[#2a3441]">
                                        {planItems.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleToggleTask(item.id, item.is_completed)}
                                                className={`group p-4 sm:px-6 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-[#1a202c]/50 transition-colors cursor-pointer ${item.is_completed ? 'bg-gray-50/50 dark:bg-gray-900/20' : ''}`}
                                            >
                                                <button className={`mt-1 transition-colors ${item.is_completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-primary'}`}>
                                                    <span className="material-symbols-outlined">
                                                        {item.is_completed ? 'check_circle' : 'radio_button_unchecked'}
                                                    </span>
                                                </button>
                                                <div className={`flex-1 ${item.is_completed ? 'opacity-50' : ''}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-base font-medium text-[#111418] dark:text-white ${item.is_completed ? 'line-through decoration-gray-400' : ''}`}>
                                                            {item.title}
                                                        </h4>
                                                        {item.is_completed && (
                                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Concluído</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]">schedule</span> {item.duration}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#111418] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 flex flex-col items-center text-center gap-4">
                                    <div className="size-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-4xl">event_busy</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#111418] dark:text-white">Nada por aqui ainda</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2">
                                            Crie seu primeiro plano de estudos para começar a organizar sua recuperação acadêmica.
                                        </p>
                                    </div>
                                    <Link to="/planner" className="h-10 px-6 bg-primary text-white rounded-lg flex items-center gap-2 font-bold hover:bg-blue-600 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-lg">add</span>
                                        Criar Meu Plano
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Adjust Plan Card */}
                        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-[#111418] dark:to-[#1a202c] rounded-xl p-6 border border-blue-100 dark:border-[#2a3441] shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-primary text-white p-2 rounded-lg shadow-sm">
                                    <span className="material-symbols-outlined text-xl">tune</span>
                                </div>
                                <h3 className="font-bold text-[#111418] dark:text-white">Ajustar Plano</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                                {totalAulas > 0
                                    ? "Perdeu mais aulas ou sua disponibilidade mudou? Recalcule o cronograma."
                                    : "Configure suas matérias e disponibilidade para gerar um cronograma personalizado."}
                            </p>
                            <Link to="/planner" className="w-full h-10 bg-white dark:bg-[#2a3441] border border-gray-200 dark:border-gray-600 text-sm font-bold text-[#111418] dark:text-white rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-[#323d4d] transition-colors flex items-center justify-center gap-2 group">
                                <span className="material-symbols-outlined text-lg text-primary group-hover:rotate-45 transition-transform">
                                    {totalAulas > 0 ? 'refresh' : 'rocket_launch'}
                                </span>
                                <span>{totalAulas > 0 ? 'Recalcular Rotina' : 'Começar Agora'}</span>
                            </Link>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Tem certeza que deseja zerar seu plano? Todo o progresso será perdido.')) {
                                        if (user) {
                                            try {
                                                await dataService.deleteStudyPlan(user.id);
                                                setPlanItems([]);
                                            } catch (error) {
                                                console.error('Error deleting plan:', error);
                                                alert('Erro ao resetar o plano.');
                                            }
                                        }
                                    }
                                }}
                                className="w-full mt-2 h-10 border border-red-200 dark:border-red-900/30 text-sm font-bold text-red-600 dark:text-red-400 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">delete_forever</span>
                                <span>Resetar Plano</span>
                            </button>
                        </div>

                        {/* Quick Notes */}
                        <div className="bg-yellow-50 dark:bg-[#1a202c] rounded-xl border border-yellow-200 dark:border-[#2a3441] shadow-sm flex flex-col h-[320px] relative overflow-hidden">
                            <div className="absolute top-0 w-full h-1 bg-yellow-400"></div>
                            <div className="p-4 border-b border-yellow-100 dark:border-[#2a3441] flex justify-between items-center bg-yellow-50/50 dark:bg-[#1a202c]">
                                <h3 className="font-bold text-[#111418] dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-500">sticky_note_2</span>
                                    Notas Rápidas
                                </h3>
                            </div>
                            <div className="flex-1 p-0 relative">
                                <textarea
                                    className="w-full h-full resize-none border-0 focus:ring-0 bg-transparent p-4 text-sm text-[#111418] dark:text-white placeholder-gray-400 leading-relaxed"
                                    placeholder="- Revisar fórmulas de integrais&#x0a;- Perguntar ao professor sobre o prazo do trabalho..."
                                    value={quickNote}
                                    onChange={(e) => setQuickNote(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="p-2 border-t border-yellow-100 dark:border-[#2a3441] bg-yellow-50 dark:bg-[#1a202c] flex justify-end gap-2">
                                <button
                                    onClick={handleClearNotes}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Apagar anotações"
                                >
                                    Limpar
                                </button>
                                <button
                                    onClick={handleSaveQuickNote}
                                    disabled={savingNote}
                                    className="text-xs font-bold text-yellow-800 dark:text-yellow-400 px-3 py-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded transition-colors disabled:opacity-50"
                                >
                                    {savingNote ? 'Salvando...' : 'Salvar Nota'}
                                </button>
                            </div>
                        </div>

                        {/* Study Tip */}
                        <div className="bg-purple-50 dark:bg-[#1a202c] p-4 rounded-xl border border-purple-100 dark:border-[#2a3441] flex gap-3">
                            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">lightbulb</span>
                            <p className="text-xs text-purple-900 dark:text-purple-300 leading-normal">
                                <span className="font-bold block mb-1">Dica de Estudo:</span>
                                Comece pelas matérias com mais aulas perdidas para reduzir a ansiedade.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default DashboardPage;