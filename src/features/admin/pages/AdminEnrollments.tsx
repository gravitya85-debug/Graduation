import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Loader2, BookOpen, GraduationCap } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import EnrollmentsTable, { EnrollmentRecord } from '../components/EnrollmentsTable';

type TabType = 'courses' | 'postgrad';

export default function AdminEnrollments() {
    const { role } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('courses');
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState<EnrollmentRecord[]>([]);
    const [postgradData, setPostgradData] = useState<EnrollmentRecord[]>([]);

    useEffect(() => {
        if (role === 'admin') {
            fetchAllData();
        }
    }, [role]);

    if (role !== 'admin' && role !== undefined) {
        return <Navigate to="/" replace />;
    }

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Course Enrollments
            const { data: cData, error: cError } = await supabase
                .from('course_progress')
                .select(`
                    id,
                    created_at,
                    completed,
                    users (name, email),
                    courses (title)
                `)
                .order('created_at', { ascending: false });

            if (cError) {
                console.error('Course enrollments fetch error:', cError);
                toast.error(`${t('admin.loadError')} (Courses): ${cError.message}`);
            } else {
                const formattedCourses: EnrollmentRecord[] = (cData || []).map((row: any) => ({
                    id: row.id,
                    created_at: row.created_at,
                    user: Array.isArray(row.users) ? row.users[0] : row.users,
                    item_title: (Array.isArray(row.courses) ? row.courses[0]?.title : row.courses?.title) || 'Unknown Course',
                    completed: row.completed
                })).filter(r => r.user);
                setCourseData(formattedCourses);
            }

            // 2. Fetch Postgrad Applications
            const { data: pData, error: pError } = await supabase
                .from('postgraduate_applications')
                .select(`
                    id,
                    created_at,
                    status,
                    users (name, email),
                    postgraduate (title)
                `)
                .order('created_at', { ascending: false });

            if (pError) {
                console.error('Postgrad applications fetch error:', pError);
                toast.error(`${t('admin.loadError')} (Postgrad): ${pError.message}`);
            } else {
                const formattedPostgrad: EnrollmentRecord[] = (pData || []).map((row: any) => ({
                    id: row.id,
                    created_at: row.created_at,
                    user: Array.isArray(row.users) ? row.users[0] : row.users,
                    item_title: (Array.isArray(row.postgraduate) ? row.postgraduate[0]?.title : row.postgraduate?.title) || 'Unknown Program',
                    status: row.status
                })).filter(r => r.user);
                setPostgradData(formattedPostgrad);
            }

        } catch (error: any) {
            console.error('General fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <PageBanner
                image="/images/certificates-banner.png"
                title={t('admin.enrollmentsTitle')}
                subtitle={t('admin.enrollmentsSubtitle')}
                icon={<ClipboardList className="w-7 h-7 text-white" />}
                gradient="from-indigo-700/85 to-indigo-800/85"
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'courses'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        {t('admin.enrollmentsCourses')}
                    </button>
                    <button
                        onClick={() => setActiveTab('postgrad')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'postgrad'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        {t('admin.enrollmentsPostgrad')}
                    </button>
                </div>

                <div className="text-sm font-medium text-gray-400 px-2">
                    {t('admin.totalResults')}: {activeTab === 'courses' ? courseData.length : postgradData.length}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full"></div>
                    </div>
                </div>
            ) : (
                <EnrollmentsTable
                    data={activeTab === 'courses' ? courseData : postgradData}
                    type={activeTab === 'courses' ? 'course' : 'postgrad'}
                />
            )}
        </div>
    );
}
