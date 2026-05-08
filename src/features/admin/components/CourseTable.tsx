import React from 'react';
import { Edit3, Trash2, Link as LinkIcon, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    thumbnail_url?: string;
    content_url?: string;
    created_at: string;
    instructor_name?: string;
    instructor_id?: string;
    is_free?: boolean;
    price?: number;
    original_price?: number;
}

interface CourseTableProps {
    courses: Course[];
    onEdit: (course: Course) => void;
    onDelete: (id: string) => void;
}

export default function CourseTable({ courses, onEdit, onDelete }: CourseTableProps) {
    const { t } = useTranslation();

    if (courses.length === 0) {
        return (
            <div className="bg-white/80 dark:bg-gray-800/80 p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm mt-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/50 text-gray-400 flex items-center justify-center rounded-full mx-auto mb-3">
                    <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">{t('admin.noResults') || 'No courses available'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 overflow-x-auto animate-fade-in-up mt-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.courseTitle') || 'Course Title'}</th>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.tableCategoryLevel') || 'Category & Level'}</th>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.tableDuration') || 'Duration'}</th>
                        <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.tableContent') || 'Content'}</th>
                        <th className="px-6 py-4 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.actions') || 'Actions'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {courses.map(course => (
                        <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-500 flex items-center justify-center">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white mb-1">{course.title}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">{course.description}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md mb-1 mr-2">{course.category ? (t(`courses.${course.category.toLowerCase()}`) || course.category) : 'N/A'}</span>
                                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-md">{course.level ? (t(`courses.${course.level.toLowerCase()}`) || course.level) : 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                {course.duration || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {course.content_url ? (
                                    <a href={course.content_url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1 font-medium">
                                        <LinkIcon className="w-4 h-4" /> {t('admin.viewLink') || 'View Link'}
                                    </a>
                                ) : (
                                    <span className="text-amber-500 text-xs">{t('admin.noContent') || 'No content uploaded'}</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-end">
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => onEdit(course)} className="text-indigo-500 hover:text-indigo-700 transition-colors p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg" title="Edit">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDelete(course.id)} className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 dark:bg-red-900/30 rounded-lg" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
