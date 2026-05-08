import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FilterBarProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    selectedCategory: string;
    setSelectedCategory: (val: string) => void;
    selectedLevel: string;
    setSelectedLevel: (val: string) => void;
}

export default function FilterBar({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel
}: FilterBarProps) {
    const { t } = useTranslation();

    const categories = ['All', 'Educational Technology', 'Home Economics', 'Art Education', 'Music Education', 'Educational Media', 'Kindergarten', 'Skills Development'];
    const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96 flex-shrink-0">
                <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={t('courses.searchPlaceholder') || "Search courses..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
            </div>

            {/* Filters */}
            <div className="flex w-full md:w-auto gap-3 items-center overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <div className="flex shrink-0 items-center gap-2 px-2 border-r border-gray-200 dark:border-gray-700 mr-2 pr-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('courses.filters') || "Filters"}</span>
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 cursor-pointer"
                >
                    {categories.map(c => (
                        <option key={c} value={c}>
                            {c === 'All'
                                ? (t('courses.allCategories') || 'All Categories')
                                : (t(`courses.${c.toLowerCase()}`) || c)
                            }
                        </option>
                    ))}
                </select>

                <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 cursor-pointer"
                >
                    {levels.map(l => (
                        <option key={l} value={l}>{l === 'All' ? (t('courses.allLevels') || 'All Levels') : (t(`courses.${l.toLowerCase()}`) || l)}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
