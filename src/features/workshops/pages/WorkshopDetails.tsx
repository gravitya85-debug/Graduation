import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    Calendar,
    MapPin,
    User,
    Users,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Info,
    Clock,
    Share2,
    XCircle,
    QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { QRCodeCanvas } from 'qrcode.react';

interface Workshop {
    id: string;
    title: string;
    description: string;
    type: 'workshop' | 'seminar';
    date: string;
    location: string;
    instructor: string;
    capacity: number;
    thumbnail_url: string | null;
}

export default function WorkshopDetails() {
    const { id } = useParams<{ id: string }>();
    const { user, role, isProfileComplete } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const [loading, setLoading] = useState(true);
    const [workshop, setWorkshop] = useState<Workshop | null>(null);
    const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
    const [acceptedCount, setAcceptedCount] = useState(0);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (id) {
            fetchWorkshopDetails();
        }
    }, [id, user]);

    const fetchWorkshopDetails = async () => {
        try {
            setLoading(true);

            // 1. Fetch workshop data
            const { data, error } = await supabase
                .from('workshops')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setWorkshop(data);

            // 2. Fetch user registration status
            if (user && id) {
                const { data: regData } = await supabase
                    .from('workshop_registrations')
                    .select('status')
                    .eq('workshop_id', id)
                    .eq('user_id', user.id)
                    .single();

                if (regData) {
                    setRegistrationStatus(regData.status);
                }
            }

            // 3. Fetch count of confirmed registrations
            const { count, error: countError } = await supabase
                .from('workshop_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('workshop_id', id)
                .eq('status', 'confirmed');

            if (!countError) {
                setAcceptedCount(count || 0);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(t('workshops.failedToLoad'));
            navigate('/workshops');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) {
            toast.error(t('workshops.loginToRegister'));
            return;
        }

        if (!isProfileComplete) {
            toast.error(t(`profile.incompleteError_${role}`));
            return;
        }

        try {
            setProcessing(true);
            const { error } = await supabase
                .from('workshop_registrations')
                .insert([{
                    workshop_id: id,
                    user_id: user.id,
                    status: 'pending'
                }]);

            if (error) {
                if (error.code === '23505') {
                    toast.error(t('workshops.alreadyRegistered'));
                } else {
                    throw error;
                }
            } else {
                toast.success(t('workshops.regSuccess'));
                setRegistrationStatus('pending');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(t('workshops.regError'));
        } finally {
            setProcessing(false);
        }
    };

    const handleShare = () => {
        if (!workshop) return;

        const dateStr = format(new Date(workshop.date), 'PPP', { locale: isArabic ? ar : enUS });
        const timeStr = format(new Date(workshop.date), 'p', { locale: isArabic ? ar : enUS });

        const shareText = `
🌟 ${workshop.title}
👤 ${t('workshops.instructor')}: ${workshop.instructor}
📅 ${t('workshops.date')}: ${dateStr}
⏰ ${t('workshops.time')}: ${timeStr}
📍 ${t('workshops.location')}: ${workshop.location}

📝 ${t('postgraduate.description')}:
${workshop.description}

🔗 ${window.location.href}
        `.trim();

        navigator.clipboard.writeText(shareText).then(() => {
            toast.success(t('workshops.copiedToClipboard'));
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast.error('Failed to copy text');
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">{t('workshops.details')}...</p>
            </div>
        );
    }

    if (!workshop) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header / Nav */}
            <button
                onClick={() => navigate('/workshops')}
                className="group flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors font-bold"
            >
                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 group-hover:border-amber-100 transition-all">
                    <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                </div>
                {t('common.back')}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Hero Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-premium dark:shadow-premium-dark border border-gray-100 dark:border-gray-700">
                        <div className="relative h-[400px]">
                            {workshop.thumbnail_url ? (
                                <img
                                    src={workshop.thumbnail_url}
                                    alt={workshop.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                    <Calendar className="w-32 h-32 text-white/20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent flex flex-col justify-end p-10">
                                <span className={`w-fit px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 ${workshop.type === 'workshop' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                                    }`}>
                                    {workshop.type === 'workshop' ? t('workshops.workshop') : t('workshops.seminar')}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                    {workshop.title}
                                </h1>
                            </div>
                        </div>

                        <div className="p-10 space-y-10">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                                    <Calendar className="w-6 h-6 text-amber-500 mb-2" />
                                    <div className="text-[10px] uppercase font-bold text-gray-400">{t('workshops.date')}</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                        {format(new Date(workshop.date), 'PPP', { locale: isArabic ? ar : enUS })}
                                    </div>
                                </div>
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                                    <Clock className="w-6 h-6 text-amber-500 mb-2" />
                                    <div className="text-[10px] uppercase font-bold text-gray-400">{t('workshops.time')}</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                        {format(new Date(workshop.date), 'p', { locale: isArabic ? ar : enUS })}
                                    </div>
                                </div>
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                                    <MapPin className="w-6 h-6 text-amber-500 mb-2" />
                                    <div className="text-[10px] uppercase font-bold text-gray-400">{t('workshops.location')}</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1 line-clamp-1">
                                        {workshop.location}
                                    </div>
                                </div>
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                                    <Users className="w-6 h-6 text-amber-500 mb-2" />
                                    <div className="text-[10px] uppercase font-bold text-gray-400">{t('workshops.capacity')}</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                        {workshop.capacity} {t('workshops.seats')}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                    <Info className="w-6 h-6 text-amber-500" />
                                    {t('postgraduate.description')}
                                </h3>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap font-medium">
                                    {workshop.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sticky Sidebar */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-6">
                    {/* Action Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-premium dark:shadow-premium-dark border border-gray-100 dark:border-gray-700 space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                            <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 dark:border-amber-900/30">
                                <User className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase font-black text-amber-600/60 tracking-wider">{t('workshops.instructor')}</div>
                                <div className="text-lg font-black text-gray-900 dark:text-white">{workshop.instructor}</div>
                            </div>
                        </div>

                        {(() => {
                            const isFull = acceptedCount >= (workshop?.capacity || 0);

                            if (!registrationStatus) {
                                if (isFull) {
                                    return (
                                        <div className="w-full py-6 px-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold border border-red-100 dark:border-red-900/30 flex flex-col items-center gap-3 text-center animate-fade-in">
                                            <XCircle className="w-10 h-10" />
                                            <div>
                                                <div className="text-lg font-black">{t('workshops.fullCapacity') || 'Full Capacity'}</div>
                                                <div className="text-xs opacity-80 leading-relaxed">{t('workshops.fullCapacityDesc') || 'Sorry, this event has reached its maximum capacity.'}</div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        onClick={handleRegister}
                                        disabled={processing}
                                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-lg shadow-xl shadow-amber-200 dark:shadow-none hover:from-amber-500 hover:to-orange-500 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> {t('workshops.register')}</>}
                                    </button>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-2xl text-center flex items-center justify-center gap-2 font-bold ${registrationStatus === 'confirmed'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700'
                                        : registrationStatus === 'cancelled'
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700'
                                            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700'
                                        }`}>
                                        {registrationStatus === 'confirmed' ? (
                                            <><CheckCircle2 className="w-5 h-5" /> {t('postgraduate.accepted')}</>
                                        ) : registrationStatus === 'cancelled' ? (
                                            <><XCircle className="w-5 h-5" /> {t('postgraduate.rejected')}</>
                                        ) : (
                                            <><Clock className="w-5 h-5 animate-pulse" /> {t('postgraduate.pending')}</>
                                        )}
                                    </div>

                                    {registrationStatus === 'confirmed' && (
                                        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center gap-4">
                                            <div className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                                <QrCode className="w-4 h-4" />
                                                {t('workshops.yourTicket')}
                                            </div>
                                            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                                <QRCodeCanvas
                                                    value={JSON.stringify({
                                                        ticketId: `${workshop.id}-${user?.id}`,
                                                        workshop: workshop.title,
                                                        attendee: user?.user_metadata?.full_name || user?.email
                                                    })}
                                                    size={150}
                                                    level="H"
                                                    includeMargin={false}
                                                />
                                            </div>
                                            <div className="flex flex-col items-center text-center">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                    {workshop.id.substring(0, 8)}-{user?.id.substring(0, 8)}
                                                </p>
                                                <p className="text-[11px] text-emerald-600 font-bold mt-1">
                                                    {isArabic ? 'يرجى إبراز هذا الرمز عند مدخل القاعة' : 'Please present this code at the hall entrance'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleShare}
                                        className="w-full py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all font-bold flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-4 h-4" /> {t('workshops.shareEvent')}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white space-y-4">
                        <h4 className="text-xl font-black flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> {t('workshops.importantNote')}
                        </h4>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                            {t('workshops.regNote')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
