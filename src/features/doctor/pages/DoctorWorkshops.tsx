import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Loader2, Plus, AlertTriangle, Users } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import WorkshopTable, { Workshop } from '../../admin/components/WorkshopTable';
import WorkshopForm from '../../admin/components/WorkshopForm';
import WorkshopRegistrations from '../../admin/components/WorkshopRegistrations';

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-800 animate-fade-in-up text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('admin.confirmDeleteTitle')}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        {t('admin.cancel')}
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md active:scale-95">
                        {t('admin.confirmDeleteBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DoctorWorkshops() {
    const { user, role } = useAuth();
    const { t } = useTranslation();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Workshop | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [viewRegistrations, setViewRegistrations] = useState<Workshop | null>(null);

    useEffect(() => {
        if (role === 'doctor' && user) fetchMyWorkshops();
    }, [role, user]);

    if (role !== 'doctor' && role !== undefined) {
        return <Navigate to="/" replace />;
    }

    const fetchMyWorkshops = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('workshops')
                .select('*')
                .eq('instructor_id', user.id)
                .order('date', { ascending: true });

            if (error) throw error;
            setWorkshops(data || []);
        } catch (error: any) {
            console.error(error);
            toast.error(t('admin.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase.from('workshops').delete().eq('id', deleteId);
            if (error) throw error;

            toast.success(t('admin.deleteSuccess'));
            setDeleteId(null);
            fetchMyWorkshops();
        } catch {
            toast.error(t('admin.deleteFailed'));
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingItem(null);
        fetchMyWorkshops();
    };

    const openAdd = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const openEdit = (workshop: Workshop) => {
        setEditingItem(workshop);
        setShowForm(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <PageBanner
                image="/images/courses-banner.png"
                title={t('workshops.adminTitle') || 'Manage My Workshops'}
                subtitle={t('workshops.adminSubtitle') || 'Organize and manage attendees for your events.'}
                icon={<Calendar className="w-7 h-7 text-white" />}
                gradient="from-indigo-600 to-blue-600"
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('workshops.title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.totalResults')}: {workshops.length}</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 active:scale-95 transition-all duration-300"
                >
                    <Plus className="w-5 h-5" /> {t('workshops.addWorkshop')}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <WorkshopTable
                    workshops={workshops}
                    onEdit={openEdit}
                    onDelete={(id) => setDeleteId(id)}
                    onViewRegistrations={(w) => setViewRegistrations(w)}
                />
            )}

            {showForm && (
                <WorkshopForm
                    initialData={editingItem}
                    onClose={() => { setShowForm(false); setEditingItem(null); }}
                    onSuccess={handleFormSuccess}
                />
            )}

            {viewRegistrations && (
                <WorkshopRegistrations
                    workshop={viewRegistrations}
                    onClose={() => setViewRegistrations(null)}
                />
            )}

            {deleteId && (
                <ConfirmModal
                    message={t('admin.confirmDelete')}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}

