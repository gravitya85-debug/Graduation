import React, { useState, useEffect } from 'react';
import { X, Loader2, UploadCloud, Film, Image as ImageIcon, BookOpen, Plus, Trash2, FileText, DollarSign, User } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Course } from './CourseTable';

interface CourseFormProps {
    initialData: Course | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface LessonData {
    id?: string;
    title: string;
    video_url?: string;
    pdf_url?: string;
    fileVideo?: File | null;
    filePdf?: File | null;
}

export default function CourseForm({ initialData, onClose, onSuccess }: CourseFormProps) {
    const { user, role } = useAuth();
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [loadingLessons, setLoadingLessons] = useState(false);

    // Core form fields
    const [form, setForm] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        category: initialData?.category || 'Educational Technology',
        level: initialData?.level || 'Beginner',
        duration: initialData?.duration || '',
        instructor_name: initialData?.instructor_name || '',
        is_free: initialData?.is_free ?? true,
        price: initialData?.price || 0,
        original_price: initialData?.original_price || 0,
    });

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '');

    const [lessons, setLessons] = useState<LessonData[]>([{ title: '', video_url: '', pdf_url: '' }]);

    const categories = ['Educational Technology', 'Home Economics', 'Art Education', 'Music Education', 'Educational Media', 'Kindergarten', 'Skills Development'];

    useEffect(() => {
        if (initialData?.id) {
            setLoadingLessons(true);
            supabase.from('course_lessons')
                .select('*')
                .eq('course_id', initialData.id)
                .order('order_index', { ascending: true })
                .then(({ data, error }) => {
                    setLoadingLessons(false);
                    if (!error && data && data.length > 0) {
                        setLessons(data.map(l => ({ ...l, fileVideo: null, filePdf: null })));
                    } else if (initialData.content_url) {
                        setLessons([{ title: 'Lesson 1', video_url: initialData.content_url, pdf_url: '' }]);
                    }
                });
        }
    }, [initialData]);

    const uploadToSupabase = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Math.random()}.${fileExt}`;

        try {
            const { error } = await supabase.storage.from('courses').upload(fileName, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('courses').getPublicUrl(fileName);
            return publicUrl;
        } catch (error: any) {
            throw new Error(`Failed to upload ${file.name}.`);
        }
    };

    const addLesson = () => setLessons([...lessons, { title: '', video_url: '', pdf_url: '' }]);
    const removeLesson = (index: number) => setLessons(lessons.filter((_, i) => i !== index));

    const handleLessonChange = (index: number, field: keyof LessonData, value: any) => {
        const newLessons = [...lessons];
        newLessons[index] = { ...newLessons[index], [field]: value };
        setLessons(newLessons);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const toastId = toast.loading(t('admin.courseSaving') || 'Saving Course...');

            let finalThumbnailUrl = thumbnailUrl;

            if (thumbnailFile) {
                finalThumbnailUrl = await uploadToSupabase(thumbnailFile, 'thumbnails');
            }

            const payload = {
                ...form,
                thumbnail_url: finalThumbnailUrl,
                instructor_id: initialData?.instructor_id || (role === 'doctor' ? user.id : null),
            };

            let courseId = initialData?.id;

            if (courseId) {
                const { error } = await supabase.from('courses').update(payload).eq('id', courseId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('courses').insert(payload).select().single();
                if (error) throw error;
                courseId = data.id;
            }

            // Save lessons
            for (let i = 0; i < lessons.length; i++) {
                const l = lessons[i];
                let finalVid = l.video_url;
                let finalPdf = l.pdf_url;

                if (l.fileVideo) {
                    toast.success(`Uploading Video for Lesson ${i + 1}...`, { id: toastId });
                    finalVid = await uploadToSupabase(l.fileVideo, `lessons/${courseId}`);
                }
                if (l.filePdf) {
                    toast.success(`Uploading PDF for Lesson ${i + 1}...`, { id: toastId });
                    finalPdf = await uploadToSupabase(l.filePdf, `lessons/${courseId}`);
                }

                const lessonPayload = {
                    course_id: courseId,
                    title: l.title || `Lesson ${i + 1}`,
                    video_url: finalVid,
                    pdf_url: finalPdf,
                    order_index: i
                };

                if (l.id) {
                    await supabase.from('course_lessons').update(lessonPayload).eq('id', l.id);
                } else {
                    await supabase.from('course_lessons').insert(lessonPayload);
                }
            }

            toast.success(t('admin.courseSaved') || 'Course saved successfully!', { id: toastId });
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Error saving course data', { id: 'save-error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-3xl text-start overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle max-w-4xl w-full border border-gray-100 dark:border-gray-800 animate-fade-in-up">

                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                            {initialData ? t('admin.courseEdit') || 'Edit Course' : t('admin.courseCreateNew') || 'Create New Course'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[75vh] overflow-y-auto">
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Basic Details */}
                            <div className="space-y-5 md:col-span-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.courseTitle') || 'Course Title'} <span className="text-red-500">*</span></label>
                                    <input type="text" required placeholder={t('admin.courseTitleExample') || 'e.g. Advanced UI/UX Design'} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm" />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.courseDesc') || 'Description'} <span className="text-red-500">*</span></label>
                                    <textarea required rows={4} placeholder={t('admin.courseDesc') || 'Describe the course...'} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm resize-none"></textarea>
                                </div>
                            </div>

                            {/* Select Menus */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.courseCategory') || 'Category'} <span className="text-red-500">*</span></label>
                                <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm">
                                    {categories.map(c => <option key={c} value={c}>{t(`courses.${c.toLowerCase()}`) || c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.courseLevel') || 'Level'} <span className="text-red-500">*</span></label>
                                <select required value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm">
                                    <option value="Beginner">{t('courses.beginner') || 'Beginner'}</option>
                                    <option value="Intermediate">{t('courses.intermediate') || 'Intermediate'}</option>
                                    <option value="Advanced">{t('courses.advanced') || 'Advanced'}</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.courseDuration') || 'Overall Duration (Text)'}</label>
                                <input type="text" placeholder={t('admin.courseDurationExample') || "e.g. 3 hours"} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm" />
                            </div>

                            {/* Instructor Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    <User className="w-4 h-4 inline rtl:ml-1 ltr:mr-1 text-indigo-500" />
                                    {t('admin.courseInstructor') || 'Instructor Name'}
                                </label>
                                <input type="text" placeholder={t('admin.courseInstructorExample') || 'e.g. Dr. Ahmed El-Sayed'} value={form.instructor_name} onChange={e => setForm({ ...form, instructor_name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm" />
                            </div>

                            {/* Pricing Section */}
                            <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                    <h4 className="font-bold text-gray-900 dark:text-white">{t('admin.coursePricing') || 'Pricing'}</h4>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_free}
                                        onChange={e => setForm({ ...form, is_free: e.target.checked, price: e.target.checked ? 0 : form.price, original_price: e.target.checked ? 0 : form.original_price })}
                                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.courseIsFree') || 'This course is Free'}</span>
                                </label>

                                {!form.is_free && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('admin.coursePrice') || 'Price (EGP)'}</label>
                                            <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('admin.courseOriginalPrice') || 'Original Price (EGP) — for discount'}</label>
                                            <input type="number" min="0" step="0.01" value={form.original_price} onChange={e => setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        {form.original_price > form.price && form.price > 0 && (
                                            <div className="md:col-span-2 text-sm text-green-600 dark:text-green-400 font-bold">
                                                🏷️ {t('admin.courseDiscountPreview') || 'Discount'}: {Math.round(((form.original_price - form.price) / form.original_price) * 100)}% off
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <div className="rounded-xl border border-gray-300 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                    {(thumbnailUrl || thumbnailFile) && (
                                        <div className="absolute inset-0 z-0 opacity-20">
                                            <img src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : thumbnailUrl} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                    <div className="relative z-10 w-full flex flex-col items-center">
                                        <ImageIcon className="w-8 h-8 mb-2 text-indigo-400" />
                                        <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:shadow-md transition">
                                            {t('admin.courseChooseImage') || 'Choose Cover Image'}
                                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setThumbnailFile(e.target.files[0])} />
                                        </label>
                                        <p className="mt-2 text-xs text-gray-500">{thumbnailFile?.name || (thumbnailUrl ? 'Image Selected' : '')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Lessons Manager */}
                            <div className="md:col-span-2 mt-4 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Film className="w-5 h-5 text-indigo-500" />
                                        Lessons & Content
                                    </h4>
                                    <button type="button" onClick={addLesson} className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 py-1.5 px-3 rounded-lg transition-colors">
                                        <Plus className="w-4 h-4" /> Add Lesson
                                    </button>
                                </div>

                                {loadingLessons ? (
                                    <p className="text-gray-500 text-sm">Loading lessons...</p>
                                ) : (
                                    <div className="space-y-4">
                                        {lessons.map((lesson, idx) => (
                                            <div key={idx} className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                                                {lessons.length > 1 && (
                                                    <button type="button" onClick={() => removeLesson(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-500 p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2 pr-8">
                                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Lesson {idx + 1} Title</label>
                                                        <input type="text" required placeholder="e.g. Introduction" value={lesson.title} onChange={e => handleLessonChange(idx, 'title', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="w-full">
                                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                                                {t('admin.courseExternalVideo') || 'External Video URL (Optional if uploading)'}
                                                            </label>
                                                            <input
                                                                type="url"
                                                                placeholder="e.g. https://www.youtube.com/watch?v=..."
                                                                value={!lesson.fileVideo ? (lesson.video_url || '') : ''}
                                                                onChange={e => handleLessonChange(idx, 'video_url', e.target.value)}
                                                                disabled={!!lesson.fileVideo}
                                                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Video Input */}
                                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center flex flex-col items-center justify-between">
                                                                <label className="cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300 flex flex-col items-center justify-center gap-2">
                                                                    <Film className="w-5 h-5 text-indigo-400" />
                                                                    {lesson.fileVideo ? lesson.fileVideo.name : (lesson.video_url ? (t('admin.courseOrUpload') || 'Or Upload Video') : (t('admin.courseUploadVideo') || 'Upload Video (MP4)'))}
                                                                    <input type="file" className="hidden" accept="video/mp4" onChange={e => e.target.files && handleLessonChange(idx, 'fileVideo', e.target.files[0])} />
                                                                </label>
                                                                {lesson.fileVideo && (
                                                                    <button type="button" onClick={() => handleLessonChange(idx, 'fileVideo', null)} className="text-xs text-red-500 mt-2 hover:underline">
                                                                        {t('admin.removeFile') || 'Remove File'}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* PDF Input */}
                                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center flex flex-col items-center justify-between">
                                                                <label className="cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300 flex flex-col items-center justify-center gap-2">
                                                                    <FileText className="w-5 h-5 text-rose-400" />
                                                                    {lesson.filePdf ? lesson.filePdf.name : (lesson.pdf_url ? 'PDF Selected' : (t('admin.courseUploadPdf') || 'Upload PDF (Opt)'))}
                                                                    <input type="file" className="hidden" accept="application/pdf" onChange={e => e.target.files && handleLessonChange(idx, 'filePdf', e.target.files[0])} />
                                                                </label>
                                                                {lesson.filePdf && (
                                                                    <button type="button" onClick={() => handleLessonChange(idx, 'filePdf', null)} className="text-xs text-red-500 mt-2 hover:underline">
                                                                        {t('admin.removeFile') || 'Remove File'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="px-6 py-5 bg-gray-50/80 dark:bg-gray-900/80 sm:flex sm:flex-row-reverse sm:gap-3 rounded-b-3xl">
                            <button type="submit" disabled={submitting} className="w-full inline-flex justify-center rounded-xl px-8 py-3 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 sm:w-auto sm:text-sm disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-indigo-600/20">
                                {submitting && <Loader2 className="w-4 h-4 rtl:ml-2 ltr:mr-2 animate-spin" />}
                                {submitting ? (t('admin.courseSaving') || 'Saving...') : (t('admin.courseSave') || 'Save Course')}
                            </button>
                            <button type="button" onClick={onClose} disabled={submitting} className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-200 dark:border-gray-700 px-8 py-3 bg-white dark:bg-gray-800 text-base font-bold text-gray-700 dark:text-gray-300 sm:mt-0 sm:w-auto sm:text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95">
                                {t('admin.cancel') || 'Cancel'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
