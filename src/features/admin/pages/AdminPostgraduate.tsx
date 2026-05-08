import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Loader2, Plus, X, Trash2, Edit3, Building, Upload } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import TagInput from '../../../components/TagInput';

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

export default function AdminPostgraduate() {
    const { role } = useAuth();
    const { t } = useTranslation();
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        university: 'جامعة كفر الشيخ',
        type: 'masters',
        requirements: '',
        deadline: '',
        description: '',
        duration: '',
        fees: 0,
        is_paid: false,
        contact_email: '',
        contact_phone: '',
        image_url: ''
    });

    useEffect(() => { if (role === 'admin') fetchPrograms(); }, [role]);

    if (role !== 'admin' && role !== undefined) return <Navigate to="/" replace />;

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('postgraduate').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setPrograms(data || []);
        } catch { toast.error(t('admin.loadError')); } finally { setLoading(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `postgrad/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('courses')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('courses')
                .getPublicUrl(filePath);

            setForm({ ...form, image_url: publicUrl });
            toast.success('Photo uploaded successfully');
        } catch (error: any) {
            console.error(error);
            toast.error(`Error: ${error.message || 'Error uploading photo'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const reqArray = form.requirements.split(',').map(s => s.trim()).filter(Boolean);
            const payload = {
                title: form.title,
                university: form.university,
                type: form.type,
                requirements: reqArray,
                deadline: form.deadline || null,
                description: form.description,
                duration: form.duration,
                fees: Number(form.fees),
                is_paid: form.is_paid,
                contact_email: form.contact_email,
                contact_phone: form.contact_phone,
                image_url: form.image_url
            };
            if (editingItem) {
                const { error } = await supabase.from('postgraduate').update(payload).eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('postgraduate').insert(payload);
                if (error) throw error;
            }
            toast.success(editingItem ? t('admin.editSuccess') : t('admin.addSuccess'));
            closeModal();
            fetchPrograms();
        } catch { toast.error(t('admin.saveFailed')); } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase.from('postgraduate').delete().eq('id', deleteId);
            if (error) throw error;
            toast.success(t('admin.deleteSuccess'));
            setDeleteId(null);
            fetchPrograms();
        } catch { toast.error(t('admin.deleteFailed')); }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setForm({
            title: item.title,
            university: item.university || 'جامعة كفر الشيخ',
            type: item.type || 'masters',
            requirements: (item.requirements || []).join(', '),
            deadline: item.deadline ? item.deadline.split('T')[0] : '',
            description: item.description || '',
            duration: item.duration || '',
            fees: item.fees || 0,
            is_paid: item.is_paid || false,
            contact_email: item.contact_email || '',
            contact_phone: item.contact_phone || '',
            image_url: item.image_url || ''
        });
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setForm({
            title: '',
            university: 'جامعة كفر الشيخ',
            type: 'masters',
            requirements: '',
            deadline: '',
            description: '',
            duration: '',
            fees: 0,
            is_paid: false,
            contact_email: '',
            contact_phone: '',
            image_url: ''
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <PageBanner image="/images/postgraduate-banner.png" title={t('admin.postgradTitle')} subtitle={t('admin.postgradSubtitle')} icon={<GraduationCap className="w-7 h-7 text-white" />} gradient="from-purple-700/85 to-fuchsia-700/85" />

            <div className="flex justify-end">
                <button onClick={() => {
                    setEditingItem(null);
                    setForm({
                        title: '', university: '', type: 'masters', requirements: '', deadline: '',
                        description: '', duration: '', fees: 0, is_paid: false,
                        contact_email: '', contact_phone: '', image_url: ''
                    });
                    setShowModal(true);
                }} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 active:scale-95 transition-all duration-300">
                    <Plus className="w-5 h-5" /> {t('admin.addNew')}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
            ) : (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 overflow-x-auto animate-fade-in-up">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.progTitle')}</th>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.progUniversity')}</th>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.progType')}</th>
                                <th className="px-6 py-4 text-start text-xs font-medium text-gray-500 uppercase">{t('admin.progDeadline')}</th>
                                <th className="px-6 py-4 text-end text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {programs.map(prog => (
                                <tr key={prog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{prog.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"><div className="flex items-center gap-1"><Building className="w-4 h-4" />{prog.university}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${prog.type === 'masters' ? 'bg-blue-100 text-blue-800 border-blue-200' : prog.type === 'phd' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-green-100 text-green-800 border-green-200'}`}>{t(`postgraduate.${prog.type}`)}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{prog.deadline ? new Date(prog.deadline).toLocaleDateString() : '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-end">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => openEdit(prog)} className="text-indigo-500 hover:text-indigo-700 transition-colors"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => setDeleteId(prog.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {programs.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t('admin.noResults')}</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900/75" onClick={closeModal}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl text-start overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100 dark:border-gray-700/50 animate-fade-in-up">
                            <div className="px-5 pt-6 pb-4 sm:p-7 sm:pb-5 flex justify-between items-center text-gray-900 dark:text-white">
                                <h3 className="text-xl font-bold">{editingItem ? t('admin.editItem') : t('admin.addItem')}</h3>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto custom-scrollbar text-gray-900 dark:text-white">
                                <div className="px-5 py-6 sm:px-7 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('admin.progTitle')}</label>
                                            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('admin.progUniversity')}</label>
                                            <input type="text" readOnly value={form.university} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none transition-all shadow-sm cursor-not-allowed" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('admin.progType')}</label>
                                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm">
                                                <option value="masters">{t('postgraduate.masters')}</option>
                                                <option value="phd">{t('postgraduate.phd')}</option>
                                                <option value="diploma">{t('postgraduate.diploma')}</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('admin.progDeadline')}</label>
                                            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('postgraduate.uploadImage') || t('topGraduates.uploadPhoto')}</label>
                                            <div className="flex items-center gap-4">
                                                {form.image_url && (
                                                    <div className="h-14 w-14 rounded-xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                                                        <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
                                                    </div>
                                                )}
                                                <label className="flex-1 cursor-pointer group">
                                                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 group-hover:border-indigo-500 rounded-xl py-3 transition-all bg-gray-50 dark:bg-gray-800/50">
                                                        {uploading ? (
                                                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 mb-1" />
                                                                <span className="text-xs font-medium text-gray-500 group-hover:text-indigo-600">{t('topGraduates.clickToUpload')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                                </label>
                                                {form.image_url && (
                                                    <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('postgraduate.description')}</label>
                                            <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm resize-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('postgraduate.duration')}</label>
                                            <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 years" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('postgraduate.imageUrl')}</label>
                                            <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="URL" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">{t('postgraduate.paidProgram')}</span>
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, is_paid: !form.is_paid })}
                                                className={`w-12 h-6 flex items-center rounded-full px-1 transition-colors ${form.is_paid ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_paid ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                        {form.is_paid && (
                                            <div className="animate-fade-in">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase">{t('postgraduate.fees')} ({t('common.currency')})</label>
                                                <input type="number" required value={form.fees} onChange={e => setForm({ ...form, fees: Number(e.target.value) })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('postgraduate.contactEmail')}</label>
                                            <input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('postgraduate.contactPhone')}</label>
                                            <input type="text" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">{t('admin.progReqs')}</label>
                                        <TagInput
                                            tags={form.requirements ? form.requirements.split(',').map(s => s.trim()).filter(Boolean) : []}
                                            onTagsChange={(newTags) => setForm({ ...form, requirements: newTags.join(', ') })}
                                            placeholder={t('admin.reqPlaceholder')}
                                            addButtonText={t('common.add')}
                                        />
                                    </div>
                                </div>
                                <div className="px-5 py-5 sm:px-7 bg-gray-50 dark:bg-gray-800/30 flex flex-col sm:flex-row-reverse gap-3">
                                    <button type="submit" disabled={submitting} className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
                                        {submitting && <Loader2 className="w-4 h-4 rtl:ml-2 ltr:mr-2 animate-spin" />}
                                        {t('admin.save')}
                                    </button>
                                    <button type="button" onClick={closeModal} className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                        {t('admin.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {deleteId && <ConfirmModal message={t('admin.confirmDelete')} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
        </div>
    );
}
