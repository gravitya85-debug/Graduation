import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2 } from 'lucide-react';
import type { Job, JobInput } from '../../../types';

interface JobFormModalProps {
    job?: Job | null;
    submitting: boolean;
    onSubmit: (payload: JobInput) => void;
    onClose: () => void;
}

export default function JobFormModal({ job, submitting, onSubmit, onClose }: JobFormModalProps) {
    const { t } = useTranslation();
    const [form, setForm] = useState<JobInput>({
        title: '',
        description: '',
        requirements: [],
        location: ''
    });
    const [reqString, setReqString] = useState('');

    useEffect(() => {
        if (job) {
            setForm({
                title: job.title || '',
                description: job.description || '',
                requirements: job.requirements || [],
                location: job.location || ''
            });
            setReqString((job.requirements || []).join(', '));
        }
    }, [job]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const reqArray = reqString.split(',').map(s => s.trim()).filter(Boolean);
        onSubmit({ ...form, requirements: reqArray });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900/75" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl text-start overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-gray-100 dark:border-gray-700/50 animate-fade-in-up">
                    <div className="px-5 pt-6 pb-4 sm:p-7 sm:pb-5 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{job ? t('admin.editItem') : t('admin.addItem')}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="px-4 py-5 sm:p-6 bg-gray-50 dark:bg-gray-900/50 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.jobTitle')}</label>
                                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.jobLocation')}</label>
                                <input type="text" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.jobDesc')}</label>
                                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm min-h-[100px]"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.jobReqs')}</label>
                                <input type="text" value={reqString} onChange={e => setReqString(e.target.value)} placeholder={t('admin.reqPlaceholder')} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm" />
                            </div>
                        </div>
                        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/50 sm:px-7 sm:flex sm:flex-row-reverse sm:gap-3">
                            <button type="submit" disabled={submitting} className="w-full inline-flex justify-center rounded-xl px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-base font-bold text-white hover:from-indigo-500 hover:to-purple-500 sm:w-auto sm:text-sm disabled:opacity-50 transition-all active:scale-95 shadow-md">
                                {submitting && <Loader2 className="w-4 h-4 rtl:ml-2 ltr:mr-2 animate-spin" />}
                                {t('admin.save')}
                            </button>
                            <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-2.5 bg-white dark:bg-gray-800 text-base font-bold text-gray-700 dark:text-gray-300 sm:mt-0 sm:w-auto sm:text-sm">{t('admin.cancel')}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
