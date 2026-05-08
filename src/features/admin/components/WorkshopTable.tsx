import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, User, Users, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export interface Workshop {
    id: string;
    title: string;
    description: string;
    type: 'workshop' | 'seminar';
    date: string;
    location: string;
    instructor: string;
    instructor_id?: string;
    capacity: number;
    thumbnail_url: string | null;
    created_at: string;
}

interface WorkshopTableProps {
    workshops: Workshop[];
    onEdit: (workshop: Workshop) => void;
    onDelete: (id: string) => void;
    onViewRegistrations: (workshop: Workshop) => void;
}

export default function WorkshopTable({ workshops, onEdit, onDelete, onViewRegistrations }: WorkshopTableProps) {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    if (workshops.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center border border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Calendar className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('workshops.noWorkshops') || 'No events found'}</h3>
                <p className="text-gray-500 dark:text-gray-400">{t('admin.noResults')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-premium dark:shadow-premium-dark border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <th className="px-6 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.workshopTitle')}</th>
                            <th className="px-6 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('workshops.workshop')}</th>
                            <th className="px-6 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('workshops.date')}</th>
                            <th className="px-6 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('workshops.instructor')}</th>
                            <th className="px-6 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {workshops.map((workshop) => (
                            <tr key={workshop.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        {workshop.thumbnail_url ? (
                                            <img src={workshop.thumbnail_url} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{workshop.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {workshop.location}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${workshop.type === 'workshop'
                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                        }`}>
                                        {workshop.type === 'workshop' ? t('workshops.workshop') : t('workshops.seminar')}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {format(new Date(workshop.date), 'PPP', { locale: isArabic ? ar : enUS })}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5 font-medium">
                                        {format(new Date(workshop.date), 'p', { locale: isArabic ? ar : enUS })}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <User className="w-4 h-4 text-gray-400" />
                                        {workshop.instructor}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onViewRegistrations(workshop)}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors shadow-sm bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/30"
                                            title={t('workshops.viewRegistrations')}
                                        >
                                            <Users className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(workshop)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors shadow-sm bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/30"
                                            title={t('admin.editItem')}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(workshop.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shadow-sm bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30"
                                            title={t('common.delete')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
