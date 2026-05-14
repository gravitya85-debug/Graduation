import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Award, Plus, Calendar, Clock, Loader2, X, User, CreditCard, Phone, FileText, Upload, AlertCircle, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../../components/PageBanner';
import { useNavigate } from 'react-router-dom';

type Certificate = {
    id: string;
    status: 'pending' | 'ready' | 'completed' | 'rejected';
    appointment_date: string;
    full_name: string;
    national_id: string;
    phone: string;
    college_id_number: string;
    document_urls: string[];
    rejection_reason?: string;
    created_at: string;
    payment_method: 'college' | 'online';
    delivery_method: 'pickup' | 'mail';
    payment_status: 'pending' | 'paid';
};

export default function Certificates() {
    const { user, role, isProfileComplete } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        national_id: '',
        phone: '',
        college_id_number: '',
        payment_method: 'college' as 'college' | 'online',
        delivery_method: 'pickup' as 'pickup' | 'mail',
    });
    const [files, setFiles] = useState<File[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCertificates();
        }
    }, [user]);


    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCertificates(data || []);
        } catch (error) {
            console.error(error);
            toast.error(t('certificates.failedToLoad') || 'Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async (): Promise<string[]> => {
        const urls: string[] = [];
        setUploadingFiles(true);

        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('certificate-docs')
                .upload(filePath, file);

            if (uploadError) {
                toast.error(`Error uploading ${file.name}`);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('certificate-docs')
                .getPublicUrl(filePath);

            urls.push(publicUrl);
        }

        setUploadingFiles(false);
        return urls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (files.length === 0) {
            toast.error(t('certificates.pleaseUploadDocs') || 'Please upload required documents');
            return;
        }

        try {
            setSubmitting(true);

            const uploadedUrls = await uploadFiles();

            const { data, error } = await supabase.from('certificates').insert([
                {
                    user_id: user?.id,
                    full_name: formData.full_name,
                    national_id: formData.national_id,
                    phone: formData.phone,
                    college_id_number: formData.college_id_number,
                    document_urls: uploadedUrls,
                    payment_method: formData.payment_method,
                    delivery_method: formData.delivery_method,
                    status: 'pending'
                }
            ]).select();

            if (error) throw error;

            toast.success(t('certificates.requestSuccess'));

            if (formData.payment_method === 'online' && data && data[0]) {
                navigate(`/checkout/certificate/${data[0].id}`);
                return;
            }

            setShowModal(false);
            resetForm();
            fetchCertificates();
        } catch (error) {
            console.error(error);
            toast.error(t('certificates.requestError'));
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            full_name: '',
            national_id: '',
            phone: '',
            college_id_number: '',
            payment_method: 'college',
            delivery_method: 'pickup',
        });
        setFiles([]);
        setStep(1);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case 'ready': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'ready': return <CheckCircle2 className="w-4 h-4" />;
            case 'completed': return <Award className="w-4 h-4" />;
            case 'rejected': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
            <PageBanner
                image="images/certificates-banner.png"
                title={t('certificates.title')}
                subtitle={t('certificates.subtitle')}
                icon={<Award className="w-7 h-7 text-white" />}
                gradient="from-indigo-600/90 to-purple-700/90"
            />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('certificates.title')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('certificates.subtitle')}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (!isProfileComplete) {
                            toast.error(t(`profile.incompleteError_${role}`));
                            return;
                        }
                        setShowModal(true);
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> {t('certificates.requestNew')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.length === 0 ? (
                    <div className="col-span-full py-20 bg-white/30 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                            <Award className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('certificates.noRequestsYet')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{t('certificates.startRequest')}</p>
                    </div>
                ) : (
                    certificates.map((cert) => (
                        <div key={cert.id} className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${cert.status === 'completed' ? 'bg-green-500' : cert.status === 'rejected' ? 'bg-red-500' : 'bg-indigo-500'
                                }`}></div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('certificates.dateRequested')}</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{new Date(cert.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${getStatusStyles(cert.status)}`}>
                                    {getStatusIcon(cert.status)}
                                    {cert.status === 'pending' ? t('certificates.pendingReview') :
                                        cert.status === 'ready' ? t('certificates.readyForPickup') :
                                            cert.status === 'completed' ? t('certificates.completed') : t('certificates.rejected')}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                    <User className="w-4 h-4 text-indigo-500" />
                                    <div className="text-sm">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">{t('certificates.fullName')}</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{cert.full_name}</p>
                                    </div>
                                </div>

                                {cert.appointment_date && cert.status === 'ready' && (
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            <p className="text-sm font-bold">{t('certificates.appointmentDate')}</p>
                                        </div>
                                        <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                                            {new Date(cert.appointment_date).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">{t('certificates.appointmentNote')}</p>
                                    </div>
                                )}

                                {cert.status === 'rejected' && cert.rejection_reason && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/50">
                                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <p className="text-sm font-bold">{t('certificates.rejectionReason')}</p>
                                        </div>
                                        <p className="text-sm text-red-900 dark:text-red-100">{cert.rejection_reason}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Request Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={() => !submitting && setShowModal(false)}></div>

                    <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-zoom-in border border-gray-100 dark:border-gray-800">
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold">{t('certificates.requestNew')}</h3>
                                <p className="text-indigo-100 text-sm mt-1">{t('certificates.step')} {step} {t('courses.of')} 4</p>
                            </div>
                            <button onClick={() => !submitting && setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800">
                            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
                        </div>

                        <div className="p-8">
                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* Step 1: Personal Data */}
                                {step === 1 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-indigo-500" /> {t('certificates.fullName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder={t('certificates.fullNamePlaceholder')}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-indigo-500" /> {t('certificates.nationalId')}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={14}
                                                    placeholder={t('certificates.nationalIdPlaceholder')}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                    value={formData.national_id}
                                                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-indigo-500" /> {t('certificates.phone')}
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder={t('certificates.phonePlaceholder')}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-indigo-500" /> {t('certificates.collegeId')}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder={t('certificates.collegeIdPlaceholder')}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                    value={formData.college_id_number}
                                                    onChange={(e) => setFormData({ ...formData, college_id_number: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Documents */}
                                {step === 2 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl text-center bg-gray-50 dark:bg-gray-800/50 group hover:border-indigo-400 transition-colors">
                                            <input
                                                type="file"
                                                multiple
                                                id="file-upload"
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept="image/*,.pdf"
                                            />
                                            <label htmlFor="file-upload" className="cursor-pointer block space-y-4">
                                                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                    <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{t('certificates.uploadDocs')}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('certificates.uploadNote')}</p>
                                                </div>
                                            </label>
                                        </div>

                                        {files.length > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('certificates.selectedFiles')} ({files.length}):</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {files.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                                            </div>
                                                            <button onClick={() => removeFile(idx)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-800/50 flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
                                                {t('certificates.requiredDocsNote')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Payment & Delivery */}
                                {step === 3 && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="text-center space-y-2">
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{t('certificates.selectPayment')}</h4>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, payment_method: 'college', delivery_method: 'pickup' })}
                                                className={`p-6 rounded-3xl border-2 transition-all text-right flex items-center gap-6 group ${formData.payment_method === 'college'
                                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                                    }`}
                                            >
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${formData.payment_method === 'college' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                    }`}>
                                                    <CreditCard className="w-7 h-7" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{t('certificates.payAtCollege')}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('certificates.collegePaymentDesc')}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.payment_method === 'college' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                                                    }`}>
                                                    {formData.payment_method === 'college' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, payment_method: 'online', delivery_method: 'mail' })}
                                                className={`p-6 rounded-3xl border-2 transition-all text-right flex items-center gap-6 group ${formData.payment_method === 'online'
                                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                                    }`}
                                            >
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${formData.payment_method === 'online' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                    }`}>
                                                    <Phone className="w-7 h-7" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{t('certificates.payOnline')}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('certificates.onlinePaymentDesc')}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.payment_method === 'online' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                                                    }`}>
                                                    {formData.payment_method === 'online' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                </div>
                                            </button>
                                        </div>

                                    </div>
                                )}

                                {/* Step 4: Confirmation */}
                                {step === 4 && (
                                    <div className="space-y-8 animate-fade-in text-center py-4">
                                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{t('certificates.confirmSubmit')}</h4>
                                            <p className="text-gray-500 dark:text-gray-400">{t('certificates.confirmSubmitDesc')}</p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl text-right grid grid-cols-2 gap-y-4 gap-x-8">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">{t('certificates.fullName')}</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{formData.full_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">{t('certificates.nationalId')}</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{formData.national_id}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">{t('certificates.phone')}</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{formData.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">{t('certificates.selectedFiles')}</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{files.length} {t('admin.totalResults')}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">{t('certificates.paymentMethod')}</p>
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {formData.payment_method === 'college' ? t('certificates.payAtCollege') : t('certificates.payOnline')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Footer Buttons */}
                                <div className="mt-10 flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setStep(step - 1)}
                                            className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ChevronLeft className="w-5 h-5 ltr:rotate-0 rtl:rotate-180" /> {t('certificates.prev')}
                                        </button>
                                    )}

                                    {step < 4 ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (step === 1 && (!formData.full_name || !formData.national_id || !formData.phone)) {
                                                    toast.error(t('admin.saveFailed'));
                                                    return;
                                                }
                                                if (step === 2 && files.length === 0) {
                                                    toast.error(t('certificates.pleaseUploadDocs'));
                                                    return;
                                                }
                                                setStep(step + 1);
                                            }}
                                            className="flex-[2] px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            {t('certificates.next')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ltr:rotate-0 rtl:rotate-180" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={submitting}
                                            onClick={handleSubmit}
                                            className="flex-[2] px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                                        >
                                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            {submitting ? t('auth.creatingAccount') : t('certificates.finalSubmit')}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


