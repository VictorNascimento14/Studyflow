import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Subject } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { generateStudyPlanLocal } from '../services/planCalculator';
import { exportPlanToPDF } from '../services/pdfService';

const initialSubjects: Subject[] = [
    { id: 1, name: '', missedClasses: 0 },
];

const dayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

const PlannerPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [hoursPerDay, setHoursPerDay] = useState<number>(3.5);
    const [studyDays, setStudyDays] = useState<number[]>([0, 1, 2, 3, 4, 6]);
    const [isSaving, setIsSaving] = useState(false);

    const totalMissedClasses = useMemo(() => {
        return subjects.reduce((total, sub) => total + (Number(sub.missedClasses) || 0), 0);
    }, [subjects]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleSubjectChange = (id: number, field: keyof Omit<Subject, 'id'>, value: string | number) => {
        setSubjects(subjects.map(sub => sub.id === id ? { ...sub, [field]: value } : sub));
    };

    const addSubject = () => {
        setSubjects([...subjects, { id: Date.now(), name: '', missedClasses: 0 }]);
    };

    const removeSubject = (id: number) => {
        setSubjects(subjects.filter(sub => sub.id !== id));
    };

    const toggleStudyDay = (dayIndex: number) => {
        setStudyDays(prev =>
            prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
        );
    };



    const generatePDFOnly = async () => {
        const validSubjects = subjects.filter(s => s.name.trim() !== '');
        if (validSubjects.length === 0) {
            alert('Por favor, adicione pelo menos uma disciplina.');
            return;
        }

        console.log('Generating PDF manually:', { validSubjects, hoursPerDay, studyDays });
        const plan = generateStudyPlanLocal(validSubjects, hoursPerDay, studyDays);
        exportPlanToPDF(plan);
        alert('Download do PDF iniciado!');
    };

    const generatePlan = async () => {
        const validSubjects = subjects.filter(s => s.name.trim() !== '');
        if (validSubjects.length === 0) {
            alert('Por favor, adicione pelo menos uma disciplina.');
            return;
        }

        setIsSaving(true);
        try {
            if (user) {
                // Member Flow: Save to Supabase
                await dataService.saveStudyPlan(user.id, validSubjects);
                await dataService.createProfile({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || null,
                    total_progress: 0
                });
                navigate('/dashboard');
            } else {
                // Guest Flow: Calculate plan locally + PDF Export
                console.log('Generating plan with:', { validSubjects, hoursPerDay, studyDays });
                const plan = generateStudyPlanLocal(validSubjects, hoursPerDay, studyDays);
                console.log('Generated plan:', plan);
                exportPlanToPDF(plan);
                alert('Seu plano foi gerado e o download do PDF começou! Para salvar seus dados e ter uma experiência completa, crie uma conta.');
            }
        } catch (error) {
            console.error('Error generating plan:', error);
            alert('Erro ao processar plano. Tente novamente. Detalhes: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <header className="flex lg:hidden items-center justify-between p-4 bg-white dark:bg-[#111418] border-b border-[#e5e7eb] dark:border-[#2a3441]">
                <div className="flex items-center gap-2 text-[#111418] dark:text-white">
                    <div className="size-8 text-primary">
                        <span className="material-symbols-outlined text-3xl">school</span>
                    </div>
                    <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">StudyFlow</h2>
                </div>
                <div className="flex items-center gap-4">
                    <Link to={user ? "/dashboard" : "/"} className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-bold text-[#111418] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a3441] transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Voltar</span>
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
                <div className="w-full max-w-[800px] flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#111418] p-8 rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441]">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h1 className="text-[#111418] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Planejador de Recuperação</h1>
                                {!user && (
                                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
                                        Modo Visitante
                                    </span>
                                )}
                            </div>
                            <p className="text-[#617589] dark:text-[#9ca3af] text-base font-normal leading-normal">
                                {user
                                    ? 'Insira sua carga horária perdida e o tempo disponível para criar um cronograma de recuperação realista.'
                                    : 'Como visitante, nossa IA calculará o melhor plano para você e gerará um PDF. Seus dados não serão salvos.'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#111418] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] overflow-hidden">
                        <div className="p-8 border-b border-[#e5e7eb] dark:border-[#2a3441]">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">library_books</span>
                                <h3 className="text-[#111418] dark:text-white tracking-light text-xl font-bold leading-tight">Conteúdo Atrasado</h3>
                            </div>
                            <div className="flex flex-col gap-4" id="subjects-list">
                                {subjects.map((subject) => (
                                    <div key={subject.id} className="flex flex-col md:flex-row gap-4 items-end">
                                        <label className="flex flex-col flex-1 w-full">
                                            <span className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Nome da Disciplina</span>
                                            <input
                                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#1a202c] focus:border-primary h-12 placeholder:text-[#9ca3af] px-4 text-base font-normal leading-normal transition-all"
                                                placeholder="ex: Química Orgânica"
                                                type="text"
                                                value={subject.name}
                                                onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                                            />
                                        </label>
                                        <label className="flex flex-col w-full md:w-48">
                                            <span className="text-[#111418] dark:text-white text-sm font-medium leading-normal pb-2">Aulas Perdidas</span>
                                            <div className="flex items-center h-12 border border-[#dbe0e6] dark:border-[#374151] rounded-lg bg-white dark:bg-[#1a202c] overflow-hidden">
                                                <button
                                                    onClick={() => {
                                                        const current = Number(subject.missedClasses) || 0;
                                                        if (current > 0) handleSubjectChange(subject.id, 'missedClasses', current - 1);
                                                    }}
                                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a3441] hover:text-primary transition-colors border-r border-[#dbe0e6] dark:border-[#374151]"
                                                >
                                                    <span className="material-symbols-outlined text-lg">remove</span>
                                                </button>
                                                <div className="flex-1 relative h-full">
                                                    <input
                                                        className="w-full h-full text-center text-[#111418] dark:text-white bg-transparent outline-none border-none placeholder:text-[#9ca3af] font-medium appearance-none"
                                                        min="0"
                                                        placeholder="0"
                                                        type="number"
                                                        value={subject.missedClasses || ''}
                                                        onChange={(e) => handleSubjectChange(subject.id, 'missedClasses', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const current = Number(subject.missedClasses) || 0;
                                                        handleSubjectChange(subject.id, 'missedClasses', current + 1);
                                                    }}
                                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a3441] hover:text-primary transition-colors border-l border-[#dbe0e6] dark:border-[#374151]"
                                                >
                                                    <span className="material-symbols-outlined text-lg">add</span>
                                                </button>
                                            </div>
                                        </label>
                                        <button
                                            aria-label="Remover disciplina"
                                            onClick={() => removeSubject(subject.id)}
                                            disabled={subjects.length <= 1}
                                            className="h-12 w-12 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <button onClick={addSubject} className="flex items-center gap-2 text-primary font-bold text-sm hover:text-blue-700 transition-colors">
                                    <span className="material-symbols-outlined text-lg">add_circle</span>
                                    <span>Adicionar Outra Disciplina</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                                <h3 className="text-[#111418] dark:text-white tracking-light text-xl font-bold leading-tight">Disponibilidade</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-4">
                                    <label className="text-[#111418] dark:text-white text-sm font-medium leading-normal">Tempo Livre por Dia</label>
                                    <div className="bg-background-light dark:bg-[#1a202c] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#374151]">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Horas</span>
                                            <span className="text-2xl font-black text-primary">{hoursPerDay.toFixed(1)} <span className="text-sm font-normal text-gray-500">h</span></span>
                                        </div>
                                        <input
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700"
                                            max="12"
                                            min="0.5"
                                            step="0.5"
                                            type="range"
                                            value={hoursPerDay}
                                            onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <label className="text-[#111418] dark:text-white text-sm font-medium leading-normal">Dias de Estudo</label>
                                    <div className="flex flex-wrap gap-2">
                                        {dayLabels.map((day, index) => (
                                            <button
                                                key={index}
                                                onClick={() => toggleStudyDay(index)}
                                                className={`h-10 w-10 rounded-full font-bold text-sm transition-colors ${studyDays.includes(index)
                                                    ? 'bg-primary text-white hover:bg-blue-600'
                                                    : 'bg-white dark:bg-[#1a202c] border border-gray-300 dark:border-gray-600 text-gray-500'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50 dark:bg-[#151c24] border-t border-[#e5e7eb] dark:border-[#2a3441] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-center sm:text-left">
                                <p className="text-sm font-medium text-[#111418] dark:text-white">Estimativa do Resumo</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total de <span className="font-bold text-primary">{totalMissedClasses} aulas atrasadas</span>.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                {user && (
                                    <button
                                        onClick={generatePDFOnly}
                                        disabled={isSaving}
                                        className="flex w-full sm:w-auto min-w-[200px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 border-2 border-primary text-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 text-base font-bold transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <span className="mr-2 material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                        <span className="truncate">Gerar Apenas PDF</span>
                                    </button>
                                )}
                                <button
                                    onClick={generatePlan}
                                    disabled={isSaving}
                                    className="flex w-full sm:w-auto min-w-[200px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 text-white text-base font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <span className="mr-2 material-symbols-outlined text-[20px]">auto_awesome</span>
                                    <span className="truncate">{isSaving ? 'Gerando...' : 'Gerar Meu Plano'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default PlannerPage;
