import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Briefcase, Award, BookOpen, Users, TrendingUp, Loader2, Calendar, Plus, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../../components/PageBanner';

export default function Home() {
    const { user, role, isProfileComplete } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        jobsApplied: 0,
        coursesCompleted: 0,
        certRequested: 0,
        companyJobsPosted: 0,
        companyApplicants: 0,
        adminUsers: 0,
        adminCertsPending: 0,
        doctorCourses: 0,
        doctorWorkshops: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        if (user && role) {
            fetchAnalytics();
        }
    }, [user, role]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const updates = { ...stats };

            if (role === 'graduate') {
                const { count: jobs } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('graduate_id', user?.id);
                const { count: courses } = await supabase.from('course_progress').select('*', { count: 'exact', head: true }).eq('user_id', user?.id).eq('completed', true);
                const { count: certs } = await supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('user_id', user?.id);

                updates.jobsApplied = jobs || 0;
                updates.coursesCompleted = courses || 0;
                updates.certRequested = certs || 0;

                // Fetch recent applications
                const { data: apps } = await supabase
                    .from('applications')
                    .select('*, jobs(title, location)')
                    .eq('graduate_id', user?.id)
                    .order('created_at', { ascending: false })
                    .limit(3);
                setRecentActivity(apps || []);
            }
            else if (role === 'company') {
                const { data: companyJobs } = await supabase.from('jobs').select('id').eq('company_id', user?.id);
                const jobIds = companyJobs?.map(j => j.id) || [];

                updates.companyJobsPosted = jobIds.length;

                if (jobIds.length > 0) {
                    const { count: applicants } = await supabase.from('applications').select('*', { count: 'exact', head: true }).in('job_id', jobIds);
                    updates.companyApplicants = applicants || 0;

                    // Fetch recent applicants
                    const { data: recentApps } = await supabase
                        .from('applications')
                        .select('*, jobs(title), graduates(user_id, specialization)')
                        .in('job_id', jobIds)
                        .order('created_at', { ascending: false })
                        .limit(3);
                    setRecentActivity(recentApps || []);
                }
            }
            else if (role === 'admin') {
                const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
                const { count: certsPending } = await supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('status', 'pending');

                updates.adminUsers = usersCount || 0;
                updates.adminCertsPending = certsPending || 0;

                // Fetch recent certificates
                const { data: certs } = await supabase
                    .from('certificates')
                    .select('*, users(name)')
                    .order('created_at', { ascending: false })
                    .limit(3);
                setRecentActivity(certs || []);
            }
            else if (role === 'doctor') {
                const { count: courses } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('instructor_id', user?.id);
                const { count: workshops } = await supabase.from('workshops').select('*', { count: 'exact', head: true }).eq('instructor_id', user?.id);

                updates.doctorCourses = courses || 0;
                updates.doctorWorkshops = workshops || 0;

                // Fetch recent course enrollments
                const { data: myCourses } = await supabase.from('courses').select('id').eq('instructor_id', user?.id);
                const myCourseIds = myCourses?.map(c => c.id) || [];
                if (myCourseIds.length > 0) {
                    const { data: enrolls } = await supabase
                        .from('course_progress')
                        .select('*, courses(title), users(name)')
                        .in('course_id', myCourseIds)
                        .order('created_at', { ascending: false })
                        .limit(3);
                    setRecentActivity(enrolls || []);
                }
            }

            setStats(updates);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <PageBanner
                image="/images/dashboard-bg.png"
                title={t('home.welcome')}
                subtitle={t('home.overview')}
                icon={<TrendingUp className="w-7 h-7 text-white" />}
            />

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {t('home.insights')}
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* GRADUATE STATS */}
                {role === 'graduate' && (
                    <>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark flex items-center gap-5 transition-all duration-300 hover:-translate-y-1.5 group">
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-indigo-900/40 dark:to-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Briefcase className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize mb-1">{t('home.appsSent')}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.jobsApplied}</p>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark flex items-center gap-5 transition-all duration-300 hover:-translate-y-1.5 group">
                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/80 dark:from-green-900/40 dark:to-green-900/10 text-green-600 dark:text-green-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize mb-1">{t('home.coursesCompleted')}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.coursesCompleted}</p>
                            </div>
                        </div>
                    </>
                )}

                {/* COMPANY STATS */}
                {role === 'company' && (
                    <>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark flex items-center gap-5 transition-all duration-300 hover:-translate-y-1.5 group">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/40 dark:to-blue-900/10 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Briefcase className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize mb-1">{t('home.activeListings')}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.companyJobsPosted}</p>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark flex items-center gap-5 transition-all duration-300 hover:-translate-y-1.5 group">
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-indigo-900/40 dark:to-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize mb-1">{t('home.totalApplicants')}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.companyApplicants}</p>
                            </div>
                        </div>
                    </>
                )}

                {/* ADMIN STATS */}
                {role === 'admin' && (
                    <>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark flex items-center gap-5 transition-all duration-300 hover:-translate-y-1.5 group">
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-900/40 dark:to-purple-900/10 text-purple-600 dark:text-purple-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize mb-1">{t('home.registeredUsers')}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.adminUsers}</p>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark flex items-center gap-5 transition-all duration-300 hover:-translate-y-1.5 group">
                            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/80 dark:from-orange-900/40 dark:to-orange-900/10 text-orange-600 dark:text-orange-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Award className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize mb-1">{t('home.pendingCerts')}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.adminCertsPending}</p>
                            </div>
                        </div>
                    </>
                )}

                {/* DOCTOR STATS */}
                {role === 'doctor' && (
                    <>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark flex items-center gap-5 transition-all duration-300 hover:-translate-y-1.5 group">
                            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-indigo-900/40 dark:to-indigo-900/10 text-amber-600 dark:text-amber-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize mb-1">{t('admin.totalCourses')}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.doctorCourses}</p>
                            </div>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark flex items-center gap-5 transition-all duration-300 hover:-translate-y-1.5 group">
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-indigo-900/40 dark:to-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize mb-1">{t('workshops.title')}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.doctorWorkshops}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-lg mt-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('home.recentActivity')}</h3>
                    </div>
                    <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        {t('admin.viewAll')}
                    </button>
                </div>

                <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${idx === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : idx === 1 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}>
                                        {role === 'graduate' ? <Briefcase className="w-5 h-5" /> : role === 'company' ? <Users className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {role === 'graduate' ? activity.jobs?.title :
                                                role === 'company' ? activity.jobs?.title :
                                                    role === 'admin' ? activity.type :
                                                        activity.courses?.title || activity.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {role === 'graduate' ? activity.jobs?.location :
                                                role === 'company' ? activity.graduates?.specialization :
                                                    role === 'doctor' ? activity.users?.name :
                                                        activity.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        {new Date(activity.created_at).toLocaleDateString()}
                                    </p>
                                    <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${activity.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            activity.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {activity.status || 'Pending'}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center">
                            <Clock className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">لا توجد نشاطات حديثة</p>
                        </div>
                    )}
                </div>
            </div>

            {!isProfileComplete && (
                <div className="mt-14 relative overflow-hidden bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-10 sm:p-14 border border-gray-200/50 dark:border-gray-700/50 text-center shadow-lg">
                    <h3 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-4">{t('home.readyNextStep')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                        {t('home.exploreSidebar')}
                    </p>
                    <Link to="/profile" className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/20 font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 active:scale-95 text-lg">
                        {t('home.updateProfile')}
                    </Link>
                </div>
            )}
        </div>
    );
}
