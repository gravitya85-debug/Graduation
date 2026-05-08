import React from 'react';
import { PlayCircle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface CourseCardProps {
    course: {
        id: string;
        title: string;
        description: string;
        category: string;
        level: string;
        thumbnail_url?: string;
        duration: string;
        instructor_name?: string;
        is_free?: boolean;
        price?: number;
        original_price?: number;
        avg_rating?: number;
        review_count?: number;
    };
    enrollment?: {
        progress: number;
        status: 'not_started' | 'in_progress' | 'completed';
    };
}

export default function CourseCard({ course, enrollment }: CourseCardProps) {
    const { t } = useTranslation();

    const isEnrolled = !!enrollment;
    const isCompleted = enrollment?.status === 'completed';

    const isFree = course.is_free !== false;
    const price = course.price || 0;
    const originalPrice = course.original_price || 0;
    const hasDiscount = !isFree && originalPrice > price && price > 0;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const avgRating = course.avg_rating || 0;
    const reviewCount = course.review_count || 0;
    const hasReviews = reviewCount > 0;

    const instructorName = course.instructor_name || t('courses.unknownInstructor') || 'Instructor';

    return (
        <Link
            to={`/courses/${course.id}`}
            className="group flex flex-col h-full bg-white dark:bg-[#1c1d1f] hover:bg-gray-50/50 dark:hover:bg-[#2d2f31] rounded-none sm:rounded-sm transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700/50 overflow-hidden"
        >
            {/* Thumbnail */}
            <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 sm:rounded-sm overflow-hidden z-0">
                <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105 z-0">
                    {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <PlayCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                </div>
                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-2 ltr:left-2 rtl:right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-20">
                        -{discountPercent}%
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="pt-2 pb-2 px-1 flex-1 flex flex-col">
                <h3 className="text-[1rem] leading-[1.2] font-bold text-[#1c1d1f] dark:text-gray-100 mb-1 line-clamp-2">
                    {course.title}
                </h3>

                <p className="text-xs text-[#6a6f73] dark:text-gray-400 mb-1 line-clamp-1">
                    {instructorName}
                </p>

                {/* Rating */}
                {hasReviews && (
                    <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-bold text-[#b4690e] dark:text-[#e59819] leading-tight">{avgRating.toFixed(1)}</span>
                        <div className="flex text-[#b4690e] dark:text-[#e59819]">
                            {[...Array(5)].map((_, i) => {
                                const isFilled = i < Math.floor(avgRating);
                                const isHalf = !isFilled && i < avgRating;
                                return <Star key={i} fill="currentColor" strokeWidth={1.5} className={`w-3.5 h-3.5 ${isFilled ? '' : (isHalf ? 'opacity-60' : 'text-gray-300 dark:text-gray-600 fill-transparent')}`} />;
                            })}
                        </div>
                        <span className="text-xs text-[#6a6f73] dark:text-gray-400 leading-tight">({reviewCount.toLocaleString()})</span>
                    </div>
                )}

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-2">
                    {isFree ? (
                        <span className="text-base font-bold text-green-600 dark:text-green-400">{t('courses.free') || 'Free'}</span>
                    ) : (
                        <>
                            <span className="text-base font-bold text-[#1c1d1f] dark:text-gray-100">{price.toFixed(2)} {t('common.currency')}</span>
                            {hasDiscount && (
                                <span className="text-sm text-[#6a6f73] dark:text-gray-400 line-through">{originalPrice.toFixed(2)} {t('common.currency')}</span>
                            )}
                        </>
                    )}
                </div>

                {/* Tags / Badges */}
                <div className="flex flex-wrap gap-2 items-center mt-auto">
                    <span className="bg-gray-100 dark:bg-[#2d2f31] text-gray-700 dark:text-gray-300 text-xs font-semibold px-2 py-0.5 rounded-sm">
                        {course.level ? (t(`courses.${course.level.toLowerCase()}`) || course.level) : 'All Levels'}
                    </span>
                </div>

                {/* Enrollment Progress */}
                {isEnrolled && enrollment && (
                    <div className="mt-3 text-left">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 overflow-hidden rounded-full">
                            <div
                                className={`h-full transition-all duration-1000 bg-indigo-600`}
                                style={{ width: `${isCompleted ? 100 : enrollment.progress || 0}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[11px] font-semibold mt-1 text-gray-600 dark:text-gray-400">
                            <span>{isCompleted ? '100% complete' : `${enrollment.progress || 0}% complete`}</span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}
