import { supabase } from '../lib/supabase';
import type { Job, JobInput } from '../types';

export const jobsService = {
    async getAdminJobs(): Promise<Job[]> {
        const { data, error } = await supabase
            .from('jobs')
            .select('*, users (name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async createJob(payload: JobInput): Promise<void> {
        const { error } = await supabase.from('jobs').insert(payload);
        if (error) throw error;
    },

    async updateJob(id: string, payload: JobInput): Promise<void> {
        const { error } = await supabase.from('jobs').update(payload).eq('id', id);
        if (error) throw error;
    },

    async deleteJob(id: string): Promise<void> {
        const { error } = await supabase.from('jobs').delete().eq('id', id);
        if (error) throw error;
    }
};
