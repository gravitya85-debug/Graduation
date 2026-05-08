import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Loader2, Calendar, MapPin, User, Users, AlignLeft, Type } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Workshop } from './WorkshopTable';

interface WorkshopFormProps {
    initialData?: Workshop | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function WorkshopForm({ initialData, onClose, onSuccess }: WorkshopFormProps) {
    const { user, role } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        type: initialData?.type || 'workshop',
        date: initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
        location: initialData?.location || '',
        instructor: initialData?.instructor || '',
        capacity: initialData?.capacity || 50,
        thumbnail_url: initialData?.thumbnail_url || ''
    });

    const handleUploadThumbnail = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `workshops/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('courses') // Reusing courses bucket for simplicity, or we should create 'workshops'
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('courses').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            let publicThumbnailUrl = formData.thumbnail_url;
            if (thumbnailFile) {
                publicThumbnailUrl = await handleUploadThumbnail(thumbnailFile);
            }

            const workshopData = {
                ...formData,
                thumbnail_url: publicThumbnailUrl,
                date: new Date(formData.date).toISOString(),
                instructor_id: initialData?.instructor_id || (role === 'doctor' ? user.id : null),
            };

            if (initialData) {
                const { error } = await supabase
                    .from('workshops')
                    .update(workshopData)
                    .eq('id', initialData.id);
                if (error) throw error;
                toast.success(t('admin.editSuccess'));
            } else {
                const { error } = await supabase
                    .from('workshops')
                    .insert([workshopData]);
                if (error) throw error;
                toast.success(t('admin.addSuccess'));
            }

            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t('admin.saveFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 animate-slide-up">
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {initialData ? t('workshops.editWorkshop') : t('workshops.addWorkshop')}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Type className="w-4 h-4" /> {t('admin.courseTitle')}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                placeholder={t('admin.courseTitleExample') || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> {t('workshops.date')}
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Type className="w-4 h-4" /> {t('admin.progType')}
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            >
                                <option value="workshop">{t('workshops.workshop')}</option>
                                <option value="seminar">{t('workshops.seminar')}</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> {t('workshops.location')}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                placeholder={t('workshops.location') || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <User className="w-4 h-4" /> {t('workshops.instructor')}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.instructor}
                                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                placeholder={t('admin.courseInstructorExample') || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Users className="w-4 h-4" /> {t('workshops.capacity')}
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Upload className="w-4 h-4" /> {t('admin.courseThumbnail')}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="workshop-thumb"
                            />
                            <label
                                htmlFor="workshop-thumb"
                                className="flex items-center justify-center w-full px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    {thumbnailFile ? thumbnailFile.name : (initialData?.thumbnail_url ? t('admin.courseCustomImage') : t('admin.courseChooseImage'))}
                                </div>
                            </label>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <AlignLeft className="w-4 h-4" /> {t('admin.courseDesc')}
                            </label>
                            <textarea
                                rows={4}
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
                        >
                            {t('admin.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('admin.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
