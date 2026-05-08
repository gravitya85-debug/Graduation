import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton = ({ className = '', variant = 'rect' }: SkeletonProps) => {
    const baseClass = "animate-pulse bg-gray-200 dark:bg-gray-800";
    const variantClasses = {
        text: "h-4 w-full rounded",
        rect: "h-32 w-full rounded-2xl",
        circle: "h-12 w-12 rounded-full"
    };

    return (
        <div className={`${baseClass} ${variantClasses[variant]} ${className}`} />
    );
};

export const CardSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-4">
            <Skeleton variant="circle" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-1/3" />
                <Skeleton variant="text" className="w-1/2 h-3" />
            </div>
        </div>
        <Skeleton variant="rect" className="h-20" />
        <div className="flex justify-between">
            <Skeleton variant="text" className="w-1/4 h-8" />
            <Skeleton variant="text" className="w-1/4 h-8" />
        </div>
    </div>
);

export const StatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                <Skeleton variant="circle" className="w-10 h-10" />
                <Skeleton variant="text" className="w-1/2" />
                <Skeleton variant="text" className="w-3/4 h-8" />
            </div>
        ))}
    </div>
);
