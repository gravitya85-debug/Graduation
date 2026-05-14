import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Briefcase, Award, Clock, BookOpen, GraduationCap, BarChart3, Loader2 } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';

export default function AdminOverview() {
    const { role } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ users: 0, jobs: 0, certs: 0, certsPending: 0, courses: 0, programs: 0 });

    useEffect(() => {
        if (role === 'admin') fetchStats();
    }, [role]);

    if (role !== 'admin' && role !== undefined) return <Navigate to="/" replace />;

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [usersRes, jobsRes, certsRes, certsP, coursesRes, progsRes] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('jobs').select('*', { count: 'exact', head: true }),
                supabase.from('certificates').select('*', { count: 'exact', head: true }),
                supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('postgraduate').select('*', { count: 'exact', head: true }),
            ]);
            setStats({
                users: usersRes.count || 0, jobs: jobsRes.count || 0, certs: certsRes.count || 0,
                certsPending: certsP.count || 0, courses: coursesRes.count || 0, programs: progsRes.count || 0,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: t('admin.totalUsers'), value: stats.users, icon: <Users className="w-7 h-7" />, color: 'from-indigo-50 to-indigo-100/80 dark:from-indigo-900/40 dark:to-indigo-900/10 text-indigo-600 dark:text-indigo-400' },
        { label: t('admin.totalJobs'), value: stats.jobs, icon: <Briefcase className="w-7 h-7" />, color: 'from-blue-50 to-blue-100/80 dark:from-blue-900/40 dark:to-blue-900/10 text-blue-600 dark:text-blue-400' },
        { label: t('admin.totalCerts'), value: stats.certs, icon: <Award className="w-7 h-7" />, color: 'from-yellow-50 to-yellow-100/80 dark:from-yellow-900/40 dark:to-yellow-900/10 text-yellow-600 dark:text-yellow-400' },
        { label: t('admin.pendingCerts'), value: stats.certsPending, icon: <Clock className="w-7 h-7" />, color: 'from-orange-50 to-orange-100/80 dark:from-orange-900/40 dark:to-orange-900/10 text-orange-600 dark:text-orange-400' },
        { label: t('admin.totalCourses'), value: stats.courses, icon: <BookOpen className="w-7 h-7" />, color: 'from-green-50 to-green-100/80 dark:from-green-900/40 dark:to-green-900/10 text-green-600 dark:text-green-400' },
        { label: t('admin.totalPrograms'), value: stats.programs, icon: <GraduationCap className="w-7 h-7" />, color: 'from-purple-50 to-purple-100/80 dark:from-purple-900/40 dark:to-purple-900/10 text-purple-600 dark:text-purple-400' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <PageBanner image="images/dashboard-bg.png" title={t('admin.overviewTitle')} subtitle={t('admin.overviewSubtitle')} icon={<BarChart3 className="w-7 h-7 text-white" />} gradient="from-red-700/85 to-rose-700/85" />

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {statCards.map((stat, i) => (
                        <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 group">
                            <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>{stat.icon}</div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


