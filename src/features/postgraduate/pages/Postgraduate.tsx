import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { GraduationCap, Search, Filter, Loader2, Calendar, Building, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../../components/PageBanner';

export default function Postgraduate() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        fetchPrograms();
    }, []); // Removed user dependency for public viewing

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('postgraduate')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPrograms(data || []);
        } catch (error) {
            console.error(error);
            toast.error(t('postgraduate.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    const filteredPrograms = programs.filter(prog => {
        const matchesSearch = prog.title.toLowerCase().includes(search.toLowerCase()) ||
            (prog.university || '').toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === '' || prog.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getStyleForType = (type: string) => {
        switch (type) {
            case 'masters': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'phd': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'diploma': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <PageBanner
                image="images/postgraduate-banner.png"
                title={t('postgraduate.title')}
                subtitle={t('postgraduate.subtitle')}
                icon={<GraduationCap className="w-7 h-7 text-white" />}
                gradient="from-purple-700/85 to-fuchsia-700/85"
            />

            <div className="flex flex-col sm:flex-row gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="flex-1 relative group">
                    <Search className="w-5 h-5 absolute rtl:right-4 ltr:left-4 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={t('postgraduate.searchPlaceholder')}
                        className="w-full rtl:pr-12 ltr:pl-12 rtl:pl-4 ltr:pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex-1 sm:max-w-xs relative group">
                    <Filter className="w-5 h-5 absolute rtl:right-4 ltr:left-4 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <select
                        className="w-full rtl:pr-12 ltr:pl-12 rtl:pl-4 ltr:pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none capitalize transition-all shadow-sm"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">{t('postgraduate.allProgramTypes')}</option>
                        <option value="masters">{t('postgraduate.masters')}</option>
                        <option value="phd">{t('postgraduate.phd')}</option>
                        <option value="diploma">{t('postgraduate.diploma')}</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                ) : filteredPrograms.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t('postgraduate.noPrograms')}</p>
                    </div>
                ) : (
                    filteredPrograms.map(prog => (
                        <Link
                            key={prog.id}
                            to={`/postgraduate/${prog.id}`}
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm hover:shadow-premium border border-gray-100 dark:border-gray-700/50 p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border capitalize ${getStyleForType(prog.type)}`}>
                                    {t(`postgraduate.${prog.type}`)}
                                </span>
                                {prog.is_paid ? (
                                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                                        {prog.fees?.toLocaleString()} {t('common.currency')}
                                    </span>
                                ) : (
                                    <span className="text-sm font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full border border-green-100 dark:border-green-800">
                                        {t('postgraduate.free')}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{prog.title}</h3>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-4 font-medium">
                                <Building className="w-4 h-4 text-indigo-500" /> {prog.university}
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                    {prog.duration || t('postgraduate.duration')}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded border border-orange-100 dark:border-orange-800">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {prog.deadline ? new Date(prog.deadline).toLocaleDateString() : '—'}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}


