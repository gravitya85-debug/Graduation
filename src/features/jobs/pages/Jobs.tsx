import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Search, MapPin, Briefcase, Building, Loader2, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../../components/PageBanner';

export default function Jobs() {
    const { user, role, isProfileComplete } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'all' | 'applied'>('all');
    const [jobs, setJobs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [showCompanyInfo, setShowCompanyInfo] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, [user, activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'all') {
                const { data, error } = await supabase
                    .from('jobs')
                    .select(`
                        *, 
                        users!jobs_company_id_fkey(
                            name, 
                            companies(description, website, location, logo_url)
                        )
                    `)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setJobs(data || []);

                // Also fetch user's applications to show "Applied" button
                if (user) {
                    const { data: appData } = await supabase
                        .from('applications')
                        .select('job_id')
                        .eq('graduate_id', user.id);
                    setApplications(appData || []);
                }
            } else {
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
            id, status, created_at, job_id,
            jobs (title, location, users!jobs_company_id_fkey(name))
          `)
                    .eq('graduate_id', user?.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setApplications(data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('jobs.applyFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId: string) => {
        if (!isProfileComplete) {
            toast.error(t(`profile.incompleteError_${role}`));
            return;
        }
        try {
            setSubmitting(jobId);

            const { data: existing } = await supabase
                .from('applications')
                .select('id')
                .eq('job_id', jobId)
                .eq('graduate_id', user?.id)
                .single();

            if (existing) {
                toast.error(t('jobs.alreadyApplied'));
                return;
            }

            const { error } = await supabase.from('applications').insert({
                job_id: jobId,
                graduate_id: user?.id,
                status: 'pending'
            });

            if (error) throw error;
            toast.success(t('jobs.applySuccess'));
            // Update local state to show "Applied" immediately
            setApplications([...applications, { job_id: jobId }]);
        } catch (error) {
            console.error(error);
            toast.error(t('jobs.applyFailed'));
        } finally {
            setSubmitting(null);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.description.toLowerCase().includes(search.toLowerCase());
        const matchesLocation = job.location?.toLowerCase().includes(locationFilter.toLowerCase());
        return matchesSearch && matchesLocation;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <PageBanner
                image="images/jobs-bg.png"
                title={t('jobs.title')}
                subtitle={t('jobs.subtitle')}
                icon={<Briefcase className="w-7 h-7 text-white" />}
                gradient="from-blue-700/85 to-cyan-700/85"
            />

            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('all')}
                >
                    {t('jobs.allJobs')}
                </button>
                <button
                    className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'applied' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('applied')}
                >
                    {t('jobs.myApplications')}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : activeTab === 'all' ? (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                        <div className="flex-1 relative group">
                            <Search className="w-5 h-5 absolute rtl:right-4 ltr:left-4 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={t('jobs.searchPlaceholder')}
                                className="w-full rtl:pr-12 ltr:pl-12 rtl:pl-4 ltr:pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 relative">
                            <MapPin className="w-5 h-5 absolute rtl:right-3 ltr:left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('jobs.locationPlaceholder')}
                                className="w-full rtl:pr-10 ltr:pl-10 rtl:pl-4 ltr:pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Job List */}
                    <div className="space-y-4">
                        {filteredJobs.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">{t('jobs.noJobs')}</p>
                            </div>
                        ) : (
                            filteredJobs.map(job => (
                                <div key={job.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-premium dark:hover:shadow-premium-dark transition-all duration-300 hover:-translate-y-1 group">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                <button 
                                                    onClick={() => setShowCompanyInfo(showCompanyInfo === job.id ? null : job.id)}
                                                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-medium"
                                                >
                                                    <Building className="w-4 h-4" /> {job.users?.name || t('jobs.unknownCompany')}
                                                </button>
                                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location || t('jobs.remote')}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(job.created_at).toLocaleDateString()}</span>
                                            </div>
                                            
                                            {showCompanyInfo === job.id && job.users?.companies && (
                                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        {job.users.companies.logo_url && (
                                                            <img src={job.users.companies.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-bold">{job.users.name}</p>
                                                            {job.users.companies.website && (
                                                                <a href={job.users.companies.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                                                    {job.users.companies.website}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {job.users.companies.description}
                                                    </p>
                                                </div>
                                            )}

                                            <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                                                {job.description}
                                            </p>
                                            {job.requirements && job.requirements.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {job.requirements.map((req: string, i: number) => (
                                                        <span key={i} className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                                                            {req}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {(() => {
                                            const hasApplied = applications.some(app => app.job_id === job.id);
                                            return (
                                                <button
                                                    onClick={() => handleApply(job.id)}
                                                    disabled={submitting === job.id || hasApplied}
                                                    className={`whitespace-nowrap font-bold py-2.5 px-8 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                                                        ${hasApplied
                                                            ? 'bg-green-100 text-green-700 border border-green-200 shadow-none'
                                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                                        }`}
                                                >
                                                    {submitting === job.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : hasApplied ? (
                                                        <><CheckCircle className="w-4 h-4" /> {t('jobs.applied') || 'Applied'}</>
                                                    ) : (
                                                        t('jobs.applyNow')
                                                    )}
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                /* Applications Tab */
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-x-auto">
                    {applications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            {t('jobs.noApplicationsYet')}
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('jobs.jobTitle')}</th>
                                    <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('jobs.company')}</th>
                                    <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('jobs.appliedOn')}</th>
                                    <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('jobs.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {applications.map(app => (
                                    <tr key={app.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {app.jobs?.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {app.jobs?.users?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border capitalize
                        ${app.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    app.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                                        'bg-yellow-100 text-yellow-800 border-yellow-200'}
                      `}>
                                                {app.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}


