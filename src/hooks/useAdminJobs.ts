import { useState, useCallback } from 'react';
import { jobsService } from '../services/jobsService';
import type { Job, JobInput } from '../types';

export function useAdminJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await jobsService.getAdminJobs();
            setJobs(data);
            return { success: true };
        } catch (err: any) {
            setError(err.message || 'Failed to load jobs');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const addJob = async (payload: JobInput) => {
        try {
            setSubmitting(true);
            await jobsService.createJob(payload);
            await fetchJobs();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setSubmitting(false);
        }
    };

    const editJob = async (id: string, payload: JobInput) => {
        try {
            setSubmitting(true);
            await jobsService.updateJob(id, payload);
            await fetchJobs();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setSubmitting(false);
        }
    };

    const removeJob = async (id: string) => {
        try {
            setSubmitting(true);
            await jobsService.deleteJob(id);
            await fetchJobs();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setSubmitting(false);
        }
    };

    return {
        jobs,
        loading,
        submitting,
        error,
        fetchJobs,
        addJob,
        editJob,
        removeJob,
    };
}
