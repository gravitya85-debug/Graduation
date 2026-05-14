import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Shield, Loader2, Search, Trash2 } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-900/75" onClick={onCancel}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-700/50 animate-fade-in-up">
                <p className="text-gray-900 dark:text-white font-bold text-lg mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">{t('admin.cancel')}</button>
                    <button onClick={onConfirm} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-95">{t('admin.confirmDeleteBtn')}</button>
                </div>
            </div>
        </div>
    );
}

export default function AdminUsers() {
    const { role } = useAuth();
    const { t } = useTranslation();
    const [usersList, setUsersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (role === 'admin') fetchUsers();
    }, [role]);

    if (role !== 'admin' && role !== undefined) return <Navigate to="/" replace />;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setUsersList(data || []);
        } catch { toast.error(t('admin.loadError')); } finally { setLoading(false); }
    };

    const changeRole = async (userId: string, newRole: string) => {
        try {
            setUpdating(userId);
            const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
            if (error) throw error;
            toast.success(t('admin.roleChanged'));
            fetchUsers();
        } catch { toast.error(t('admin.updateFailed')); } finally { setUpdating(null); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase.from('users').delete().eq('id', deleteId);
            if (error) throw error;
            toast.success(t('admin.deleteSuccess'));
            setDeleteId(null);
            fetchUsers();
        } catch { toast.error(t('admin.deleteFailed')); }
    };

    const getRoleBadgeColor = (r: string) => {
        switch (r) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200';
            case 'company': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
            case 'doctor': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
            default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200';
        }
    };

    const filtered = usersList.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <PageBanner image="images/dashboard-bg.png" title={t('admin.usersTitle')} subtitle={t('admin.usersSubtitle')} icon={<Users className="w-7 h-7 text-white" />} gradient="from-indigo-700/85 to-violet-700/85" />

            <div className="relative">
                <Search className="w-5 h-5 absolute rtl:right-4 ltr:left-4 top-3.5 text-gray-400" />
                <input type="text" placeholder={t('admin.searchUsers')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rtl:pr-12 ltr:pl-12 rtl:pl-4 ltr:pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
            ) : (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 overflow-x-auto animate-fade-in-up">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.userName')}</th>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.userEmail')}</th>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.userRole')}</th>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.userDate')}</th>
                                <th className="px-6 py-4 text-end text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={updating === u.id}
                                            className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer ${getRoleBadgeColor(u.role)} transition-all`}>
                                            <option value="graduate">{t('admin.roleGraduate')}</option>
                                            <option value="company">{t('admin.roleCompany')}</option>
                                            <option value="doctor">{t('admin.roleDoctor')}</option>
                                            <option value="admin">{t('admin.roleAdmin')}</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-end">
                                        <button onClick={() => setDeleteId(u.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t('admin.noResults')}</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
            {deleteId && <ConfirmModal message={t('admin.confirmDelete')} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
        </div>
    );
}


