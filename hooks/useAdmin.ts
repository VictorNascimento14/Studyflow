import { useAuth } from '../contexts/AuthContext';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'j_nascimento06@hotmail.com';

export function useAdmin() {
    const { user } = useAuth();

    const isAdmin = user?.email === ADMIN_EMAIL;

    return { isAdmin, adminEmail: ADMIN_EMAIL };
}
