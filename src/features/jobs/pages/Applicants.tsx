import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Users, Loader2, FileText, CheckCircle, XCircle, Phone, Mail, GraduationCap, Briefcase, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../../components/PageBanner';

export default function Applicants() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (user) fetchApplicants();
    }, [user]);

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            const { data: jobsData } = await supabase.from('jobs').select('id').eq('company_id', user?.id);
            const jobIds = jobsData?.map(j => j.id) || [];

            if (jobIds.length > 0) {
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
            id, status, created_at,
            jobs (title),
            graduates (specialization, graduation_year, skills, cv_url, users (name, email, phone))
          `)
                    .in('job_id', jobIds)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setApplications(data || []);
            } else {
                setApplications([]);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('applicants.updateFailed'));
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (appId: string, newStatus: string) => {
        try {
            setUpdating(appId);
            const { data, error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', appId)
                .select();
            
            if (error) throw error;

            if (!data || data.length === 0) {
                toast.error(t('applicants.updateFailed') + ' (No matching record or permission)');
                return;
            }
            
            toast.success(t('applicants.statusUpdated'));
            
            // Update local state directly for immediate feedback
            setApplications(prev => prev.map(app => 
                app.id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(t('applicants.updateFailed'));
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <PageBanner
                image="/images/hero-bg.png"
                title={t('applicants.title')}
                subtitle={t('applicants.subtitle')}
                icon={<Users className="w-7 h-7 text-white" />}
                gradient="from-orange-700/85 to-amber-700/85"
            />

            <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {applications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {t('applicants.noApplicants')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700">
                        {applications.map(app => (
                            <div key={app.id} className="p-8 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-300 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <div className="flex flex-col xl:flex-row gap-8 justify-between">
                                    {/* Graduate Info Section */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 border border-indigo-100 dark:border-indigo-800/50">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {t('applicants.job')} {app.jobs?.title}
                                                </div>
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                                    {app.graduates?.users?.name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border
                                                    ${app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'}
                                                `}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Contact Info */}
                                            <div className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                                <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{t('common.contact')}</div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <Mail className="w-4 h-4 text-indigo-500" />
                                                    {app.graduates?.users?.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <Phone className="w-4 h-4 text-indigo-500" />
                                                    {app.graduates?.users?.phone || t('common.noPhone')}
                                                </div>
                                            </div>

                                            {/* Education Info */}
                                            <div className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                                                <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{t('applicants.education')}</div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-bold">
                                                    <Award className="w-4 h-4 text-amber-500" />
                                                    {app.graduates?.specialization || t('applicants.noSpecialization')}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <GraduationCap className="w-4 h-4 text-amber-500" />
                                                    {t('profile.graduationYear')}: {app.graduates?.graduation_year || 'N/A'}
                                                </div>
                                            </div>

                                            {/* Resume Action */}
                                            <div className="flex flex-col justify-center p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30">
                                                {app.graduates?.cv_url ? (
                                                    <a
                                                        href={app.graduates.cv_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-gray-800 rounded-xl text-indigo-600 dark:text-indigo-400 font-black text-sm shadow-sm border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all"
                                                    >
                                                        <FileText className="w-5 h-5" />
                                                        {t('applicants.viewResume')}
                                                    </a>
                                                ) : (
                                                    <div className="text-center text-xs text-gray-400 font-bold uppercase italic">
                                                        {t('applicants.noResume')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Skills Section */}
                                        {app.graduates?.skills && app.graduates.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {app.graduates.skills.map((skill: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold border border-gray-100 dark:border-gray-700 shadow-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons Section */}
                                    <div className="flex xl:flex-col items-center justify-center gap-3 min-w-[200px]">
                                        {app.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(app.id, 'accepted')}
                                                    disabled={updating === app.id}
                                                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-6 rounded-xl font-black text-sm shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {updating === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> {t('applicants.accept')}</>}
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(app.id, 'rejected')}
                                                    disabled={updating === app.id}
                                                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded-xl font-black text-sm shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {updating === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><XCircle className="w-5 h-5" /> {t('applicants.reject')}</>}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest text-center italic">
                                                {t('applicants.decisionMade') || 'Decision already made'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

