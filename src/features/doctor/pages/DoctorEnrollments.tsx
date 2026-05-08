import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Loader2, BookOpen } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import EnrollmentsTable, { EnrollmentRecord } from '../../admin/components/EnrollmentsTable';

export default function DoctorEnrollments() {
    const { user, role } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState<EnrollmentRecord[]>([]);

    useEffect(() => {
        if (role === 'doctor' && user) {
            fetchMyEnrollments();
        }
    }, [role, user]);

    if (role !== 'doctor' && role !== undefined) {
        return <Navigate to="/" replace />;
    }

    const fetchMyEnrollments = async () => {
        try {
            setLoading(true);

            // Fetch Course Enrollments for courses belonging to this instructor
            const { data: cData, error: cError } = await supabase
                .from('course_progress')
                .select(`
                    id,
                    created_at,
                    completed,
                    users (name, email),
                    courses!inner (title, instructor_id)
                `)
                .eq('courses.instructor_id', user.id)
                .order('created_at', { ascending: false });

            if (cError) {
                console.error('Course enrollments fetch error:', cError);
                toast.error(`${t('admin.loadError')}`);
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
                title={t('sidebar.enrollments') || 'Student Enrollments'}
                subtitle={t('admin.enrollmentsSubtitle') || 'View graduates who enrolled in your courses.'}
                icon={<ClipboardList className="w-7 h-7 text-white" />}
                gradient="from-emerald-600 to-teal-600"
            />

            <div className="flex justify-between items-center px-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                    {t('admin.enrollmentsCourses')}
                </h2>
                <div className="text-sm font-medium text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    {t('admin.totalResults')}: {courseData.length}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                </div>
            ) : (
                <EnrollmentsTable
                    data={courseData}
                    type="course"
                />
            )}
        </div>
    );
}
