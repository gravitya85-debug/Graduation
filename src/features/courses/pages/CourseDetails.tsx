
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { Play, CheckCircle, ChevronLeft, Award, Clock, BookOpen, BarChart, ExternalLink, Loader2, Download, Lock, Check, Star, User, Send, Trash2, Edit2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function CourseDetails() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { user, role, isProfileComplete } = useAuth();

    // Reviews
    const [reviews, setReviews] = useState<any[]>([]);
    const [myReview, setMyReview] = useState<{ rating: number; comment: string }>({ rating: 0, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);

    useEffect(() => {
        fetchCourseData();
    }, [id, user]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData);

            // Fetch Lessons
            const { data: lessonsData } = await supabase
                .from('course_lessons')
                .select('*')
                .eq('course_id', id)
                .order('order_index', { ascending: true });

            const fetchedLessons = lessonsData || [];

            // Legacy fallback if migrating
            if (fetchedLessons.length === 0 && courseData.content_url) {
                fetchedLessons.push({
                    id: 'legacy-1',
                    title: courseData.title,
                    video_url: courseData.content_url,
                    pdf_url: null,
                    order_index: 0
                });
            }

            setLessons(fetchedLessons);

            if (fetchedLessons.length > 0) {
                setActiveLessonId(fetchedLessons[0].id);
            }

            if (user) {
                // Fetch Enrollment
                const { data: enrollmentData } = await supabase
                    .from('course_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('course_id', id)
                    .single();

                if (enrollmentData) {
                    setEnrollment(enrollmentData);

                    // Fetch Lesson Progress (Safely ignore if table not created yet)
                    const { data: progressData, error: pgError } = await supabase
                        .from('lesson_progress')
                        .select('*')
                        .eq('user_id', user.id);

                    if (progressData && !pgError) {
                        const pMap: Record<string, boolean> = {};
                        progressData.forEach(p => {
                            pMap[p.lesson_id] = p.completed;
                        });
                        setProgressMap(pMap);

                        // Set active lesson to first incomplete
                        const firstIncomplete = fetchedLessons.find(l => !pMap[l.id]);
                        if (firstIncomplete) {
                            setActiveLessonId(firstIncomplete.id);
                        } else if (fetchedLessons.length > 0) {
                            setActiveLessonId(fetchedLessons[fetchedLessons.length - 1].id);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(t('courses.failedToLoad') || 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!id || !user) return;
        try {
            setActionLoading(true);
            const { error } = await supabase
                .from('course_reviews')
                .delete()
                .eq('course_id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            toast.success(t('courses.reviewDeleted') || 'Review deleted successfully!');
            setHasReviewed(false);
            setMyReview({ rating: 0, comment: '' });
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error(t('courses.errorDeletingReview') || 'Failed to delete review');
        } finally {
            setActionLoading(false);
        }
    };

    const fetchReviews = async () => {
        if (!id) return;
        const { data, error } = await supabase
            .from('course_reviews')
            .select('*')
            .eq('course_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Reviews fetch error:', error);
            setReviews([]);
            return;
        }

        const reviewsList = data || [];

        // Fetch user names from the public users table
        if (reviewsList.length > 0) {
            const userIds = [...new Set(reviewsList.map(r => r.user_id))];
            const { data: usersData } = await supabase
                .from('users')
                .select('id, full_name')
                .in('id', userIds);

            const usersMap: Record<string, string> = {};
            (usersData || []).forEach(u => { usersMap[u.id] = u.full_name; });

            reviewsList.forEach(r => {
                r.user_name = usersMap[r.user_id] || '';
            });
        }

        setReviews(reviewsList);

        if (user) {
            const mine = reviewsList.find((r: any) => r.user_id === user.id);
            if (mine) {
                setMyReview({ rating: mine.rating, comment: mine.comment || '' });
                setHasReviewed(true);
            }
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [id, user]);

    const handleEnroll = async () => {
        if (!user) {
            toast.error('Please login to enroll');
            return;
        }

        if (!isProfileComplete) {
            toast.error(t(`profile.incompleteError_${role}`));
            return;
        }

        // If the course is NOT free, redirect to payment page
        if (course.is_free === false) {
            navigate(`/checkout/course/${id}`);
            return;
        }

        try {
            setActionLoading(true);
            const { data, error } = await supabase
                .from('course_progress')
                .insert({
                    user_id: user.id,
                    course_id: id,
                    completed: false
                })
                .select()
                .single();

            if (error) throw error;

            setEnrollment(data);
            toast.success(t('courses.enrollSuccess') || 'Successfully enrolled in course!');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message ? `${t('courses.enrollFailed')}: ${error.message}` : t('courses.enrollFailed'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkLessonComplete = async (lessonId: string) => {
        if (!enrollment || !user) return;
        if (lessonId === 'legacy-1') {
            // handle legacy completion by just completing the course
            return handleCompleteCourse();
        }

        try {
            setActionLoading(true);

            const isCurrentlyCompleted = progressMap[lessonId] || false;

            if (isCurrentlyCompleted) {
                // Delete or unmark
                await supabase.from('lesson_progress').delete().eq('user_id', user.id).eq('lesson_id', lessonId);
                setProgressMap(prev => ({ ...prev, [lessonId]: false }));
            } else {
                // Upsert to mark complete
                await supabase.from('lesson_progress')
                    .upsert({ user_id: user.id, lesson_id: lessonId, completed: true }, { onConflict: 'user_id, lesson_id' });

                setProgressMap(prev => ({ ...prev, [lessonId]: true }));

                // Auto advance
                const currentIndex = lessons.findIndex(l => l.id === lessonId);
                const isLastLesson = currentIndex === lessons.length - 1;

                if (!isLastLesson) {
                    setActiveLessonId(lessons[currentIndex + 1].id);
                } else {
                    // Check if all lessons are now complete
                    const allCompleted = lessons.every(l => l.id === lessonId || progressMap[l.id]);
                    if (allCompleted && !enrollment.completed) {
                        await handleCompleteCourse(true);
                    }
                }
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    }

    const handleCompleteCourse = async (silent = false) => {
        if (!enrollment) return;
        try {
            setActionLoading(true);
            const newCompletedState = !enrollment.completed;

            const { data, error } = await supabase
                .from('course_progress')
                .update({ completed: newCompletedState })
                .eq('id', enrollment.id)
                .select()
                .single();

            if (error) throw error;

            setEnrollment(data);
            if (!silent) {
                if (newCompletedState) {
                    toast.success(t('courses.courseCompletedMsg') || 'Course completed!');
                } else {
                    toast.success(t('courses.courseIncompleteMsg') || 'Course progress reset.');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(t('courses.errorUpdating') || 'Error updating progress');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!course) return null;

    const isEnrolled = !!enrollment;

    // Total progress calculations
    const completedCount = lessons.filter(l => progressMap[l.id] || (l.id === 'legacy-1' && enrollment?.completed)).length;
    const totalLessons = lessons.length;
    const progressPercent = totalLessons === 0 ? (enrollment?.completed ? 100 : 0) : Math.round((completedCount / totalLessons) * 100);

    const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const isYoutube = activeLesson?.video_url?.includes('youtube.com') || activeLesson?.video_url?.includes('youtu.be');
    const youtubeId = isYoutube ? getYoutubeId(activeLesson.video_url) : null;

    return (
        <div className="max-w-[1600px] mx-auto pb-12">

            {/* Dark Header Banner */}
            <div className="bg-gray-900 text-white p-6 md:p-8 lg:p-10 mb-6 lg:mb-8 rounded-none md:rounded-b-3xl shadow-xl w-full">
                <button
                    onClick={() => navigate('/courses')}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium text-sm"
                >
                    <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                    {t('courses.backToCourses') || 'Back to Courses'}
                </button>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30">
                                {t(`courses.${course.category.toLowerCase()}`) || course.category}
                            </span>
                            <span className="flex items-center text-gray-400 text-sm font-medium">
                                <Clock className="w-4 h-4 rtl:ml-1.5 ltr:mr-1.5" />
                                {course.duration || '2 hours'}
                            </span>
                            <span className="flex items-center text-gray-400 text-sm font-medium">
                                <BarChart className="w-4 h-4 rtl:ml-1.5 ltr:mr-1.5" />
                                {t(`courses.${course.level.toLowerCase()}`) || course.level}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-gray-400 max-w-2xl text-lg mb-4 line-clamp-2">
                            {course.description}
                        </p>
                        {/* Instructor + Pricing */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            {course.instructor_name && (
                                <span className="flex items-center gap-1.5 text-gray-300">
                                    <User className="w-4 h-4" />
                                    {course.instructor_name}
                                </span>
                            )}
                            <span className="font-bold text-lg">
                                {course.is_free !== false ? (
                                    <span className="text-green-400">{t('courses.free') || 'Free'}</span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <span className="text-white">{(course.price || 0).toFixed(2)} {t('common.currency')}</span>
                                        {(course.original_price || 0) > (course.price || 0) && (
                                            <span className="text-gray-500 line-through text-sm">{(course.original_price || 0).toFixed(2)} {t('common.currency')}</span>
                                        )}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {isEnrolled && (
                    <div className="mt-4 max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <div className="flex justify-between text-white text-sm font-bold mb-2">
                            <span>{enrollment.completed ? (t('courses.courseCompleted') || 'Course Completed') : (t('courses.yourProgress') || 'Your Progress')}</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${enrollment.completed ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-indigo-400'}`}
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Udemy-Style Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-8">

                {/* Left Column: Video Player & Description */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Lesson Video Player */}
                    <div className="bg-black rounded-2xl overflow-hidden aspect-video relative shadow-2xl border border-gray-800">
                        {!isEnrolled ? (
                            // Not Enrolled Overlay
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-t from-gray-900 to-gray-800">
                                <Lock className="w-16 h-16 text-gray-400 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">{t('courses.readyToStart') || 'Ready to start?'}</h3>
                                <p className="text-gray-300 max-w-md mb-8">{course.is_free !== false ? t('courses.enrollPrompt') : t('courses.buyPrompt')}</p>
                                <button
                                    onClick={handleEnroll}
                                    disabled={actionLoading}
                                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-transform active:scale-95 shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                                    {course.is_free !== false ? t('courses.enrollFree') : t('courses.buyNow')}
                                </button>
                            </div>
                        ) : activeLesson?.video_url ? (
                            isYoutube ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&showinfo=0`}
                                    className="w-full h-full absolute inset-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    controls
                                    className="w-full h-full absolute inset-0 object-contain bg-black"
                                    src={activeLesson.video_url}
                                    controlsList="nodownload"
                                />
                            )
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                                <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                                <p>{t('courses.noVideoNote') || 'No video content available for this lesson. You can still mark it as complete.'}</p>
                            </div>
                        )}
                    </div>

                    {/* Active Lesson Controls */}
                    {isEnrolled && activeLesson && (
                        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeLesson.title}</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                {activeLesson.pdf_url && (
                                    <a
                                        href={activeLesson.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold transition"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF
                                    </a>
                                )}

                                <button
                                    onClick={() => handleMarkLessonComplete(activeLesson.id)}
                                    disabled={actionLoading}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${(activeLesson.id === 'legacy-1' ? enrollment?.completed : progressMap[activeLesson.id])
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                                        }`}
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                        (activeLesson.id === 'legacy-1' ? enrollment?.completed : progressMap[activeLesson.id]) ? <CheckCircle className="w-5 h-5" /> : <Play className="w-5 h-5" />
                                    }
                                    {(activeLesson.id === 'legacy-1' ? enrollment?.completed : progressMap[activeLesson.id]) ? 'Completed' : 'Complete & Next'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('courses.aboutCourse') || 'About this course'}</h2>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                            {course.description}
                        </p>
                    </div>

                    {/* Reviews Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500" />
                            {t('courses.reviews') || 'Reviews'}
                            {reviews.length > 0 && <span className="text-base font-normal text-gray-500">({reviews.length})</span>}
                        </h2>

                        {/* Write Review Form (enrolled users only) */}
                        {isEnrolled && (!hasReviewed || isEditingReview) && (
                            <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
                                {isEditingReview && (
                                    <button
                                        onClick={() => setIsEditingReview(false)}
                                        className="absolute top-4 rtl:left-4 ltr:right-4 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 pr-8 rtl:pr-0 rtl:pl-8">
                                    {hasReviewed ? (t('courses.editReview') || 'Edit Your Review') : (t('courses.writeReview') || 'Write a Review')}
                                </h3>
                                {/* Star Picker */}
                                <div className="flex items-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setMyReview(prev => ({ ...prev, rating: star }))}
                                            className="p-0.5 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-7 h-7 ${star <= myReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                            />
                                        </button>
                                    ))}
                                    {myReview.rating > 0 && <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ltr:ml-2 rtl:mr-2">{myReview.rating}/5</span>}
                                </div>
                                <textarea
                                    rows={3}
                                    placeholder={t('courses.reviewPlaceholder') || 'Share your experience with this course...'}
                                    value={myReview.comment}
                                    onChange={e => setMyReview(prev => ({ ...prev, comment: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-3"
                                />
                                <div className="flex items-center gap-3">
                                    <button
                                        disabled={myReview.rating === 0 || submittingReview}
                                        onClick={async () => {
                                            if (!user || myReview.rating === 0) return;
                                            try {
                                                setSubmittingReview(true);
                                                await supabase.from('course_reviews').upsert({
                                                    user_id: user.id,
                                                    course_id: id,
                                                    rating: myReview.rating,
                                                    comment: myReview.comment,
                                                }, { onConflict: 'user_id, course_id' });
                                                toast.success(t('courses.reviewSubmitted') || 'Review submitted!');
                                                setHasReviewed(true);
                                                setIsEditingReview(false);
                                                fetchReviews();
                                            } catch {
                                                toast.error('Failed to submit review');
                                            } finally {
                                                setSubmittingReview(false);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all"
                                    >
                                        {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        {isEditingReview ? (t('courses.updateReview') || 'Update Review') : (t('courses.submitReview') || 'Submit Review')}
                                    </button>

                                    {isEditingReview && (
                                        <button
                                            onClick={() => setIsEditingReview(false)}
                                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-all"
                                        >
                                            {t('common.cancel') || 'Cancel'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Existing Review Options */}
                        {isEnrolled && hasReviewed && !isEditingReview && (
                            <div className="mb-8 p-5 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-sm">
                                            {t('courses.youHaveReviewed') || 'You have reviewed this course'}
                                        </h3>
                                        <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-0.5">
                                            {t('courses.thankYouForReview') || 'Thank you for sharing your feedback'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => setIsEditingReview(true)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        {t('courses.edit') || 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(t('courses.confirmDeleteReview') || 'Are you sure you want to delete your review?')) {
                                                handleDeleteReview();
                                            }
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/30 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        {t('courses.delete') || 'Delete'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Reviews List */}
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">{t('courses.noReviews') || 'No reviews yet. Be the first to review!'}</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                                                    {(review.user_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {review.user_name || t('courses.anonymousUser') || 'User'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Lessons Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden sticky top-24">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white">{t('courses.courseContent') || 'Course Content'}</h3>
                            <p className="text-sm text-gray-500 mt-1">{completedCount} / {totalLessons} lessons completed</p>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
                            {lessons.map((lesson, index) => {
                                const isCompleted = lesson.id === 'legacy-1' ? enrollment?.completed : progressMap[lesson.id];
                                const isActive = activeLessonId === lesson.id;

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => setActiveLessonId(lesson.id)}
                                        disabled={!isEnrolled}
                                        className={`w-full text-left p-4 flex gap-4 transition-colors ${isActive
                                            ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-l-4 border-indigo-500'
                                            : isEnrolled ? 'hover:bg-gray-50 dark:hover:bg-gray-700/30 border-l-4 border-transparent' : 'opacity-75 cursor-not-allowed border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {isCompleted ? (
                                                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            ) : (
                                                <div className={`w-5 h-5 rounded-full border-2 ${isActive ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center`}>
                                                    {isActive && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-200'}`}>
                                                {index + 1}. {lesson.title}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                                {lesson.video_url && (
                                                    <span className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                        <Play className="w-3 h-3" /> Video
                                                    </span>
                                                )}
                                                {lesson.pdf_url && (
                                                    <span className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                        <BookOpen className="w-3 h-3" /> PDF
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            {lessons.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No lessons uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
