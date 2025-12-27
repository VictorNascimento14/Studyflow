import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';

const navLinks = [
    { path: '/dashboard', label: 'Meu Plano', icon: 'dashboard' },
    { path: '/course', label: 'Meus Cursos', icon: 'school' },
    { path: '/links', label: 'Links Uteis', icon: 'link' },
];

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();
    const { isAdmin } = useAdmin();

    const isActive = (path: string) => location.pathname === path;

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <>
            {/* Desktop/Tablet Top Navbar */}
            <header className="sticky top-0 z-50 flex flex-shrink-0 items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-[#2a3441] bg-white dark:bg-[#111418] px-10 h-16">
                <div className="flex items-center gap-4 text-[#111418] dark:text-white w-48">
                    <div className="size-8 text-primary">
                        <span className="material-symbols-outlined text-3xl">school</span>
                    </div>
                    <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">StudyFlow</h2>
                </div>
                <nav className="hidden lg:flex items-center justify-center">
                    <div className="relative flex items-center p-1 bg-gray-100 dark:bg-[#1a222d] rounded-full border border-gray-200 dark:border-gray-700/50">
                        {/* Desktop Sliding Pill */}
                        <div
                            className="absolute h-[calc(100%-8px)] top-1 bg-white dark:bg-[#2a3441] rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                            style={{
                                width: '120px',
                                left: '4px',
                                transform: `translateX(${(() => {
                                    const index = navLinks.findIndex(l => location.pathname === l.path);
                                    return index === -1 ? 0 : index;
                                })() * 100}%)`
                            }}
                        />
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative z-10 w-[120px] py-1.5 text-sm text-center rounded-full transition-colors duration-300 ${isActive(link.path)
                                    ? 'font-bold text-[#111418] dark:text-white'
                                    : 'font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </nav>
                <div className="flex items-center gap-4 w-48 justify-end">
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className={`size-9 rounded-full flex items-center justify-center border transition-colors ${isActive('/admin')
                                ? 'bg-primary text-white border-primary'
                                : 'bg-gray-200 dark:bg-[#2a3441] text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:text-primary'
                                }`}
                            title="Painel Admin"
                        >
                            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                        </Link>
                    )}
                    <button
                        onClick={toggleTheme}
                        className="size-9 rounded-full bg-gray-200 dark:bg-[#2a3441] flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:ring-2 hover:ring-primary/20 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        <span className="material-symbols-outlined text-xl transition-transform duration-500 ease-in-out">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="hidden md:inline text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                            {user?.email}
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="size-9 rounded-full bg-gray-200 dark:bg-[#2a3441] flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:text-red-500 transition-all cursor-pointer"
                            title="Sair"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation (Floating Slide Pill) */}
            <nav className="custom-mobile-navbar lg:hidden fixed bottom-6 left-6 right-6 z-50 bg-white/90 dark:bg-[#151c24]/90 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-white/5 shadow-2xl shadow-black/20 h-16 px-2">
                <div className="relative flex items-center h-full w-full">
                    {/* Sliding Background Pill */}
                    <div
                        className="absolute h-12 bg-primary rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                        style={{
                            width: `calc(100% / ${(navLinks.length + (isAdmin ? 1 : 0))})`,
                            left: '0',
                            transform: `translateX(${(() => {
                                const allLinks = [...navLinks];
                                if (isAdmin) allLinks.push({ path: '/admin', label: 'Admin', icon: 'admin_panel_settings' });
                                const index = allLinks.findIndex(l => location.pathname === l.path);
                                return index === -1 ? 0 : index;
                            })() * 100}%)`
                        }}
                    />

                    {/* Navigation Items */}
                    <div className="flex w-full h-full relative z-10">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="flex-1 flex items-center justify-center h-full group tap-highlight-transparent"
                                >
                                    <span
                                        className={`material-symbols-outlined text-2xl transition-all duration-300 ${isActive
                                            ? 'text-white scale-110 filled'
                                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                            }`}
                                    >
                                        {link.icon}
                                    </span>
                                </Link>
                            );
                        })}

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="flex-1 flex items-center justify-center h-full group tap-highlight-transparent"
                            >
                                <span
                                    className={`material-symbols-outlined text-2xl transition-all duration-300 ${location.pathname === '/admin'
                                        ? 'text-white scale-110 filled'
                                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                        }`}
                                >
                                    admin_panel_settings
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
