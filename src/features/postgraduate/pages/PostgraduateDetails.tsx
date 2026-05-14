import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import {
    GraduationCap, Building, Calendar, Clock,
    Mail, Phone, CheckCircle2, Lock, Loader2,
    ArrowLeft, ArrowRight, Share2, Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

export default function PostgraduateDetails() {
    const { id } = useParams();
    const { user, role, isProfileComplete } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRtl = i18n.language === 'ar';

    const [program, setProgram] = useState<any>(null);
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (id) fetchProgramData();
    }, [id, user]);

    const fetchProgramData = async () => {
        try {
            setLoading(true);
            // Fetch Program details
            const { data: progData, error: progError } = await supabase
                .from('postgraduate')
                .select('*')
                .eq('id', id)
                .single();

            if (progError) throw progError;
            setProgram(progData);

            // Fetch user application if exists
            if (user) {
                const { data: appData, error: appError } = await supabase
                    .from('postgraduate_applications')
                    .select('*')
                    .eq('program_id', id)
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!appError) setApplication(appData);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('postgraduate.failedToLoad'));
            navigate('/postgraduate');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!user) {
            toast.error('Please login to apply');
            return;
        }

        if (!isProfileComplete) {
            toast.error(t(`profile.incompleteError_${role}`));
            return;
        }

        // If it's a paid program and not already applied
        if (program.is_paid && !application) {
            navigate(`/checkout/postgraduate/${id}`);
            return;
        }

        try {
            setActionLoading(true);
            const { error } = await supabase
                .from('postgraduate_applications')
                .insert({
                    user_id: user.id,
                    program_id: id,
                    status: 'pending'
                });

            if (error) throw error;

            toast.success(t('postgraduate.applySuccess') || 'Application submitted successfully');
            fetchProgramData();
        } catch (error) {
            console.error(error);
            toast.error(t('postgraduate.applyError') || 'Failed to submit application');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    );

    if (!program) return null;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Nav Header */}
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => navigate('/postgraduate')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold group"
                >
                    {isRtl ? <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />}
                    {t('common.back')}
                </button>
                <div className="flex gap-3">
                    <button className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Section */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
                        <img
                            src={program.image_url || "images/postgraduate-hero.jpg"}
                            alt={program.title}
                            className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${program.type === 'masters' ? 'bg-blue-500/20 text-blue-100 border-blue-400/30' :
                                    program.type === 'phd' ? 'bg-purple-500/20 text-purple-100 border-purple-400/30' :
                                        'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
                                    }`}>
                                    {t(`postgraduate.${program.type}`)}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">{program.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-gray-200">
                                <div className="flex items-center gap-2">
                                    <Building className="w-5 h-5 text-indigo-400" />
                                    <span className="font-bold">{program.university}</span>
                                </div>
                                {program.duration && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-5 h-5 text-indigo-400" />
                                        <span>{program.duration}</span>
                                    </div>
                                )}
                                {program.deadline && (
                                    <div className="flex items-center gap-2 text-sm text-orange-200">
                                        <Calendar className="w-5 h-4" />
                                        <span>{t('postgraduate.deadline')} {new Date(program.deadline).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs / Content Sections */}
                    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <Info className="w-6 h-6 text-indigo-500" />
                                {t('postgraduate.description')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                                {program.description || "No detailed description provided for this program."}
                            </p>
                        </div>

                        <div className="pt-8 border-t border-gray-100 dark:border-gray-700/50">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                {t('postgraduate.requirements')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {program.requirements?.map((req: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-700/30">
                                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Action Card */}
                    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50 shadow-premium sticky top-8">
                        <div className="mb-6">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">{t('postgraduate.fees')}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900 dark:text-white leading-none">
                                    {program.is_paid ? `${program.fees.toLocaleString()} ${t('common.currency')}` : t('postgraduate.free')}
                                </span>
                            </div>
                        </div>

                        {application ? (
                            <div className={`p-6 rounded-2xl border ${getStatusStyle(application.status)} flex flex-col items-center text-center gap-3 bg-opacity-40 animate-scale-in`}>
                                <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-full shadow-sm">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-black text-lg">{t('postgraduate.applied')}</p>
                                    <p className="text-sm font-bold mt-1 opacity-80">{t('postgraduate.applicationStatus')}: {t(`postgraduate.${application.status}`)}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <button
                                    onClick={handleApply}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 group/apply"
                                >
                                    {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <GraduationCap className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                                    {program.is_paid ? t('postgraduate.applyNow') : t('postgraduate.applyFree')}
                                </button>
                                <p className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium px-4">
                                    {program.is_paid ? t('postgraduate.payPrompt') : t('postgraduate.applyPrompt')}
                                </p>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700/50 space-y-6">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest">{t('postgraduate.contact')}</h3>
                            <div className="space-y-4">
                                {program.contact_email && (
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-gray-400 group-hover:text-indigo-500 transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{t('postgraduate.contactEmail')}</span>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 break-all">{program.contact_email}</span>
                                        </div>
                                    </div>
                                )}
                                {program.contact_phone && (
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-gray-400 group-hover:text-green-500 transition-colors">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{t('postgraduate.contactPhone')}</span>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{program.contact_phone}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


