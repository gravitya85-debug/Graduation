import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, User, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Workshop } from '../components/WorkshopTable';

interface RegistrationModalProps {
    workshop: Workshop;
    onClose: () => void;
}

interface Attendee {
    id: string;
    status: string;
    created_at: string;
    users: {
        name: string;
        email: string;
    };
}

export default function WorkshopRegistrations({ workshop, onClose }: RegistrationModalProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAttendees();
    }, [workshop.id]);

    const fetchAttendees = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('workshop_registrations')
                .select(`
                    id,
                    status,
                    created_at,
                    users (name, email)
                `)
                .eq('workshop_id', workshop.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAttendees(data as any || []);
        } catch (error: any) {
            console.error(error);
            toast.error(t('admin.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (regId: string, newStatus: string) => {
        try {
            setUpdatingId(regId);
            const { error } = await supabase
                .from('workshop_registrations')
                .update({ status: newStatus })
                .eq('id', regId);

            if (error) throw error;

            toast.success(t('postgraduate.statusUpdated') || 'Status updated');
            setAttendees(prev => prev.map(a => a.id === regId ? { ...a, status: newStatus } : a));
        } catch (error: any) {
            console.error(error);
            toast.error(t('postgraduate.updateFailed'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-slide-up">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('workshops.registrations')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{workshop.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(85vh-100px)]">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : attendees.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">{t('workshops.noRegistrations')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {attendees.map((attendee) => (
                                <div key={attendee.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-amber-600 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">{attendee.users?.name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                <Mail className="w-3.5 h-3.5" /> {attendee.users?.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <select
                                            value={attendee.status}
                                            onChange={(e) => updateStatus(attendee.id, e.target.value)}
                                            disabled={updatingId === attendee.id}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer ${attendee.status === 'confirmed'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : attendee.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}
                                        >
                                            <option value="pending">{t('postgraduate.pending')}</option>
                                            <option value="confirmed">{t('postgraduate.accepted')}</option>
                                            <option value="cancelled">{t('postgraduate.rejected')}</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
