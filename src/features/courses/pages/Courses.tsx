import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../../components/PageBanner';
import CourseCard from '../components/CourseCard';
import FilterBar from '../components/FilterBar';
import CourseCardSkeleton from '../components/CourseCardSkeleton';

export default function Courses() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [courses, setCourses] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedLevel, setSelectedLevel] = useState('All');

    useEffect(() => {
        if (user) {
            fetchCoursesAndEnrollments();
        }
    }, [user]);

    const fetchCoursesAndEnrollments = async () => {
        try {
            setLoading(true);

            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (coursesError) throw coursesError;

            const { data: enrollmentsData, error: enrollmentsError } = await supabase
                .from('course_progress')
                .select('*')
                .eq('user_id', user?.id);

            if (enrollmentsError && enrollmentsError.code !== 'PGRST116' && enrollmentsError.code !== '42P01') {
                console.error("Enrollment error:", enrollmentsError);
            }

            // Try to fetch advanced progress (Will fail silently if tables don't exist yet before migrations)
            const { data: lessonsData } = await supabase.from('course_lessons').select('id, course_id');
            const { data: progressData } = await supabase.from('lesson_progress').select('*').eq('user_id', user?.id);

            const fetchedLessons = lessonsData || [];
            const fetchedProgress = progressData || [];

            const lessonsByCourse = fetchedLessons.reduce((acc, l) => {
                acc[l.course_id] = (acc[l.course_id] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const completedByCourse = fetchedProgress.filter(p => p.completed).reduce((acc, p) => {
                const lesson = fetchedLessons.find(l => l.id === p.lesson_id);
                if (lesson) {
                    acc[lesson.course_id] = (acc[lesson.course_id] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>);

            const mappedEnrollments = (enrollmentsData || []).map(e => {
                const total = lessonsByCourse[e.course_id] || 0;
                const completed = completedByCourse[e.course_id] || 0;

                let exactProgress = e.completed ? 100 : 0;
                if (total > 0) {
                    exactProgress = Math.round((completed / total) * 100);
                }

                return {
                    ...e,
                    progress: exactProgress,
                    status: (e.completed || exactProgress === 100) ? 'completed' : 'in_progress'
                };
            });

            setCourses(coursesData || []);

            // Fetch aggregated reviews
            const { data: reviewsData } = await supabase.from('course_reviews').select('course_id, rating');
            const reviewAgg: Record<string, { sum: number; count: number }> = {};
            (reviewsData || []).forEach(r => {
                if (!reviewAgg[r.course_id]) reviewAgg[r.course_id] = { sum: 0, count: 0 };
                reviewAgg[r.course_id].sum += r.rating;
                reviewAgg[r.course_id].count += 1;
            });

            // Attach avg_rating and review_count to each course
            const enrichedCourses = (coursesData || []).map(c => ({
                ...c,
                avg_rating: reviewAgg[c.id] ? reviewAgg[c.id].sum / reviewAgg[c.id].count : 0,
                review_count: reviewAgg[c.id]?.count || 0,
            }));

            setCourses(enrichedCourses);
            setEnrollments(mappedEnrollments);
        } catch (error) {
            console.error(error);
            toast.error(t('courses.failedToLoad') || 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    // Derived State Logic
    const isFiltering = searchQuery !== '' || selectedCategory !== 'All' || selectedLevel !== 'All';

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

        return matchesSearch && matchesCategory && matchesLevel;
    });

    const enrolledCourses = courses.filter(course => enrollments.some(e => e.course_id === course.id));
    const availableCourses = courses.filter(course => !enrollments.some(e => e.course_id === course.id));

    // Bonus: Popular Courses (Mocked by grabbing top 4 latest or most "prominent", using created_at sorting from DB)
    const popularCourses = useMemo(() => {
        return [...availableCourses].slice(0, 4);
    }, [availableCourses]);

    // Bonus: Recommended Courses (Mocked logic: picking different subset if available)
    const recommendedCourses = useMemo(() => {
        if (availableCourses.length > 4) {
            return [...availableCourses].slice(4, 8);
        }
        return [...availableCourses].slice(0, 4); // Fallback
    }, [availableCourses]);

    const renderSkeletons = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(idx => <CourseCardSkeleton key={idx} />)}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">
            <PageBanner
                image="/images/courses-banner.png"
                title={t('courses.title') || 'Graduate Hub Courses'}
                subtitle={t('courses.subtitle') || 'Upgrade your skills, learn from experts, and land your dream job.'}
                icon={<BookOpen className="w-7 h-7 text-white" />}
                gradient="from-indigo-700/85 to-purple-800/85"
            />

            <FilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
            />

            {loading ? (
                renderSkeletons()
            ) : filteredCourses.length === 0 ? (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-16 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 shadow-sm animate-fade-in-up">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 flex items-center justify-center rounded-3xl mx-auto mb-5 rotate-3">
                        <BookOpen className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('courses.noCourses') || 'No courses found'}</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{t('courses.noCoursesBody') || "We couldn't find any courses matching your current search parameters. Try clearing your filters."}</p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedLevel('All'); }}
                        className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                        {t('courses.clearFilters') || 'Clear all filters'}
                    </button>
                </div>
            ) : (
                <div className="space-y-12">

                    {/* Active Filters View (If user is filtering, just show the grid of results to avoid confusion) */}
                    {isFiltering ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('courses.searchResults') || 'Search Results'}</h2>
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                    {filteredCourses.length} {t('courses.matches') || 'Matches'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredCourses.map(course => (
                                    <CourseCard key={course.id} course={course} enrollment={enrollments.find(e => e.course_id === course.id)} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Default Dashboard View (No active filtering) */
                        <>
                            {/* Section 1: My Learning */}
                            {enrolledCourses.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('courses.myLearning') || 'My Learning'}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {enrolledCourses.map(course => (
                                            <CourseCard key={course.id} course={course} enrollment={enrollments.find(e => e.course_id === course.id)} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 2: Recommended For You (Bonus) */}
                            {recommendedCourses.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('courses.recommendedForYou') || 'Recommended for You'}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {recommendedCourses.map(course => (
                                            <CourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Popular Courses (Bonus) */}
                            {popularCourses.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('courses.popularRightNow') || 'Popular Right Now'}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {popularCourses.map(course => (
                                            <CourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
