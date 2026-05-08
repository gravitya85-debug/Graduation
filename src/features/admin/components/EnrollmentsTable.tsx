import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Calendar, BookOpen, GraduationCap, CheckCircle, Clock, XCircle } from 'lucide-react';

export interface EnrollmentRecord {
    id: string;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
    item_title: string;
    status?: string;
    completed?: boolean; // For courses
}

interface EnrollmentsTableProps {
    data: EnrollmentRecord[];
    type: 'course' | 'postgrad';
}

export default function EnrollmentsTable({ data, type }: EnrollmentsTableProps) {
    const { t } = useTranslation();

    if (data.length === 0) {
        return (
            <div className="bg-white/80 dark:bg-gray-800/80 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm mt-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/50 text-gray-400 flex items-center justify-center rounded-full mx-auto mb-3">
                    {type === 'course' ? <BookOpen className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                </div>
                <p className="text-gray-500 dark:text-gray-400">{t('admin.noResults') || 'No records found'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 overflow-x-auto animate-fade-in-up mt-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.graduate')}</th>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{type === 'course' ? t('admin.courseTitle') : t('admin.progTitle')}</th>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.userDate')}</th>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                        <th className="px-6 py-4 text-end text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-500 flex items-center justify-center font-bold">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white mb-0.5">{record.user.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {record.user.email}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{record.item_title}</div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1">
                                    {type === 'course' ? <BookOpen className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                                    {type === 'course' ? t('admin.tabCourses') : t('admin.tabPostgrad')}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {new Date(record.created_at).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {type === 'course' ? (
                                    record.completed ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                            <CheckCircle className="w-3.5 h-3.5" /> {t('courses.courseCompleted') || 'Completed'}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                            <Clock className="w-3.5 h-3.5" /> {t('admin.statusInProgress') || 'In Progress'}
                                        </span>
                                    )
                                ) : (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getRstatusStyles(record.status || 'pending')}`}>
                                        {getStatusIcon(record.status || 'pending')}
                                        {t(`postgraduate.${record.status || 'pending'}`) || record.status}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function getRstatusStyles(status: string) {
    switch (status) {
        case 'accepted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
        case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
        default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'accepted': return <CheckCircle className="w-3.5 h-3.5" />;
        case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
        default: return <Clock className="w-3.5 h-3.5" />;
    }
}
