import React from 'react';

export default function CourseCardSkeleton() {
    return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden flex flex-col h-full animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full relative">
                <div className="absolute top-3 left-3 right-3 flex justify-between">
                    <div className="w-16 h-6 bg-white/50 dark:bg-gray-600/50 rounded-lg"></div>
                    <div className="w-20 h-6 bg-white/50 dark:bg-gray-600/50 rounded-lg"></div>
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
                </div>
                <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-4/5"></div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
                <div className="w-full h-11 bg-gray-200 dark:bg-gray-700 rounded-xl mt-auto"></div>
            </div>
        </div>
    );
}
