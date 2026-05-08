import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Award, Loader2, Clock, Eye, Check, X, User, Phone, CreditCard, FileText, ExternalLink, Calendar, AlertCircle, Mail, Send } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';

export default function AdminCertificates() {
    const { role } = useAuth();
    const { t } = useTranslation();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    
    // UI State
    const [selectedCert, setSelectedCert] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState<'accept' | 'reject' | null>(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [sendingEmail, setSendingEmail] = useState<string | null>(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailContent, setEmailContent] = useState('');

    useEffect(() => {
        if (role === 'admin') {
            fetchCerts();
        }
    }, [role]);


    if (role !== 'admin' && role !== undefined) return <Navigate to="/" replace />;

    const fetchCerts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('certificates')
                .select(`*, users (name, email)`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setCertificates(data || []);
        } catch { 
            toast.error(t('admin.loadError') || 'Error loading certificates'); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleAccept = async () => {
        if (!appointmentDate) {
            toast.error(t('certificates.selectDateError'));
            return;
        }

        try {
            setUpdating(selectedCert.id);
            const { error } = await supabase
                .from('certificates')
                .update({ 
                    status: 'ready',
                    appointment_date: new Date(appointmentDate).toISOString(),
                    rejection_reason: null
                })
                .eq('id', selectedCert.id);

            if (error) throw error;
            
            toast.success(t('admin.editSuccess'));
            setShowActionModal(null);
            setShowDetailsModal(false);
            fetchCerts();
        } catch { 
            toast.error(t('admin.actionFailed')); 
        } finally { 
            setUpdating(null); 
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) {
            toast.error(t('admin.rejectDesc'));
            return;
        }

        try {
            setUpdating(selectedCert.id);
            const { error } = await supabase
                .from('certificates')
                .update({ 
                    status: 'rejected',
                    rejection_reason: rejectionReason,
                    appointment_date: null
                })
                .eq('id', selectedCert.id);

            if (error) throw error;
            
            toast.success(t('admin.editSuccess'));
            setShowActionModal(null);
            setShowDetailsModal(false);
            fetchCerts();
        } catch { 
            toast.error(t('admin.actionFailed')); 
        } finally { 
            setUpdating(null); 
        }
    };

    const updateToCompleted = async (id: string) => {
        try {
            setUpdating(id);
            const { error } = await supabase
                .from('certificates')
                .update({ status: 'completed' })
                .eq('id', id);
            if (error) throw error;
            toast.success(t('admin.certUpdated'));
            fetchCerts();
        } catch { 
            toast.error(t('admin.updateFailed')); 
        } finally { 
            setUpdating(null); 
        }
    };

    const handleSendEmail = async () => {
        try {
            setSendingEmail(selectedCert.id);
            const { error } = await supabase
                .from('certificates')
                .update({ 
                    status: 'completed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedCert.id);

            if (error) throw error;

            toast.success(t('admin.emailSentSuccess') || 'Certificate sent to email successfully');
            setShowEmailModal(false);
            setShowDetailsModal(false);
            fetchCerts();
        } catch {
            toast.error(t('admin.actionFailed'));
        } finally {
            setSendingEmail(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">{t('certificates.pendingReview')}</span>;
            case 'ready': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200">{t('certificates.readyForPickup')}</span>;
            case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">{t('certificates.completed')}</span>;
            case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">{t('certificates.rejected')}</span>;
            default: return <span>{status}</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
            <PageBanner 
                image="/images/certificates-banner.png" 
                title={t('admin.certsTitle')} 
                subtitle={t('admin.certsSubtitle')} 
                icon={<Award className="w-7 h-7 text-white" />} 
                gradient="from-amber-600/90 to-yellow-700/90" 
            />


            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>
            ) : (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700/50 animate-fade-in-up">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">{t('admin.graduate')}</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">{t('certificates.dateRequested')}</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">{t('certificates.paymentMethod')}</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">{t('admin.status')}</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {certificates.map(cert => (
                                    <tr key={cert.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                    {(cert.full_name || cert.users?.name || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{cert.full_name || cert.users?.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{cert.national_id || t('certificates.nationalId')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    {new Date(cert.created_at).toLocaleDateString('ar-EG')}
                                                </div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                                    <Clock className="w-3 h-3" /> {new Date(cert.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    {cert.payment_method === 'online' ? t('certificates.payOnline') : t('certificates.payAtCollege')}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-medium">
                                                    {cert.delivery_method === 'mail' ? t('certificates.deliveryMail') : t('certificates.deliveryPickup')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {getStatusBadge(cert.status)}
                                        </td>
                                        <td className="px-8 py-5 text-left">
                                            <div className="flex justify-start gap-2">
                                                <button 
                                                    onClick={() => { setSelectedCert(cert); setShowDetailsModal(true); }}
                                                    className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-all group"
                                                    title={t('admin.certDetails')}
                                                >
                                                    <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </button>
                                                {cert.status === 'ready' && cert.delivery_method !== 'mail' && (
                                                    <button 
                                                        onClick={() => updateToCompleted(cert.id)}
                                                        disabled={updating === cert.id}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-xs font-bold shadow-lg shadow-green-500/20 transition-all flex items-center gap-1"
                                                    >
                                                        {updating === cert.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                        {t('admin.markPickedUp')}
                                                    </button>
                                                )}

                                                {cert.status === 'ready' && cert.delivery_method === 'mail' && (
                                                    <button 
                                                        onClick={() => { setSelectedCert(cert); setShowEmailModal(true); }}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1"
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        {t('admin.sendToEmail') || 'Send to Email'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {certificates.length === 0 && (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="p-20 text-center">
                                                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                                    <Award className="w-12 h-12" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('admin.noResults')}</h3>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('admin.noRequestsDesc') || t('admin.noResults')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedCert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetailsModal(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-zoom-in border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                            {/* Left Side: Documents Preview (Placeholder or list) */}
                            <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 p-8 overflow-y-auto border-l border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                                        <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{t('admin.attachedDocs')}</h4>
                                </div>
                                
                                {selectedCert.document_urls && selectedCert.document_urls.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedCert.document_urls.map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group relative block rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-500 transition-all">
                                                <div className="aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                    {url.toLowerCase().endsWith('.pdf') ? (
                                                        <FileText className="w-12 h-12 text-red-500" />
                                                    ) : (
                                                        <img src={url} alt={`doc-${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    )}
                                                </div>
                                                <div className="p-3 flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-500">{t('common.document')} #{i+1}</span>
                                                    <ExternalLink className="w-4 h-4 text-indigo-500" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">{t('admin.noDocs')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Data & Actions */}
                            <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white dark:bg-gray-900">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.certDetails')}</h3>
                                        <p className="text-gray-500 text-sm">{t('certificates.confirmSubmitDesc')}</p>
                                    </div>
                                    <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">{t('certificates.fullName')}</label>
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                                <User className="w-4 h-4 text-indigo-500" /> {selectedCert.full_name || selectedCert.users?.name}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">{t('certificates.nationalId')}</label>
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                                <CreditCard className="w-4 h-4 text-indigo-500" /> {selectedCert.national_id}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">{t('certificates.phone')}</label>
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                                <Phone className="w-4 h-4 text-indigo-500" /> {selectedCert.phone}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">{t('certificates.collegeId')}</label>
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                                <FileText className="w-4 h-4 text-indigo-500" /> {selectedCert.college_id_number}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                            <label className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest block mb-1">{t('certificates.paymentMethod')}</label>
                                            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100 font-bold">
                                                <CreditCard className="w-4 h-4" /> 
                                                {selectedCert.payment_method === 'online' ? t('certificates.payOnline') : t('certificates.payAtCollege')}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedCert.status === 'pending' && (
                                        <div className="grid grid-cols-2 gap-4 pt-6">
                                            <button 
                                                onClick={() => setShowActionModal('reject')}
                                                className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 font-bold transition-all flex items-center justify-center gap-2 border border-red-100"
                                            >
                                                <X className="w-5 h-5" /> {t('admin.rejectRequest')}
                                            </button>
                                            <button 
                                                onClick={() => setShowActionModal('accept')}
                                                className="px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                            >
                                                <Check className="w-5 h-5" /> {t('admin.acceptRequest')}
                                            </button>
                                        </div>
                                    )}

                                    {selectedCert.status === 'ready' && (
                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl">
                                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2 font-bold text-sm">
                                                <Calendar className="w-4 h-4" /> {t('certificates.appointmentDate')}
                                            </div>
                                            <p className="text-xl font-black text-indigo-900 dark:text-indigo-100">
                                                {new Date(selectedCert.appointment_date).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    )}

                                    {selectedCert.status === 'rejected' && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl">
                                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2 font-bold text-sm">
                                                <AlertCircle className="w-4 h-4" /> {t('certificates.rejectionReason')}
                                            </div>
                                            <p className="text-red-900 dark:text-red-100 font-bold">{selectedCert.rejection_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal (Accept/Reject Dialog) */}
            {showActionModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={() => setShowActionModal(null)}></div>
                    <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-8 animate-zoom-in">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${showActionModal === 'accept' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {showActionModal === 'accept' ? <Calendar className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {showActionModal === 'accept' ? t('admin.confirmAccept') : t('admin.confirmReject')}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {showActionModal === 'accept' ? t('admin.acceptDesc') : t('admin.rejectDesc')}
                        </p>

                         {showActionModal === 'accept' ? (
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">{t('certificates.appointmentDate')}</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">{t('admin.rejectionReasonLabel')}</label>
                                <textarea 
                                    rows={4}
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-red-500 outline-none resize-none font-bold"
                                    placeholder={t('admin.rejectionPlaceholder')}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button 
                                onClick={() => setShowActionModal(null)}
                                className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-200"
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                onClick={showActionModal === 'accept' ? handleAccept : handleReject}
                                disabled={updating === selectedCert?.id}
                                className={`px-6 py-4 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${
                                    showActionModal === 'accept' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                }`}
                            >
                                {updating === selectedCert?.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('admin.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Email Modal */}
            {showEmailModal && selectedCert && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={() => !sendingEmail && setShowEmailModal(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-zoom-in">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                            <Mail className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('admin.sendToEmail')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('admin.emailSentNotice')} <span className="font-bold text-indigo-600 underline">{(selectedCert as any).users?.email}</span></p>
                        
                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest">{t('admin.confirmEmailMessage')}</label>
                                <textarea 
                                    className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white resize-none font-medium"
                                    rows={3}
                                    placeholder={t('admin.emailPlaceholder')}
                                    value={emailContent}
                                    onChange={(e) => setEmailContent(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">{t('admin.emailNote')}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowEmailModal(false)}
                                disabled={!!sendingEmail}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sendingEmail !== null}
                                className="flex-[1.5] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {sendingEmail !== null ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                {t('admin.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
