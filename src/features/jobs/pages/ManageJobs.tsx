import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Briefcase, Plus, Loader2, X, MapPin, Edit3, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../../components/PageBanner';
import TagInput from '../../../components/TagInput';
import ConfirmModal from '../../../components/ConfirmModal';

export default function ManageJobs() {
    const { user, role, isProfileComplete } = useAuth();
    const { t } = useTranslation();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: ''
    });

    useEffect(() => {
        if (user) fetchMyJobs();
    }, [user]);

    const fetchMyJobs = async () => {
        try {
            setLoading(true);
            let query = supabase.from('jobs').select('*');
            
            if (role !== 'admin') {
                query = query.eq('company_id', user?.id);
            }
            
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            toast.error(t('manageJobs.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (job: any) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            description: job.description,
            requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements || '',
            location: job.location
        });
        setShowModal(true);
    };

    const handlePostJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (role === 'company' && !isProfileComplete) {
            toast.error(t(`profile.incompleteError_${role}`));
            return;
        }
        try {
            setSubmitting(true);
            const reqArray = formData.requirements.split(',').map(s => s.trim()).filter(Boolean);

            if (editingJob) {
                const { error } = await supabase
                    .from('jobs')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        requirements: reqArray,
                        location: formData.location
                    })
                    .eq('id', editingJob.id);
                if (error) throw error;
                toast.success(t('manageJobs.updateSuccess') || t('manageJobs.success'));
            } else {
                const { error } = await supabase.from('jobs').insert({
                    company_id: user?.id,
                    title: formData.title,
                    description: formData.description,
                    requirements: reqArray,
                    location: formData.location
                });
                if (error) throw error;
                toast.success(t('manageJobs.success'));
            }

            setShowModal(false);
            setEditingJob(null);
            setFormData({ title: '', description: '', requirements: '', location: '' });
            fetchMyJobs();
        } catch (error) {
            toast.error(t('manageJobs.error'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteJob = async () => {
        if (!deleteId) return;
        try {
            const { data, error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', deleteId)
                .select();
            
            if (error) throw error;

            if (!data || data.length === 0) {
                toast.error(t('manageJobs.deleteFailed') + ' (No matching record or permission)');
                return;
            }

            toast.success(t('manageJobs.deleteSuccess') || t('admin.deleteSuccess'));
            setDeleteId(null);
            fetchMyJobs();
        } catch (error) {
            console.error('Delete job error:', error);
            toast.error(t('manageJobs.error'));
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <PageBanner
                image="/images/jobs-bg.png"
                title={t('manageJobs.title')}
                subtitle={t('manageJobs.subtitle')}
                icon={<Briefcase className="w-7 h-7 text-white" />}
                gradient="from-indigo-700/85 to-violet-700/85"
            />

            <div className="flex justify-end">
                <button
                    onClick={() => {
                        if (role === 'company' && !isProfileComplete) {
                            toast.error(t(`profile.incompleteError_${role}`));
                            return;
                        }
                        setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2 active:scale-95 transition-all duration-300"
                >
                    <Plus className="w-5 h-5" /> {t('manageJobs.postNew')}
                </button>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 overflow-x-auto transition-all animate-fade-in-up">
                {jobs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        {t('manageJobs.noJobsPosted')}
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('manageJobs.jobTitle')}</th>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('manageJobs.location')}</th>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('manageJobs.postedDate')}</th>
                                <th className="px-6 py-4 text-end text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {jobs.map(job => (
                                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {job.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-end">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => handleOpenEdit(job)} className="text-indigo-500 hover:text-indigo-700 transition-colors" title={t('common.edit')}><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => setDeleteId(job.id)} className="text-red-500 hover:text-red-700 transition-colors" title={t('common.delete')}><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900/75 transition-opacity" onClick={() => setShowModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl text-start overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-gray-100 dark:border-gray-700/50 animate-fade-in-up">
                            <div className="px-5 pt-6 pb-4 sm:p-7 sm:pb-5 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{editingJob ? t('manageJobs.editJobTitle') : t('manageJobs.postNewTitle')}</h3>
                                <button onClick={() => { setShowModal(false); setEditingJob(null); }} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handlePostJob}>
                                <div className="px-4 py-5 sm:p-6 bg-gray-50 dark:bg-gray-900/50 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('manageJobs.jobTitleLabel')}</label>
                                        <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('manageJobs.locationLabel')}</label>
                                        <input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder={t('manageJobs.locationPlaceholder')} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('manageJobs.descLabel')}</label>
                                        <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all text-sm min-h-[100px]"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('manageJobs.reqLabel')}</label>
                                        <TagInput
                                            tags={formData.requirements ? formData.requirements.split(',').map(s => s.trim()).filter(Boolean) : []}
                                            onTagsChange={(newTags) => setFormData({ ...formData, requirements: newTags.join(', ') })}
                                            placeholder={t('manageJobs.reqPlaceholder')}
                                            addButtonText={t('common.add')}
                                        />
                                    </div>
                                </div>
                                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/50 sm:px-7 sm:flex sm:flex-row-reverse sm:gap-3">
                                    <button type="submit" disabled={submitting} className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-md px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-base font-bold text-white hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50 transition-all active:scale-95 duration-300">
                                        {submitting ? <Loader2 className="w-4 h-4 rtl:ml-2 ltr:mr-2 animate-spin" /> : null} {editingJob ? t('manageJobs.updateJobBtn') : t('manageJobs.postJobBtn')}
                                    </button>
                                    <button type="button" onClick={() => { setShowModal(false); setEditingJob(null); }} className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-6 py-2.5 bg-white dark:bg-gray-800 text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-300">{t('manageJobs.cancel')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && <ConfirmModal message={t('admin.confirmDelete')} onConfirm={handleDeleteJob} onCancel={() => setDeleteId(null)} />}
        </div>
    );
}
