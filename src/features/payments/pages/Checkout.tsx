import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { CreditCard, ShieldCheck, ArrowLeft, ArrowRight, Loader2, GraduationCap, Building, BookOpen, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import visaIcon from '../../../assets/visa.svg';
import mastercardIcon from '../../../assets/mastercard.svg';


export default function Checkout() {
    const { type, id } = useParams<{ type: 'course' | 'postgraduate' | 'certificate', id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (id && type) fetchItem();
    }, [id, type]);

    const fetchItem = async () => {
        try {
            setLoading(true);
            const table = type === 'course' ? 'courses' : type === 'postgraduate' ? 'postgraduate' : 'certificates';
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setItem(data);
        } catch (error) {
            console.error(error);
            toast.error(t('payments.failedToLoadDetails') || 'Failed to load details');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !item || !type) return;

        try {
            setProcessing(true);

            // Artificial delay to simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (type === 'course') {
                const { error } = await supabase
                    .from('course_progress')
                    .insert({
                        user_id: user.id,
                        course_id: item.id,
                        completed: false
                    });
                if (error) throw error;
            } else if (type === 'postgraduate') {
                const { error } = await supabase
                    .from('postgraduate_applications')
                    .insert({
                        user_id: user.id,
                        program_id: item.id,
                        status: 'pending'
                    });
                if (error) throw error;
                toast.success(t('payments.success'));
                navigate(`/postgraduate/${item.id}`);
            } else if (type === 'certificate') {
                const targetId = isNaN(Number(id)) ? id : Number(id);
                const { error: updateError } = await supabase
                    .from('certificates')
                    .update({ 
                        payment_status: 'paid',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', targetId);

                if (updateError) {
                    console.error('Database update failed:', updateError);
                    throw updateError;
                }

                toast.success(t('payments.success'));
                navigate('/certificates');
            }
        } catch (err) {
            console.error('Payment processing finalization error:', err);
            toast.error(t('payments.error'));
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    );

    if (!item) return null;

    const price = type === 'course' ? item.price : type === 'postgraduate' ? item.fees : 150; // Fixed fee for certificates for now
    const title = type === 'certificate' ? t('certificates.title') : item.title;
    const subtext = type === 'course' ? item.instructor_name : type === 'postgraduate' ? item.university : t('certificates.paymentMethod');
    const Icon = type === 'course' ? BookOpen : type === 'postgraduate' ? GraduationCap : Award;
    const SubIcon = Building;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1115] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-all group"
                >
                    {isRtl ? <ArrowRight className="w-5 h-5 group-hover:translate-x-1" /> : <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1" />}
                    {t('common.back')}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Summary */}
                    <div className="space-y-8 animate-fade-in-up">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                                {t('payments.checkoutTitle')}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                                {t('payments.checkoutSubtitle')}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-[#1c1d1f] p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800">
                            <div className="flex gap-5 items-start mb-8">
                                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800/50">
                                    <Icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-gray-900 dark:text-white text-xl line-clamp-2 leading-tight mb-2">{title}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-bold opacity-80 uppercase tracking-tighter">
                                        <SubIcon className="w-4 h-4" />
                                        {subtext}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 font-bold">{t('payments.price')}</span>
                                    <span className="text-gray-900 dark:text-white font-black text-xl">{price?.toLocaleString()} {t('common.currency')}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-900 dark:text-white text-xl font-black">{t('payments.total')}</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-3xl">{price?.toLocaleString()} {t('common.currency')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-emerald-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-700">
                                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-black text-emerald-900 dark:text-emerald-300 uppercase text-xs tracking-widest mb-1">{t('payments.secureTitle')}</h4>
                                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium leading-snug">
                                    {t('payments.secureDesc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Confirm Payment */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <form onSubmit={handlePayment} className="bg-white dark:bg-[#1c1d1f] p-8 sm:p-10 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-gray-800 relative z-20">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <CreditCard className="w-7 h-7 text-indigo-500" />
                                {t('payments.paymentDetails')}
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">{t('payments.secureTitle')}</h3>
                                    </div>
                                    <p className="text-indigo-700 dark:text-indigo-400 text-sm font-medium leading-relaxed">
                                        {t('payments.secureDesc')}
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-gray-600 dark:text-gray-400 font-bold">{t('payments.orderSummary')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900 dark:text-white font-bold text-lg truncate max-w-[200px]">{title}</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-black text-2xl">{price?.toLocaleString()} {t('common.currency')}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full mt-4 py-5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {processing ? <Loader2 className="w-7 h-7 animate-spin" /> : <ShieldCheck className="w-7 h-7" />}
                                    {processing ? t('payments.processing') : (type === 'course' ? t('payments.payButton') : type === 'postgraduate' ? t('postgraduate.payAndApply') : t('common.payNow'))}
                                </button>

                                <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    {t('payments.secureNote')}
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
