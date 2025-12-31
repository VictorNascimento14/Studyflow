import React, { useState, useEffect } from 'react';
import type { CourseNote, NoteColor, UnitLink } from '../types';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { dataService } from '../services/dataService';
import { supabase } from '../services/supabaseClient';

interface AvailableCourse {
    id: string;
    title: string;
    description: string | null;
    category: string;
    instructor_name: string | null;
    instructor_title: string | null;
}

interface CourseUnit {
    id: string;
    course_id: string;
    parent_id: string | null;
    title: string;
    description: string | null;
    content_type: string;
    duration: string | null;
    instructor_name: string | null;
    instructor_title: string | null;
    order_index: number;
    children?: CourseUnit[];
}

const noteColorPalette: Record<NoteColor, { colorClass: string; textColorClass: string; timestampColorClass: string; }> = {
    yellow: { colorClass: 'bg-[#fef3c7] dark:bg-[#4d4015]', textColorClass: 'text-yellow-900 dark:text-yellow-100', timestampColorClass: 'text-yellow-800 dark:text-yellow-200' },
    blue: { colorClass: 'bg-[#dbeafe] dark:bg-[#1e3a8a]', textColorClass: 'text-blue-900 dark:text-blue-100', timestampColorClass: 'text-blue-800 dark:text-blue-200' },
    green: { colorClass: 'bg-[#dcfce7] dark:bg-[#164e3b]', textColorClass: 'text-green-900 dark:text-green-100', timestampColorClass: 'text-green-800 dark:text-green-200' },
    purple: { colorClass: 'bg-[#e9d5ff] dark:bg-[#581c87]', textColorClass: 'text-purple-900 dark:text-purple-100', timestampColorClass: 'text-purple-800 dark:text-purple-200' },
    pink: { colorClass: 'bg-[#fce7f3] dark:bg-[#831843]', textColorClass: 'text-pink-900 dark:text-pink-100', timestampColorClass: 'text-pink-800 dark:text-pink-200' },
    orange: { colorClass: 'bg-[#ffedd5] dark:bg-[#7c2d12]', textColorClass: 'text-orange-900 dark:text-orange-100', timestampColorClass: 'text-orange-800 dark:text-orange-200' },
    white: { colorClass: 'bg-white dark:bg-gray-700', textColorClass: 'text-gray-800 dark:text-gray-100', timestampColorClass: 'text-gray-600 dark:text-gray-300' },
};

const CoursePage: React.FC = () => {
    const { user } = useAuth();
    const { isAdmin } = useAdmin();

    // Course selection state
    const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<AvailableCourse | null>(null);
    const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<CourseUnit | null>(null);
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
    const [showCourseSelector, setShowCourseSelector] = useState(false);

    // Progress state
    const [completedUnitIds, setCompletedUnitIds] = useState<Set<string>>(new Set());
    const [totalUnits, setTotalUnits] = useState(0);

    // Notes state
    const [notes, setNotes] = useState<CourseNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState<Partial<CourseNote> | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Admin content state
    const [summaryText, setSummaryText] = useState('');
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [newLink, setNewLink] = useState<UnitLink>({ title: '', url: '' });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Organization State
    const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
    const [organizeCurrentLevel, setOrganizeCurrentLevel] = useState<CourseUnit[]>([]);
    const [draggingItem, setDraggingItem] = useState<string | null>(null);

    const fetchAvailableCourses = async () => {
        const { data, error } = await supabase
            .from('available_courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setAvailableCourses(data);
        }
        setLoading(false);
    };

    const buildTree = (flatUnits: CourseUnit[]): CourseUnit[] => {
        const map = new Map<string, CourseUnit>();
        const roots: CourseUnit[] = [];
        flatUnits.forEach(unit => map.set(unit.id, { ...unit, children: [] }));
        flatUnits.forEach(unit => {
            const node = map.get(unit.id)!;
            if (unit.parent_id && map.has(unit.parent_id)) {
                map.get(unit.parent_id)!.children!.push(node);
            } else {
                roots.push(node);
            }
        });
        return roots;
    };

    const fetchCourseUnits = async (courseId: string) => {
        const { data, error } = await supabase
            .from('course_units')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index');

        if (!error && data) {
            const count = data.filter(u => ['lesson', 'video'].includes(u.content_type)).length;
            setTotalUnits(count);

            const tree = buildTree(data);
            setCourseUnits(tree);
            // Auto-expand first level
            const firstLevelIds = tree.map(u => u.id);
            setExpandedUnits(new Set(firstLevelIds));
        }
    };

    const fetchProgress = async (courseId: string) => {
        if (!user) return;
        try {
            const completedIds = await dataService.getCourseProgress(user.id, courseId);
            setCompletedUnitIds(new Set(completedIds));
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const getRandomRotation = () => {
        const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0'];
        return rotations[Math.floor(Math.random() * rotations.length)];
    };

    const fetchNotes = async (unitId: string) => {
        if (!user) return;
        try {
            const data = await dataService.getLessonNotes(user.id, unitId);
            setNotes(data.map(n => ({ ...n, rotationClass: getRandomRotation() })));
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    // Load last selected course from local storage
    useEffect(() => {
        const lastCourseId = localStorage.getItem('lastSelectedCourseId');
        if (lastCourseId && availableCourses.length > 0 && !selectedCourse) {
            const course = availableCourses.find(c => c.id === lastCourseId);
            if (course) {
                setSelectedCourse(course);
            } else {
                setShowCourseSelector(true);
            }
        } else if (availableCourses.length > 0 && !selectedCourse && !loading) {
            setShowCourseSelector(true);
        }
    }, [availableCourses, loading]);

    // Save selected course to local storage
    useEffect(() => {
        if (selectedCourse) {
            localStorage.setItem('lastSelectedCourseId', selectedCourse.id);
        }
    }, [selectedCourse]);

    useEffect(() => {
        fetchAvailableCourses();
    }, []);

    useEffect(() => {
        if (user && selectedUnit) {
            fetchNotes(selectedUnit.id);
        }
    }, [user, selectedUnit]);

    useEffect(() => {
        if (selectedCourse) {
            fetchCourseUnits(selectedCourse.id);
            if (user) fetchProgress(selectedCourse.id);
        }
    }, [selectedCourse, user]);

    useEffect(() => {
        if (selectedUnit) {
            setSummaryText(selectedUnit.summary || '');
            setSaveStatus('idle');
        }
    }, [selectedUnit]);

    const handleSaveSummary = async () => {
        if (!selectedUnit || !user) return;
        setSaveStatus('saving');
        try {
            await dataService.updateUnitSummary(selectedUnit.id, summaryText);
            setSelectedUnit({ ...selectedUnit, summary: summaryText });
            // await fetchCourseUnits(selectedCourse!.id); // Optional refresh
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 5000);
        } catch (error) {
            console.error('Error saving summary:', error);
            setSaveStatus('error');
        }
    };

    const handleAddLink = async () => {
        if (!selectedUnit || !user) return;
        if (!newLink.title || !newLink.url) return;

        const currentLinks = selectedUnit.important_links || [];
        const updatedLinks = [...currentLinks, newLink];

        try {
            await dataService.updateUnitLinks(selectedUnit.id, updatedLinks);
            setSelectedUnit({ ...selectedUnit, important_links: updatedLinks });
            setNewLink({ title: '', url: '' });
            setIsLinkModalOpen(false);
            await fetchCourseUnits(selectedCourse!.id);
        } catch (error) {
            console.error('Error saving link:', error);
        }
    };

    const handleDeleteLink = async (index: number) => {
        if (!selectedUnit || !user) return;
        if (!confirm('Tem certeza que deseja remover este link?')) return;
        const currentLinks = selectedUnit.important_links || [];
        const updatedLinks = currentLinks.filter((_, i) => i !== index);
        try {
            await dataService.updateUnitLinks(selectedUnit.id, updatedLinks);
            setSelectedUnit({ ...selectedUnit, important_links: updatedLinks });
            await fetchCourseUnits(selectedCourse!.id);
        } catch (error) {
            console.error('Error deleting link:', error);
        }
    };

    // Organization Handlers
    const handleOpenOrganize = () => {
        setIsOrganizeModalOpen(true);
        setOrganizeCurrentLevel(courseUnits);
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggingItem(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleSaveOrder = async () => {
        if (!user) return;
        try {
            const updates: { id: string; order_index: number; parent_id?: string | null }[] = [];

            // Iterate columns (Roots)
            organizeCurrentLevel.forEach((col, colIndex) => {
                // Update column order
                updates.push({
                    id: col.id,
                    order_index: colIndex
                    // parent_id should be kept as is (likely null for roots)
                });

                // Iterate children
                if (col.children) {
                    col.children.forEach((child, childIndex) => {
                        updates.push({
                            id: child.id,
                            order_index: childIndex,
                            parent_id: col.id
                        });
                    });
                }
            });

            await dataService.updateUnitOrder(updates);
            await fetchCourseUnits(selectedCourse!.id);
            alert('Alterações salvas com sucesso!');
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Erro ao salvar ordem.');
        }
    };



    const toggleExpand = (unitId: string) => {
        setExpandedUnits(prev => {
            const next = new Set(prev);
            if (next.has(unitId)) next.delete(unitId);
            else next.add(unitId);
            return next;
        });
    };

    const handleToggleComplete = async (unit: CourseUnit) => {
        if (!user || !selectedCourse) return;

        const isCompleted = completedUnitIds.has(unit.id);
        const newStatus = !isCompleted;

        // Optimistic update
        setCompletedUnitIds(prev => {
            const next = new Set(prev);
            if (newStatus) next.add(unit.id);
            else next.delete(unit.id);
            return next;
        });

        try {
            await dataService.toggleUnitCompletion(user.id, unit.id, selectedCourse.id, newStatus);
        } catch (error) {
            console.error('Error toggling completion:', error);
            // Revert on error
            setCompletedUnitIds(prev => {
                const next = new Set(prev);
                if (!newStatus) next.add(unit.id);
                else next.delete(unit.id);
                return next;
            });
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'lesson': return 'menu_book';
            case 'video': return 'play_circle';
            default: return 'folder';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'lesson': return 'text-blue-500';
            case 'video': return 'text-red-500';
            default: return 'text-yellow-500';
        }
    };

    const renderUnit = (unit: CourseUnit, level: number = 0): React.ReactNode => {
        const isExpanded = expandedUnits.has(unit.id);
        const hasChildren = unit.children && unit.children.length > 0;
        const isSelected = selectedUnit?.id === unit.id;
        const isCompleted = completedUnitIds.has(unit.id);

        // Calculate indentation
        const paddingLeft = 16 + (level * 20);

        return (
            <div key={unit.id} className="relative">
                {/* Connection Line for Children */}
                {level > 0 && (
                    <div
                        className="absolute w-px bg-gray-200 dark:bg-gray-700 h-full"
                        style={{ left: paddingLeft - 22, top: 0 }}
                    />
                )}

                <div
                    onClick={() => { setSelectedUnit(unit); setMobileMenuOpen(false); }}
                    className={`
                        group flex items-center gap-3 py-2.5 pr-4 my-0.5 rounded-r-lg mr-2 cursor-pointer transition-all duration-200 relative
                        ${isSelected
                            ? 'bg-primary/10 text-primary dark:bg-primary/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1f2937] hover:text-gray-900 dark:hover:text-gray-200'}
                    `}
                    style={{ paddingLeft: paddingLeft }}
                >
                    {/* Active Indicator Strip */}
                    {isSelected && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                    )}

                    {/* Expand/Collapse Control */}
                    <div className="flex-shrink-0 w-5 flex justify-center z-10 relative">
                        {hasChildren ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleExpand(unit.id); }}
                                className={`
                                    size-6 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10
                                    ${isExpanded ? 'rotate-90 text-primary' : 'text-gray-400'}
                                `}
                            >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
                        ) : (
                            // Visualization for leaf nodes to align with tree
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
                        )}
                    </div>

                    {/* Icon Container */}
                    <div className={`relative flex items-center justify-center transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
                        <span className={`material-symbols-outlined text-[20px] ${isCompleted ? 'text-green-500' : (isSelected ? 'text-primary' : `${getTypeColor(unit.content_type)} opacity-80 group-hover:opacity-100`)}`}>
                            {isCompleted ? 'check_circle' : getTypeIcon(unit.content_type)}
                        </span>
                    </div>

                    {/* Title & Info */}
                    <div className="flex-1 min-w-0">
                        <div
                            className={`text-sm truncate leading-snug ${isSelected ? 'font-bold' : 'font-medium'} ${isCompleted ? 'line-through opacity-60' : ''}`}
                            title={unit.title}
                        >
                            {unit.title}
                        </div>
                    </div>

                    {/* Duration Badge */}
                    {unit.duration && (
                        <span className="text-[10px] opacity-0 group-hover:opacity-60 transition-opacity font-mono tracking-tighter bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-current whitespace-nowrap ml-2">
                            {unit.duration}
                        </span>
                    )}
                </div>

                {/* Recursion */}
                {isExpanded && hasChildren && (
                    <div className="relative">
                        {/* Guide line extension for expanded folder content */}
                        <div
                            className="absolute w-px bg-gray-200 dark:bg-gray-800"
                            style={{ left: paddingLeft + 10, top: 0, bottom: 0 }}
                        />
                        {unit.children!.map(child => renderUnit(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Note handlers...
    const handleOpenModal = (note: CourseNote | null = null) => {
        setCurrentNote(note || { timestamp: '', content: '', color: 'yellow' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentNote(null);
    };

    const handleSaveNote = async () => {
        if (!currentNote || !currentNote.content || !user || !selectedUnit) return;
        try {
            // Note: Update dataService to match signature: (userId, unitId, note)
            const savedNote = await dataService.saveLessonNote(user.id, selectedUnit.id, currentNote);
            if (currentNote.id) {
                setNotes(notes.map(n => n.id === currentNote.id ? { ...currentNote as CourseNote } : n));
            } else if (savedNote) {
                setNotes([{ ...savedNote, rotationClass: getRandomRotation() }, ...notes]);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleDeleteNote = async (id: string) => {
        try {
            await dataService.deleteLessonNote(id);
            setNotes(notes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleNoteInputChange = (field: keyof Omit<CourseNote, 'id' | 'rotationClass'>, value: string) => {
        if (currentNote) {
            setCurrentNote({ ...currentNote, [field]: value });
        }
    };

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center font-display">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!selectedCourse) {
        return (
            <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="text-center max-w-md animate-[fadeIn_0.5s_ease-out]">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">school</span>
                        <h1 className="text-2xl font-bold mb-2">Meus Cursos</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            Selecione um curso para começar sua jornada de aprendizado.
                        </p>
                        <button
                            onClick={() => setShowCourseSelector(true)}
                            className="flex items-center gap-2 mx-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Selecionar Curso
                        </button>
                    </div>
                    {/* Course Selector Modal */}
                    {showCourseSelector && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                            <div className="bg-white dark:bg-[#1a202c] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl animate-[slideIn_0.3s_ease-out]">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#151c24]/50">
                                    <div>
                                        <h2 className="text-xl font-bold">Cursos Disponíveis</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Escolha um curso para iniciar</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCourseSelector(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto max-h-[60vh]">
                                    {availableCourses.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <div className="size-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="material-symbols-outlined text-3xl opacity-50">inbox</span>
                                            </div>
                                            <h3 className="text-lg font-bold mb-1">Nenhum curso encontrado</h3>
                                            <p>Você ainda não está inscrito em nenhum curso.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {availableCourses.map(course => (
                                                <div
                                                    key={course.id}
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        setShowCourseSelector(false);
                                                    }}
                                                    className="group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-all duration-200"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="size-14 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/20 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                            <span className="material-symbols-outlined text-3xl">school</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0 py-1">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{course.title}</h3>
                                                                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                                    {course.category}
                                                                </span>
                                                            </div>
                                                            {course.description && (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">{course.description}</p>
                                                            )}
                                                            {course.instructor_name && (
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                                    <span>{course.instructor_name}</span>
                                                                    {course.instructor_title && <span className="opacity-50">• {course.instructor_title}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                                            <span className="material-symbols-outlined text-primary">arrow_forward</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Calculate progress stats
    const completedCount = completedUnitIds.size;
    const progressPercentage = totalUnits > 0 ? Math.round((completedCount / totalUnits) * 100) : 0;

    // Course selected - show content
    return (
        <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden relative">
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden relative">
                {/* Sidebar with course structure */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-80 flex-shrink-0 bg-white dark:bg-[#111418] border-r border-[#e5e7eb] dark:border-[#2a3441] overflow-y-auto flex flex-col shadow-xl lg:shadow-none lg:static transition-transform duration-300 ease-in-out
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    {/* Course Header */}
                    <div className="p-5 border-b border-[#e5e7eb] dark:border-[#2a3441] bg-gray-50/50 dark:bg-[#151c24]/50">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-[#111418] dark:text-white leading-tight mb-1">{selectedCourse.title}</h3>
                                {selectedCourse.instructor_name && (
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {selectedCourse.instructor_name}
                                    </p>
                                )}
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={handleOpenOrganize}
                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    title="Organizar Estrutura"
                                >
                                    <span className="material-symbols-outlined text-lg">sort</span>
                                </button>
                            )}
                            <button
                                onClick={() => { setSelectedCourse(null); setSelectedUnit(null); setCourseUnits([]); }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Trocar curso"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Progress Cards Mini */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-white dark:bg-[#1a222d] p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 text-center shadow-sm">
                                <div className="size-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-1">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                </div>
                                <span className="text-lg font-bold block leading-none mb-0.5">{completedCount}/{totalUnits}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Concluídas</span>
                            </div>
                            <div className="bg-white dark:bg-[#1a222d] p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 text-center shadow-sm">
                                <div className="size-8 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-1">
                                    <span className="material-symbols-outlined text-lg">schedule</span>
                                </div>
                                <span className="text-lg font-bold block leading-none mb-0.5">{100 - progressPercentage}%</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Restante</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="font-medium text-gray-500">Progresso Geral</span>
                            <span className="font-bold text-primary">{progressPercentage}%</span>
                        </div>
                    </div>

                    {/* Course Units Tree */}
                    <div className="flex-1 overflow-y-auto p-3">
                        {courseUnits.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <span className="material-symbols-outlined text-3xl mb-2 opacity-50">folder_open</span>
                                <p>Nenhum conteúdo disponível</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {courseUnits.map(unit => renderUnit(unit))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark scroll-smooth w-full">
                    <div className="max-w-5xl mx-auto p-4 md:p-10 pb-24">
                        {/* Mobile Header for Content */}
                        <div className="lg:hidden mb-6 flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">menu_open</span>
                                <span className="text-sm font-bold">Ver Aulas</span>
                            </button>
                        </div>

                        {/* Selected Unit Header */}
                        {selectedUnit ? (
                            <div className="animate-[fadeIn_0.3s_ease-out]">
                                <div className="flex flex-col gap-6 mb-10 border-b border-[#e5e7eb] dark:border-[#2a3441] pb-8">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getTypeColor(selectedUnit.content_type)}`}>
                                                    <span className="material-symbols-outlined text-2xl">
                                                        {getTypeIcon(selectedUnit.content_type)}
                                                    </span>
                                                </div>
                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                                                    {selectedUnit.content_type === 'unit' ? 'Módulo' : selectedUnit.content_type === 'lesson' ? 'Aula' : selectedUnit.content_type}
                                                </span>
                                            </div>
                                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#111418] dark:text-white mb-4 leading-tight">
                                                {selectedUnit.title}
                                            </h1>

                                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                {selectedUnit.duration && (
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <span className="material-symbols-outlined text-lg text-orange-500">schedule</span>
                                                        <span className="font-medium">{selectedUnit.duration}</span>
                                                    </div>
                                                )}
                                                {selectedUnit.instructor_name && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                            <span className="material-symbols-outlined text-sm">person</span>
                                                        </div>
                                                        <span className="font-medium">{selectedUnit.instructor_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {['lesson', 'video'].includes(selectedUnit.content_type) && (
                                            <button
                                                onClick={() => handleToggleComplete(selectedUnit)}
                                                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shadow-sm w-full md:w-auto ${completedUnitIds.has(selectedUnit.id)
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                    : 'bg-primary text-white hover:bg-blue-600 shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined">
                                                    {completedUnitIds.has(selectedUnit.id) ? 'check_circle' : 'circle'}
                                                </span>
                                                {completedUnitIds.has(selectedUnit.id) ? 'Concluída' : 'Marcar como Concluída'}
                                            </button>
                                        )}
                                    </div>

                                    {selectedUnit.description && (
                                        <div className="bg-white dark:bg-[#1a202c] p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Sobre esta aula</h3>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                                                {selectedUnit.description}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Notes Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-2 text-[#111418] dark:text-white">
                                                <span className="material-symbols-outlined text-primary">sticky_note_2</span>
                                                Minhas Anotações
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">Capture suas ideias importantes desta aula</p>
                                        </div>
                                        <button
                                            onClick={() => handleOpenModal()}
                                            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-lg shadow-gray-200 dark:shadow-none"
                                        >
                                            <span className="material-symbols-outlined text-lg">add</span>
                                            <span className="hidden sm:inline">Adicionar Nota</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        <div
                                            onClick={() => handleOpenModal()}
                                            className="aspect-square bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-blue-50/50 dark:hover:bg-gray-800 transition-all group"
                                        >
                                            <div className="size-14 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                                <span className="material-symbols-outlined text-primary text-2xl">edit_note</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-500 group-hover:text-primary transition-colors">Nova anotação</span>
                                        </div>
                                        {notes.map(note => {
                                            const style = noteColorPalette[note.color] || noteColorPalette.yellow;
                                            return (
                                                <div key={note.id} className={`aspect-square p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 relative group flex flex-col ${style.colorClass} ${note.rotationClass} hover:scale-[1.02] hover:rotate-0`}>
                                                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal(note); }} className="size-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors">
                                                            <span className="material-symbols-outlined text-sm text-black/70 dark:text-white/90">edit</span>
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="size-8 rounded-full bg-black/10 hover:bg-red-500/80 text-black/70 dark:text-white/90 hover:text-white flex items-center justify-center transition-colors">
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                    <span className={`text-xs font-bold ${style.timestampColorClass} mb-3 block uppercase tracking-wider flex items-center gap-1`}>
                                                        <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                        {note.timestamp || 'Geral'}
                                                    </span>
                                                    <p className={`text-sm ${style.textColorClass} font-medium leading-relaxed flex-1 overflow-y-auto pr-1 scrollbar-hide`}>
                                                        {note.content}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Links importantes de atividades da unidade */}
                                <div className="mt-12">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <span className="material-symbols-outlined text-primary mr-2">link</span>
                                            <h3 className="text-xl font-bold text-[#111418] dark:text-white">Links importantes</h3>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => setIsLinkModalOpen(true)}
                                                className="text-sm font-bold text-primary hover:text-blue-600 flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">add</span>
                                                Adicionar Link
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Acesse rapidamente materiais, tarefas ou recursos relevantes desta unidade.</p>

                                    {(selectedUnit.important_links && selectedUnit.important_links.length > 0) ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedUnit.important_links.map((link, index) => (
                                                <div key={index} className="relative group">
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center p-4 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 w-full"
                                                    >
                                                        <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                                            <span className="material-symbols-outlined">link</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0 text-left">
                                                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate group-hover:text-primary transition-colors">{link.title}</h4>
                                                            <p className="text-xs text-gray-500 truncate mt-0.5">Clique para acessar</p>
                                                        </div>
                                                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
                                                    </a>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleDeleteLink(index);
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                                                            title="Remover link"
                                                        >
                                                            <span className="material-symbols-outlined text-xs font-bold leading-none">close</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <span className="text-sm text-gray-400">Nenhum link adicionado ainda.</span>
                                        </div>
                                    )}
                                </div>

                                {/* Resumo elaborado da unidade */}
                                <div className="mt-12">
                                    <div className="flex items-center mb-2">
                                        <span className="material-symbols-outlined text-primary mr-2">description</span>
                                        <h3 className="text-xl font-bold text-[#111418] dark:text-white">Resumo elaborado da unidade</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Faça um resumo detalhado dos principais pontos desta unidade para facilitar sua revisão.</p>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 shadow-sm space-y-2">
                                        {isAdmin ? (
                                            <>
                                                <textarea
                                                    className="w-full min-h-[120px] bg-transparent text-gray-700 dark:text-gray-200 outline-none resize-vertical p-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                                                    placeholder="Adicione aqui um resumo elaborado sobre o conteúdo desta unidade..."
                                                    value={summaryText}
                                                    onChange={e => setSummaryText(e.target.value)}
                                                />
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={handleSaveSummary}
                                                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center gap-2"
                                                        disabled={saveStatus === 'saving' || summaryText === selectedUnit.summary}
                                                    >
                                                        {saveStatus === 'saving' ? (
                                                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-lg">save</span>
                                                        )}
                                                        {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Resumo'}
                                                    </button>
                                                    {saveStatus === 'success' && (
                                                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center animate-[fadeIn_0.3s_ease-out] border border-green-200 dark:border-green-800">
                                                            <span className="material-symbols-outlined text-lg mr-1.5">check_circle</span>
                                                            Salvo com sucesso!
                                                        </span>
                                                    )}
                                                    {saveStatus === 'error' && (
                                                        <span className="text-red-500 text-sm font-bold flex items-center animate-[fadeIn_0.3s_ease-out]">
                                                            <span className="material-symbols-outlined text-lg mr-1">error</span>
                                                            Erro ao salvar
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                                {selectedUnit.summary || "Resumo disponível apenas para visualização. Entre em contato com o administrador para sugerir alterações."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20 md:py-32 animate-[fadeIn_0.5s_ease-out]">
                                <div className="size-40 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-slow"></div>
                                    <span className="material-symbols-outlined text-8xl text-gray-300 dark:text-gray-600">touch_app</span>
                                </div>
                                <h2 className="text-3xl font-bold text-[#111418] dark:text-white mb-3">Tudo pronto para começar!</h2>
                                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
                                    Selecione um módulo ou aula na barra lateral à esquerda para visualizar o conteúdo.
                                </p>
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="lg:hidden h-12 px-8 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 animate-[bounce_2s_infinite]"
                                >
                                    <span className="material-symbols-outlined">menu_open</span>
                                    <span>Conteúdo do Curso</span>
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Note Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 transform transition-all animate-[slideIn_0.3s_ease-out]">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold">{currentNote?.id ? 'Editar' : 'Nova'} Anotação</h3>
                        </div>
                        <div className="p-6 flex flex-col gap-5">
                            <label className="block">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Momento (Timestamp)</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">schedule</span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium"
                                        placeholder="ex: 05:30"
                                        value={currentNote?.timestamp || ''}
                                        onChange={(e) => handleNoteInputChange('timestamp', e.target.value)}
                                    />
                                </div>
                            </label>
                            <label className="block">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Conteúdo</span>
                                <textarea
                                    className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none text-base leading-relaxed"
                                    placeholder="Digite sua anotação aqui..."
                                    rows={5}
                                    value={currentNote?.content || ''}
                                    onChange={(e) => handleNoteInputChange('content', e.target.value)}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Cor do cartão</span>
                                <div className="flex gap-3">
                                    {Object.keys(noteColorPalette).map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => handleNoteInputChange('color', color as NoteColor)}
                                            className={`size-9 rounded-full transition-transform hover:scale-110 ${noteColorPalette[color as NoteColor].colorClass} ${currentNote?.color === color ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-[#1a202c]' : 'ring-1 ring-black/5 dark:ring-white/10'}`}
                                        />
                                    ))}
                                </div>
                            </label>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-[#151c24] border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveNote}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                            >
                                Salvar Anotação
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-[slideIn_0.3s_ease-out]">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold">Adicionar Link</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Título do Link</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Ex: Material Complementar"
                                    value={newLink.title}
                                    onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">URL</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="https://"
                                    value={newLink.url}
                                    onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-[#151c24] border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setIsLinkModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddLink}
                                className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Organize Modal (Kanban Board) */}
            {isOrganizeModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] border border-gray-200 dark:border-gray-700 animate-[slideIn_0.3s_ease-out] flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-[#1a202c] rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-[#111418] dark:text-white">Organizar Curso (Visualização em Quadro)</h3>
                                <p className="text-sm text-gray-500">Arraste as aulas entre os módulos ou reordene-as.</p>
                            </div>
                            <button onClick={() => setIsOrganizeModalOpen(false)} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-50 dark:bg-[#111418]">
                            <div className="flex gap-6 h-full items-start min-w-max">
                                {organizeCurrentLevel.map((column, colIndex) => (
                                    <div
                                        key={column.id}
                                        className="w-80 flex flex-col max-h-full bg-gray-100/50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!draggingItem) return;

                                            // Handle Reparenting (Move to this column)
                                            // Find the item anywhere in the tree (conceptually)
                                            // For now, we search in organizeCurrentLevel (roots) and their children

                                            // 1. Remove from old parent
                                            const newData = [...organizeCurrentLevel];
                                            let movedItem: CourseUnit | undefined;

                                            // Helper to find and remove
                                            const removeItem = (nodes: CourseUnit[]): boolean => {
                                                const idx = nodes.findIndex(n => n.id === draggingItem);
                                                if (idx !== -1) {
                                                    [movedItem] = nodes.splice(idx, 1);
                                                    return true;
                                                }
                                                for (const node of nodes) {
                                                    if (node.children && removeItem(node.children)) return true;
                                                }
                                                return false;
                                            };

                                            if (!removeItem(newData)) return; // Not found?

                                            // 2. Add to new parent (this column)
                                            const targetCol = newData.find(c => c.id === column.id);
                                            if (targetCol && movedItem) {
                                                if (!targetCol.children) targetCol.children = [];
                                                movedItem.parent_id = targetCol.id; // Update parent_id property logic locally
                                                targetCol.children.push(movedItem);
                                                setOrganizeCurrentLevel(newData);
                                            }
                                        }}
                                    >
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl sticky top-0 z-10">
                                            <h4 className="font-bold text-[#111418] dark:text-white flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-400">folder</span>
                                                {column.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">{column.children?.length || 0} itens</p>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[100px]">
                                            {column.children?.map((item, itemIndex) => (
                                                <div
                                                    key={item.id}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.stopPropagation();
                                                        handleDragStart(e, item.id);
                                                    }}
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        // Simple reorder within same column logic handled by parent drop? 
                                                        // Or specific logic here?
                                                        // For MVP Kanban, let's just support Drag to Column (Append).
                                                        // Reordering within column requires more precise Drop targets.
                                                        // Let's allow reordering if we are in the same column.
                                                        if (item.parent_id === column.id && draggingItem) {
                                                            // Logic for reorder within column
                                                            // ...
                                                        }
                                                    }}
                                                    className={`
                                                        p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm cursor-move group
                                                        ${draggingItem === item.id ? 'opacity-50 ring-2 ring-primary' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}
                                                    `}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <span className="material-symbols-outlined text-gray-300 text-base mt-0.5">drag_indicator</span>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{item.title}</p>
                                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded mt-2 inline-block">
                                                                {item.content_type === 'video' ? 'Vídeo' : 'Aula'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!column.children || column.children.length === 0) && (
                                                <div className="h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center p-4">
                                                    Arraste aulas para cá
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-[#1a202c] rounded-b-2xl">
                            <p className="text-sm text-gray-500">Módulos também podem ser reordenados arrastando os cabeçalhos (em breve).</p>
                            <div className="flex gap-3">
                                <button onClick={() => setIsOrganizeModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Fechar</button>
                                <button onClick={handleSaveOrder} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all">Salvar Alterações</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursePage;