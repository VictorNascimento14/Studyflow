import { supabase } from './supabaseClient';
import type { Subject, CourseNote } from '../types';

export interface UserProfile {
    id: string;
    full_name: string | null;
    total_progress: number;
}

export interface StudyPlanItem {
    id: string;
    user_id: string;
    title: string;
    duration: string;
    status: 'completed' | 'pending';
    day_of_week: number;
    is_completed: boolean;
}

export const dataService = {
    // User Profile
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw error;
        return data as UserProfile | null;
    },

    async createProfile(profile: UserProfile) {
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert(profile)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Study Plans (Dashboard)
    async getStudyPlans(userId: string) {
        const { data, error } = await supabase
            .from('study_plans')
            .select('*')
            .eq('user_id', userId)
            .order('day_of_week', { ascending: true });
        if (error) throw error;
        return data as StudyPlanItem[];
    },

    async saveStudyPlan(userId: string, subjects: Subject[]) {
        // Clear old plan items (simplification for this demo)
        await supabase.from('study_plans').delete().eq('user_id', userId);

        const items = subjects.map((sub, index) => ({
            user_id: userId,
            title: sub.name,
            duration: '60 min', // Default placeholder
            day_of_week: index % 7,
            status: 'pending'
        }));

        const { error } = await supabase.from('study_plans').insert(items);
        if (error) throw error;
    },

    async deleteStudyPlan(userId: string) {
        const { error } = await supabase
            .from('study_plans')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
    },

    async togglePlanStatus(itemId: string, isCompleted: boolean) {
        const { error } = await supabase
            .from('study_plans')
            .update({ is_completed: isCompleted, status: isCompleted ? 'completed' : 'pending' })
            .eq('id', itemId);
        if (error) throw error;
    },

    // Dashboard Notes
    async getDashboardNote(userId: string) {
        const { data, error } = await supabase
            .from('dashboard_notes')
            .select('content')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) throw error;
        return data?.content || '';
    },

    async saveDashboardNote(userId: string, content: string) {
        const { error } = await supabase
            .from('dashboard_notes')
            .upsert({ user_id: userId, content, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        if (error) throw error;
    },

    // Courses and Notes
    async getLessonNotes(userId: string, unitId: string) {
        const { data, error } = await supabase
            .from('lesson_notes')
            .select('*')
            .eq('user_id', userId)
            .eq('unit_id', unitId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as CourseNote[];
    },

    async saveLessonNote(userId: string, unitId: string, note: Partial<CourseNote>) {
        const payload = {
            user_id: userId,
            content: note.content,
            timestamp: note.timestamp,
            color: note.color,
            unit_id: unitId
        };

        if (note.id && typeof note.id === 'string' && note.id.length > 20) {
            const { error } = await supabase
                .from('lesson_notes')
                .update(payload)
                .eq('id', note.id);
            if (error) throw error;
        } else {
            const { data, error } = await supabase
                .from('lesson_notes')
                .insert([payload])
                .select()
                .maybeSingle();
            if (error) throw error;
            return data;
        }
    },

    async deleteLessonNote(noteId: string) {
        const { error } = await supabase
            .from('lesson_notes')
            .delete()
            .eq('id', noteId);
        if (error) throw error;
    },

    // Course Progress
    async getCourseProgress(userId: string, courseId: string) {
        const { data, error } = await supabase
            .from('user_progress')
            .select('unit_id')
            .eq('user_id', userId)
            .eq('course_id', courseId);

        if (error) throw error;
        return (data || []).map(row => row.unit_id);
    },

    async toggleUnitCompletion(userId: string, unitId: string, courseId: string, isCompleted: boolean) {
        if (isCompleted) {
            const { error } = await supabase
                .from('user_progress')
                .insert({ user_id: userId, unit_id: unitId, course_id: courseId });
            // Ignore duplicate key error (already completed)
            if (error && error.code !== '23505') throw error;
        } else {
            const { error } = await supabase
                .from('user_progress')
                .delete()
                .eq('user_id', userId)
                .eq('unit_id', unitId);
            if (error) throw error;
        }
    }
};
