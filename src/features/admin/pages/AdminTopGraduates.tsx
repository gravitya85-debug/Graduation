import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
    Award,
    Plus,
    Trash2,
    Edit2,
    Loader2,
    User,
    Building,
    Calendar,
    Image as ImageIcon,
    Save,
    X,
    Filter
} from 'lucide-react';
import PageBanner from '../../../components/PageBanner';

interface TopGraduate {
    id: string;
    name: string;
    department: string;
    year: number;
    rank: number;
    grade: string;
    image_url: string;
}

const DEPARTMENTS = [
    'تكنولوجيا التعليم والحاسب الآلي',
    'التربية الفنية',
    'التربية الموسيقية',
    'الاقتصاد المنزلي',
    'الإعلام التربوي'
];

export default function AdminTopGraduates() {
    const { t } = useTranslation();
    const [graduates, setGraduates] = useState<TopGraduate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        department: DEPARTMENTS[0],
        year: new Date().getFullYear(),
        rank: 1,
        grade: '',
        image_url: ''
    });

    const [filterDept, setFilterDept] = useState('All');
    const [filterYear, setFilterYear] = useState('All');

    useEffect(() => {
        fetchGraduates();
    }, []);

    const fetchGraduates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('top_graduates')
                .select('*')
                .order('year', { ascending: false })
                .order('rank', { ascending: true });

            if (error) throw error;
            setGraduates(data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load top graduates');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `grads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('courses') 
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload Error Details:', uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('courses')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image_url: publicUrl });
            toast.success('Photo uploaded successfully');
        } catch (error: any) {
            console.error('Full Error Object:', error);
            toast.error(`Error: ${error.message || 'Error uploading photo'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (editingId) {
                const { error } = await supabase
                    .from('top_graduates')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success(t('topGraduates.saveSuccess'));
            } else {
                const { error } = await supabase
                    .from('top_graduates')
                    .insert([formData]);
                if (error) throw error;
                toast.success(t('topGraduates.saveSuccess'));
            }
            setIsModalOpen(false);
            setEditingId(null);
            resetForm();
            fetchGraduates();
        } catch (error) {
            console.error(error);
            toast.error('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('topGraduates.deleteConfirm'))) return;
        try {
            const { error } = await supabase
                .from('top_graduates')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success(t('topGraduates.deleteSuccess'));
            fetchGraduates();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting graduate');
        }
    };

    const openEditModal = (grad: TopGraduate) => {
        setFormData({
            name: grad.name,
            department: grad.department,
            year: grad.year,
            rank: grad.rank,
            grade: grad.grade,
            image_url: grad.image_url
        });
        setEditingId(grad.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            department: DEPARTMENTS[0],
            year: new Date().getFullYear(),
            rank: 1,
            grade: '',
            image_url: ''
        });
        setEditingId(null);
    };

    const filteredGraduates = graduates.filter(g => {
        const deptMatch = filterDept === 'All' || g.department === filterDept;
        const yearMatch = filterYear === 'All' || g.year.toString() === filterYear;
        return deptMatch && yearMatch;
    });

    const uniqueYears = Array.from(new Set(graduates.map(g => g.year))).sort((a, b) => b - a);

    return (
        <div className="space-y-6">
            <PageBanner
                title={t('topGraduates.adminTitle')}
                subtitle={t('topGraduates.adminSubtitle')}
                icon={<Award className="w-8 h-8 text-white" />}
                gradient="from-amber-500 to-orange-600" image={''} />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-300 outline-none"
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                            >
                                <option value="All">{t('common.allDepts') || 'All Departments'}</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <select
                                className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-300 outline-none"
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                            >
                                <option value="All">{t('common.allYears') || 'All Years'}</option>
                                {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        {t('topGraduates.addTopGrad')}
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    </div>
                ) : filteredGraduates.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('topGraduates.noTopGrads')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGraduates.map((grad) => (
                            <div key={grad.id} className="group bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-indigo-500/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                                        <img
                                            src={grad.image_url || '/images/default-avatar.png'}
                                            alt={grad.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(grad)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(grad.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{grad.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Building className="w-3.5 h-3.5" />
                                        <span>{grad.department}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                                            <Award className="w-3 h-3" />
                                            {grad.rank === 1 ? t('topGraduates.first') : grad.rank === 2 ? t('topGraduates.second') : grad.rank === 3 ? t('topGraduates.third') : `${grad.rank}th`}
                                        </div>
                                        <div className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                            {grad.year}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {editingId ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
                                {editingId ? t('topGraduates.editTopGrad') : t('topGraduates.addTopGrad')}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-indigo-500" /> {t('topGraduates.name')}
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Building className="w-4 h-4 text-indigo-500" /> {t('topGraduates.department')}
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-500" /> {t('topGraduates.year')}
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-indigo-500" /> {t('topGraduates.ranking')}
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.rank}
                                        onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                                            <option key={r} value={r}>
                                                {r === 1 ? t('topGraduates.first') : r === 2 ? t('topGraduates.second') : r === 3 ? t('topGraduates.third') : `${r}th`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-indigo-500" /> {t('topGraduates.grade')}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Excellent with Honors"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.grade}
                                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-indigo-500" /> {t('topGraduates.uploadPhoto')}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {formData.image_url && (
                                            <div className="h-16 w-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" />
                                            </div>
                                        )}
                                        <label className="flex-1 cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl py-6 transition-all bg-gray-50 dark:bg-gray-900/50 group">
                                            {uploading ? (
                                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
                                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('topGraduates.clickToUpload')}</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    {formData.image_url && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="text"
                                                readOnly
                                                className="flex-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 outline-none"
                                                value={formData.image_url}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image_url: '' })}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                {t('common.remove')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
