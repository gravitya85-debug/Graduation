import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, User, Users, Loader2, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import PageBanner from '../../../components/PageBanner';

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

interface Registration {
    workshop_id: string;
    status: string;
}

export default function Workshops() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const [loading, setLoading] = useState(true);
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [registrations, setRegistrations] = useState<Record<string, string>>({});
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch workshops
            const { data: wData, error: wError } = await supabase
                .from('workshops')
                .select('*')
                .order('date', { ascending: true });

            if (wError) throw wError;
            setWorkshops(wData || []);

            // Fetch user registrations
            if (user) {
                const { data: rData, error: rError } = await supabase
                    .from('workshop_registrations')
                    .select('workshop_id, status')
                    .eq('user_id', user.id);

                if (rError) console.error('Error fetching registrations:', rError);

                const regMap: Record<string, string> = {};
                rData?.forEach(reg => {
                    regMap[reg.workshop_id] = reg.status;
                });
                setRegistrations(regMap);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(t('courses.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (workshopId: string) => {
        if (!user) {
            toast.error('Please login to register');
            return;
        }

        try {
            setProcessingId(workshopId);
            const { error } = await supabase
                .from('workshop_registrations')
                .insert([{
                    workshop_id: workshopId,
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
                setRegistrations(prev => ({ ...prev, [workshopId]: 'pending' }));
            }
        } catch (error: any) {
            console.error(error);
            toast.error(t('workshops.regError'));
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <PageBanner
                image="/images/courses-banner.png"
                title={t('workshops.title')}
                subtitle={t('workshops.subtitle')}
                icon={<Calendar className="w-7 h-7 text-white" />}
                gradient="from-amber-500/85 to-orange-600/85"
            />

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                </div>
            ) : workshops.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-20 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('workshops.noWorkshops')}</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {workshops.map((workshop) => (
                        <div key={workshop.id} className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-premium dark:shadow-premium-dark border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-all duration-300">
                            {/* Thumbnail */}
                            <div className="relative h-48 overflow-hidden">
                                <Link to={`/workshops/${workshop.id}`}>
                                    {workshop.thumbnail_url ? (
                                        <img
                                            src={workshop.thumbnail_url}
                                            alt={workshop.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 flex items-center justify-center">
                                            <Calendar className="w-12 h-12 text-amber-200 dark:text-amber-900/30" />
                                        </div>
                                    )}
                                </Link>
                                <div className="absolute top-4 right-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${workshop.type === 'workshop'
                                        ? 'bg-amber-500/90 text-white'
                                        : 'bg-blue-500/90 text-white'
                                        }`}>
                                        {workshop.type === 'workshop' ? t('workshops.workshop') : t('workshops.seminar')}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <Link to={`/workshops/${workshop.id}`}>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors">
                                        {workshop.title}
                                    </h3>
                                </Link>

                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                                    {workshop.description}
                                </p>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 text-amber-500" />
                                        {format(new Date(workshop.date), 'PPP p', { locale: isArabic ? ar : enUS })}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4 text-amber-500" />
                                        {workshop.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        <User className="w-4 h-4 text-amber-500" />
                                        {workshop.instructor}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                        <Users className="w-4 h-4" />
                                        {t('workshops.capacity')}: {workshop.capacity}
                                    </div>

                                    {registrations[workshop.id] ? (
                                        <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold ${registrations[workshop.id] === 'confirmed'
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                            : registrations[workshop.id] === 'cancelled'
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600'
                                                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                            }`}>
                                            {registrations[workshop.id] === 'confirmed' ? (
                                                <><CheckCircle2 className="w-4 h-4" /> {t('postgraduate.accepted')}</>
                                            ) : registrations[workshop.id] === 'cancelled' ? (
                                                <><AlertCircle className="w-4 h-4" /> {t('postgraduate.rejected')}</>
                                            ) : (
                                                <><Clock className="w-4 h-4" /> {t('postgraduate.pending')}</>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleRegister(workshop.id)}
                                            disabled={processingId === workshop.id}
                                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                                        >
                                            {processingId === workshop.id ? <Loader2 className="w-4 h-4 animate-spin" /> : t('workshops.register')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Clock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
