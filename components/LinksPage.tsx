import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { supabase } from '../services/supabaseClient';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../contexts/AuthContext';

interface UsefulLink {
    id: string;
    title: string;
    url: string;
    category: string;
    description: string;
    author: string | null;
    icon: string;
}

const AVAILABLE_ICONS = [
    'link', 'school', 'functions', 'menu_book', 'play_circle',
    'smart_display', 'forest', 'edit_note', 'timer', 'calculate',
    'science', 'language', 'code', 'search', 'folder'
];

const LinksPage: React.FC = () => {
    const { isAdmin } = useAdmin();
    const { user } = useAuth();
    const [links, setLinks] = useState<UsefulLink[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [newLink, setNewLink] = useState({
        title: '',
        url: '',
        category: '',
        description: '',
        author: '',
        icon: 'link'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        const { data, error } = await supabase
            .from('useful_links')
            .select('*')
            .order('category', { ascending: true });

        if (!error && data) {
            setLinks(data);
        }
        setLoading(false);
    };

    const handleEditLink = (link: UsefulLink) => {
        setNewLink({
            title: link.title,
            url: link.url,
            category: link.category,
            description: link.description,
            author: link.author || '',
            icon: link.icon
        });
        setEditingId(link.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNewLink({
            title: '',
            url: '',
            category: '',
            description: '',
            author: '',
            icon: 'link'
        });
        setEditingId(null);
    };

    const handleSaveLink = async () => {
        if (!newLink.title || !newLink.url || !newLink.category) return;

        setIsSubmitting(true);
        try {
            const payload = {
                title: newLink.title,
                url: newLink.url,
                category: newLink.category,
                description: newLink.description,
                author: newLink.author || null,
                icon: newLink.icon
            };

            if (editingId) {
                // Update existing link
                const { data, error } = await supabase
                    .from('useful_links')
                    .update(payload)
                    .eq('id', editingId)
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setLinks(links.map(l => l.id === editingId ? data : l));
                    alert('Link atualizado com sucesso!');
                }
            } else {
                // Create new link
                const { data, error } = await supabase
                    .from('useful_links')
                    .insert([payload])
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setLinks([...links, data]);
                    alert('Link adicionado com sucesso!');
                }
            }

            // Reset form
            handleCancelEdit();

        } catch (error) {
            console.error('Error saving link:', error);
            alert('Erro ao salvar link. Verifique se você é administrador.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLink = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este link?')) return;

        try {
            const { error } = await supabase
                .from('useful_links')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setLinks(links.filter(l => l.id !== id));
            if (editingId === id) handleCancelEdit();
        } catch (error) {
            console.error('Error deleting link:', error);
            alert('Erro ao remover link.');
        }
    };

    // Group links by category
    const linksByCategory = links.reduce<Record<string, UsefulLink[]>>((acc, link) => {
        if (!acc[link.category]) acc[link.category] = [];
        acc[link.category].push(link);
        return acc;
    }, {});

    // Get unique categories for suggestion + "New Category" logic could be added but simpler to just input text for now or combo
    const existingCategories = Array.from(new Set(links.map(l => l.category)));

    return (
        <>
            <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
                <div className="w-full max-w-[900px] flex flex-col gap-8">
                    {/* Header */}
                    <div className="bg-white dark:bg-[#111418] p-8 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441]">
                        <div className="flex flex-col gap-3">
                            <h1 className="text-[#111418] dark:text-white text-3xl font-black leading-tight tracking-tight">Links Úteis</h1>
                            <p className="text-[#617589] dark:text-[#9ca3af] text-lg font-normal leading-relaxed max-w-2xl">
                                Centralize todos os seus materiais de referência, videoaulas e ferramentas online. Mantenha seus recursos de estudo organizados.
                            </p>
                        </div>
                    </div>

                    {/* Admin: Add New Link Form */}
                    {isAdmin && (
                        <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-lg border border-primary/20 overflow-hidden ring-1 ring-primary/5">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-primary/5">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary text-white p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                                    </div>
                                    <h3 className="text-[#111418] dark:text-white text-lg font-bold">
                                        {editingId ? 'Editar Recurso (Admin)' : 'Adicionar Novo Recurso (Admin)'}
                                    </h3>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col gap-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <label className="flex flex-col w-full">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Título do Recurso *</span>
                                        <input
                                            value={newLink.title}
                                            onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                            className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="ex: Khan Academy"
                                        />
                                    </label>
                                    <label className="flex flex-col w-full">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">URL (Link) *</span>
                                        <input
                                            value={newLink.url}
                                            onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                            className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="https://..."
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <label className="flex flex-col w-full">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Categoria *</span>
                                        <input
                                            value={newLink.category}
                                            onChange={e => setNewLink({ ...newLink, category: e.target.value })}
                                            list="categories"
                                            className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Digite ou selecione..."
                                        />
                                        <datalist id="categories">
                                            {existingCategories.map(c => <option key={c} value={c} />)}
                                            <option value="Matemática" />
                                            <option value="Produtividade" />
                                            <option value="Geral" />
                                        </datalist>
                                    </label>
                                    <label className="flex flex-col w-full">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Autor (Opcional)</span>
                                        <input
                                            value={newLink.author}
                                            onChange={e => setNewLink({ ...newLink, author: e.target.value })}
                                            className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="ex: Sal Khan"
                                        />
                                    </label>
                                    <label className="flex flex-col w-full">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ícone</span>
                                        <select
                                            value={newLink.icon}
                                            onChange={e => setNewLink({ ...newLink, icon: e.target.value })}
                                            className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                                        >
                                            {AVAILABLE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                        </select>
                                    </label>
                                </div>

                                <label className="flex flex-col w-full">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Descrição</span>
                                    <input
                                        value={newLink.description}
                                        onChange={e => setNewLink({ ...newLink, description: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="Breve descrição sobre o recurso..."
                                    />
                                </label>

                                <div className="flex justify-end pt-2 gap-3">
                                    {editingId && (
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex items-center justify-center rounded-xl h-12 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSaveLink}
                                        disabled={isSubmitting}
                                        className="flex w-full md:w-auto items-center justify-center rounded-xl h-12 px-8 bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined mr-2">{editingId ? 'save' : 'add_circle'}</span>
                                        {isSubmitting ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Adicionar Link')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Links Display */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                            <p className="text-gray-500">Carregando links...</p>
                        </div>
                    ) : Object.keys(linksByCategory).length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[#111418] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="size-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl opacity-50">link_off</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-500">Nenhum link cadastrado</h3>
                            {isAdmin && <p className="text-sm text-gray-400 mt-2">Use o formulário acima para adicionar o primeiro.</p>}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {Object.entries(linksByCategory).map(([category, items]) => (
                                <div key={category} className="bg-white dark:bg-[#111418] rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] overflow-hidden">
                                    <div className="p-5 border-b border-[#e5e7eb] dark:border-[#2a3441] bg-gray-50/50 dark:bg-[#151c24]/50 flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-xl">folder</span>
                                        </div>
                                        <h3 className="text-[#111418] dark:text-white text-xl font-bold">{category}</h3>
                                        <span className="ml-auto text-xs font-bold bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">{items.length}</span>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {items.map(item => (
                                            <div key={item.id} className={`group p-5 hover:bg-gray-50 dark:hover:bg-[#1a202c] transition-colors flex items-start gap-4 ${editingId === item.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                                <div className="size-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                    <span className="material-symbols-outlined text-2xl">{item.icon || 'link'}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-4 mb-1">
                                                        <h4 className="text-[#111418] dark:text-white font-bold text-lg truncate group-hover:text-primary transition-colors">
                                                            {item.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-sm font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-all"
                                                            >
                                                                Acessar
                                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                            </a>
                                                            {isAdmin && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEditLink(item)}
                                                                        className="size-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                                        title="Editar Link"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteLink(item.id)}
                                                                        className="size-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                        title="Remover Link"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {item.author && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">
                                                            <span className="material-symbols-outlined text-sm">person</span>
                                                            {item.author}
                                                        </div>
                                                    )}
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
};

export default LinksPage;