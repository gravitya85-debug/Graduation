import { useTranslation } from 'react-i18next';
import { X, Loader2, Edit3, Trash2, MapPin } from 'lucide-react';
import type { Job } from '../../../types';

interface JobsTableProps {
    jobs: Job[];
    onEdit: (job: Job) => void;
    onDelete: (id: string) => void;
}

export default function JobsTable({ jobs, onEdit, onDelete }: JobsTableProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 overflow-x-auto animate-fade-in-up">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.jobTitle')}</th>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.jobLocation')}</th>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.jobPostedBy')}</th>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.jobDate')}</th>
                        <th className="px-6 py-4 text-end text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {jobs.map(job => (
                        <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{job.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{job.users?.name || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(job.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-end">
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => onEdit(job)} className="text-indigo-500 hover:text-indigo-700 transition-colors"><Edit3 className="w-4 h-4" /></button>
                                    <button onClick={() => onDelete(job.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {jobs.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t('admin.noResults')}</td></tr>}
                </tbody>
            </table>
        </div>
    );
}
