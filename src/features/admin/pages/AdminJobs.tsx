import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Briefcase, Loader2, Plus } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import ConfirmModal from '../../../components/ConfirmModal';
import JobsTable from '../components/JobsTable';
import JobFormModal from '../components/JobFormModal';
import { useAdminJobs } from '../../../hooks/useAdminJobs';
import type { Job, JobInput } from '../../../types';

export default function AdminJobs() {
    const { role } = useAuth();
    const { t } = useTranslation();
    const { jobs, loading, submitting, error, fetchJobs, addJob, editJob, removeJob } = useAdminJobs();

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Job | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (role === 'admin') {
            fetchJobs();
        }
    }, [role, fetchJobs]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    if (role !== 'admin' && role !== undefined) return <Navigate to="/" replace />;

    const handleSubmit = async (payload: JobInput) => {
        let result;
        if (editingItem) {
            result = await editJob(editingItem.id, payload);
            if (result.success) toast.success(t('admin.editSuccess'));
        } else {
            result = await addJob(payload);
            if (result.success) toast.success(t('admin.addSuccess'));
        }
        if (result.success) {
            closeModal();
        } else {
            toast.error(t('admin.saveFailed'));
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const result = await removeJob(deleteId);
        if (result.success) {
            toast.success(t('admin.deleteSuccess'));
            setDeleteId(null);
        } else {
            toast.error(result.error || t('admin.deleteFailed'));
        }
    };

    const openEdit = (item: Job) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <PageBanner image="/images/jobs-bg.png" title={t('admin.jobsTitle')} subtitle={t('admin.jobsSubtitle')} icon={<Briefcase className="w-7 h-7 text-white" />} gradient="from-blue-700/85 to-cyan-700/85" />

            <div className="flex justify-end">
                <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 active:scale-95 transition-all duration-300">
                    <Plus className="w-5 h-5" /> {t('admin.addNew')}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
            ) : (
                <JobsTable jobs={jobs} onEdit={openEdit} onDelete={(id) => setDeleteId(id)} />
            )}

            {showModal && (
                <JobFormModal
                    job={editingItem}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onClose={closeModal}
                />
            )}

            {deleteId && <ConfirmModal message={t('admin.confirmDelete')} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
        </div>
    );
}
