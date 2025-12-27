import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface CourseUnit {
    id: string;
    course_id: string;
    parent_id: string | null;
    title: string;
    description: string | null;
    content_type: string;
    duration: string | null;
    video_url: string | null;
    order_index: number;
    instructor_name: string | null;
    instructor_title: string | null;
    children?: CourseUnit[];
}

interface CourseEditorProps {
    courseId: string;
    courseName: string;
    onClose: () => void;
}

const CourseEditor: React.FC<CourseEditorProps> = ({ courseId, courseName, onClose }) => {
    const [units, setUnits] = useState<CourseUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingUnit, setEditingUnit] = useState<CourseUnit | null>(null);
    const [parentId, setParentId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [contentType, setContentType] = useState('unit');
    const [duration, setDuration] = useState('');
    const [instructorName, setInstructorName] = useState('');
    const [instructorTitle, setInstructorTitle] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUnits();
    }, [courseId]);

    const fetchUnits = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('course_units')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index');

        if (error) {
            console.error('Error fetching units:', error);
        } else {
            // Build tree structure
            const tree = buildTree(data || []);
            setUnits(tree);
        }
        setLoading(false);
    };

    const buildTree = (flatUnits: CourseUnit[]): CourseUnit[] => {
        const map = new Map<string, CourseUnit>();
        const roots: CourseUnit[] = [];

        flatUnits.forEach(unit => {
            map.set(unit.id, { ...unit, children: [] });
        });

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

    const toggleExpand = (unitId: string) => {
        setExpandedUnits(prev => {
            const next = new Set(prev);
            if (next.has(unitId)) {
                next.delete(unitId);
            } else {
                next.add(unitId);
            }
            return next;
        });
    };

    const openAddForm = (parentId: string | null = null) => {
        setParentId(parentId);
        setEditingUnit(null);
        setTitle('');
        setDescription('');
        setContentType('unit');
        setDuration('');
        setInstructorName('');
        setInstructorTitle('');
        setShowForm(true);
    };

    const openEditForm = (unit: CourseUnit) => {
        setParentId(unit.parent_id);
        setEditingUnit(unit);
        setTitle(unit.title);
        setDescription(unit.description || '');
        setContentType(unit.content_type);
        setDuration(unit.duration || '');
        setInstructorName(unit.instructor_name || '');
        setInstructorTitle(unit.instructor_title || '');
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setSaving(true);

        const unitData = {
            course_id: courseId,
            parent_id: parentId,
            title: title.trim(),
            description: description.trim() || null,
            content_type: contentType,
            duration: duration || null,
            instructor_name: instructorName.trim() || null,
            instructor_title: instructorTitle.trim() || null,
            order_index: units.length,
        };

        if (editingUnit) {
            const { error } = await supabase
                .from('course_units')
                .update(unitData)
                .eq('id', editingUnit.id);

            if (error) {
                alert('Erro ao atualizar: ' + error.message);
            }
        } else {
            const { error } = await supabase
                .from('course_units')
                .insert(unitData);

            if (error) {
                alert('Erro ao criar: ' + error.message);
            }
        }

        setSaving(false);
        setShowForm(false);
        fetchUnits();
    };

    const handleDelete = async (unitId: string) => {
        if (!confirm('Excluir esta unidade e todas as sub-unidades?')) return;

        const { error } = await supabase
            .from('course_units')
            .delete()
            .eq('id', unitId);

        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchUnits();
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'lesson': return 'menu_book';
            case 'video': return 'play_circle';
            case 'quiz': return 'quiz';
            default: return 'folder';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'lesson': return 'text-blue-500';
            case 'video': return 'text-red-500';
            case 'quiz': return 'text-green-500';
            default: return 'text-yellow-500';
        }
    };

    const renderUnit = (unit: CourseUnit, level: number = 0): React.ReactNode => {
        const isExpanded = expandedUnits.has(unit.id);
        const hasChildren = unit.children && unit.children.length > 0;

        return (
            <div key={unit.id} style={{ marginLeft: level * 20 }}>
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a3441] group">
                    {hasChildren ? (
                        <button
                            onClick={() => toggleExpand(unit.id)}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-primary"
                        >
                            <span className="material-symbols-outlined text-lg">
                                {isExpanded ? 'expand_more' : 'chevron_right'}
                            </span>
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}

                    <span className={`material-symbols-outlined ${getTypeColor(unit.content_type)}`}>
                        {getTypeIcon(unit.content_type)}
                    </span>

                    <span className="flex-1 font-medium text-sm">{unit.title}</span>

                    {unit.duration && (
                        <span className="text-xs text-gray-400">{unit.duration}</span>
                    )}

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => openAddForm(unit.id)}
                            className="p-1 text-primary hover:bg-primary/10 rounded"
                            title="Adicionar sub-unidade"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                        <button
                            onClick={() => openEditForm(unit)}
                            className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="Editar"
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                            onClick={() => handleDelete(unit.id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Excluir"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-3">
                        {unit.children!.map(child => renderUnit(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1a202c] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Editar Estrutura do Curso</h2>
                        <p className="text-sm text-gray-500">{courseName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => openAddForm(null)}
                                className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors mb-4"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Adicionar Modulo/Unidade Raiz
                            </button>

                            {units.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="material-symbols-outlined text-4xl mb-2">folder_open</span>
                                    <p>Nenhuma unidade criada ainda</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {units.map(unit => renderUnit(unit))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Add/Edit Form Modal */}
                {showForm && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">
                                {editingUnit ? 'Editar' : 'Nova'} Unidade
                                {parentId && <span className="text-sm font-normal text-gray-500 ml-2">(sub-unidade)</span>}
                            </h3>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Titulo *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ex: Modulo 1 - Introducao"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo</label>
                                    <select
                                        value={contentType}
                                        onChange={(e) => setContentType(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418]"
                                    >
                                        <option value="unit">Modulo/Unidade</option>
                                        <option value="lesson">Aula</option>
                                        <option value="video">Video</option>
                                        <option value="quiz">Quiz</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Duracao</label>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        placeholder="Ex: 45min"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Descricao</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Descricao opcional..."
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418] resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Professor (opcional)</label>
                                        <input
                                            type="text"
                                            value={instructorName}
                                            onChange={(e) => setInstructorName(e.target.value)}
                                            placeholder="Ex: Prof. Ana Silva"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Titulo (opcional)</label>
                                        <input
                                            type="text"
                                            value={instructorTitle}
                                            onChange={(e) => setInstructorTitle(e.target.value)}
                                            placeholder="Ex: Mestre em Fisica"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418]"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving || !title.trim()}
                                        className="flex-1 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {saving ? 'Salvando...' : 'Salvar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseEditor;
