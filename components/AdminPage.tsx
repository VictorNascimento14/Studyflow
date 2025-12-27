import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { supabase } from '../services/supabaseClient';
import CourseEditor from './CourseEditor';

interface AvailableCourse {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnail_url: string | null;
    instructor_name: string | null;
    instructor_title: string | null;
    created_at: string;
}

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { isAdmin } = useAdmin();

    const [courses, setCourses] = useState<AvailableCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Exatas');
    const [instructorName, setInstructorName] = useState('');
    const [instructorTitle, setInstructorTitle] = useState('');
    const [saving, setSaving] = useState(false);

    // Course Editor state
    const [editingCourse, setEditingCourse] = useState<AvailableCourse | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (!authLoading && user && !isAdmin) {
            navigate('/dashboard');
        }
    }, [authLoading, user, isAdmin, navigate]);

    useEffect(() => {
        if (isAdmin) {
            fetchCourses();
        }
    }, [isAdmin]);

    const fetchCourses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('available_courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching courses:', error);
        } else {
            setCourses(data || []);
        }
        setLoading(false);
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setSaving(true);
        const { error } = await supabase.from('available_courses').insert({
            title: title.trim(),
            description: description.trim(),
            category,
            instructor_name: instructorName.trim() || null,
            instructor_title: instructorTitle.trim() || null,
            created_by: user?.id,
        });

        if (error) {
            console.error('Error creating course:', error);
            alert('Erro ao criar curso: ' + error.message);
        } else {
            setTitle('');
            setDescription('');
            setCategory('Exatas');
            setInstructorName('');
            setInstructorTitle('');
            setShowForm(false);
            fetchCourses();
        }
        setSaving(false);
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Tem certeza que deseja excluir este curso?')) return;

        const { error } = await supabase
            .from('available_courses')
            .delete()
            .eq('id', courseId);

        if (error) {
            console.error('Error deleting course:', error);
            alert('Erro ao excluir curso: ' + error.message);
        } else {
            fetchCourses();
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <>
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-[#2a3441] bg-white dark:bg-[#111418] px-10 py-3">
                <div className="flex items-center gap-4 text-[#111418] dark:text-white">
                    <div className="size-8 text-primary">
                        <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                    </div>
                    <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        Painel Admin
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-bold text-[#111418] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a3441] transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Voltar</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111418] dark:text-white">Gerenciar Cursos</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Cursos criados aqui aparecem para todos os usuarios
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Novo Curso
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white dark:bg-[#1a202c] rounded-xl p-6 mb-8 border border-[#e5e7eb] dark:border-[#2a3441]">
                        <h3 className="text-lg font-bold mb-4">Criar Novo Curso</h3>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Titulo do Curso *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Calculo I - Fundamentos"
                                    className="w-full px-4 py-3 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Descricao</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Breve descricao do conteudo do curso..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Categoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                >
                                    <option value="Exatas">Exatas</option>
                                    <option value="Humanas">Humanas</option>
                                    <option value="Biologicas">Biologicas</option>
                                    <option value="Linguagens">Linguagens</option>
                                    <option value="Tecnologia">Tecnologia</option>
                                    <option value="Geral">Geral</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nome do Professor (opcional)</label>
                                    <input
                                        type="text"
                                        value={instructorName}
                                        onChange={(e) => setInstructorName(e.target.value)}
                                        placeholder="Ex: Prof. Carlos Mendes"
                                        className="w-full px-4 py-3 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Titulo/Profissao (opcional)</label>
                                    <input
                                        type="text"
                                        value={instructorTitle}
                                        onChange={(e) => setInstructorTitle(e.target.value)}
                                        placeholder="Ex: PhD em Matematica"
                                        className="w-full px-4 py-3 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving || !title.trim()}
                                    className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Salvando...' : 'Criar Curso'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-[#2a3441] transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-4">
                    {courses.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-[#1a202c] rounded-xl border border-[#e5e7eb] dark:border-[#2a3441]">
                            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">school</span>
                            <h3 className="text-lg font-bold mt-4">Nenhum curso criado</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Clique em "Novo Curso" para criar seu primeiro curso
                            </p>
                        </div>
                    ) : (
                        courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white dark:bg-[#1a202c] rounded-xl p-6 border border-[#e5e7eb] dark:border-[#2a3441] flex justify-between items-start"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold">{course.title}</h3>
                                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary">
                                            {course.category}
                                        </span>
                                    </div>
                                    {course.description && (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{course.description}</p>
                                    )}
                                    {course.instructor_name && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                            <span className="material-symbols-outlined text-sm align-middle mr-1">person</span>
                                            {course.instructor_name}
                                            {course.instructor_title && (
                                                <span className="text-gray-400 dark:text-gray-500"> - {course.instructor_title}</span>
                                            )}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        Criado em {new Date(course.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingCourse(course)}
                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Editar estrutura do curso"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Excluir curso"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Course Editor Modal */}
                {editingCourse && (
                    <CourseEditor
                        courseId={editingCourse.id}
                        courseName={editingCourse.title}
                        onClose={() => setEditingCourse(null)}
                    />
                )}
            </main>
        </>
    );
};

export default AdminPage;
