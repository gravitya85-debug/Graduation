import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { User, Phone, Briefcase, GraduationCap, FileText, UploadCloud, Loader2, MapPin, Building, Award, BookOpen, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../../components/PageBanner';
import TagInput from '../../../components/TagInput';

export default function Profile() {
    const { user, role, refreshProfile } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        specialization: '',
        graduation_year: '',
        skills: '',
        cv_url: '',
        description: '',
        website: '',
        industry: '',
        location: '',
        logo_url: '',
        degree: '',
        department: '',
        bio: '',
        office_hours: '',
        research_interests: '',
        avatar_url: ''
    });

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (userError) throw userError;

            let gradData = null;
            if (role === 'graduate') {
                const { data, error } = await supabase
                    .from('graduates')
                    .select('*')
                    .eq('user_id', user?.id)
                    .single();
                if (error && error.code !== 'PGRST116') throw error;
                gradData = data;
            }

            let compData = null;
            if (role === 'company') {
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('user_id', user?.id)
                    .single();
                if (error && error.code !== 'PGRST116') throw error;
                compData = data;
            }

            let docData = null;
            if (role === 'doctor') {
                const { data, error } = await supabase
                    .from('doctors')
                    .select('*')
                    .eq('user_id', user?.id)
                    .single();
                if (error && error.code !== 'PGRST116') throw error;
                docData = data;
            }

            setProfileData({
                name: userData?.name || '',
                phone: userData?.phone || '',
                specialization: gradData?.specialization || docData?.specialization || '',
                graduation_year: gradData?.graduation_year || '',
                skills: gradData?.skills ? gradData.skills.join(', ') : '',
                cv_url: gradData?.cv_url || '',
                description: compData?.description || '',
                website: compData?.website || '',
                industry: compData?.industry || '',
                location: compData?.location || '',
                logo_url: compData?.logo_url || '',
                degree: docData?.degree || '',
                department: docData?.department || '',
                bio: docData?.bio || '',
                office_hours: docData?.office_hours || '',
                research_interests: docData?.research_interests || '',
                avatar_url: docData?.avatar_url || ''
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);

            const { error: usersError } = await supabase
                .from('users')
                .update({ name: profileData.name, phone: profileData.phone })
                .eq('id', user?.id);
            if (usersError) throw usersError;

            if (role === 'graduate') {
                const skillsArray = profileData.skills.split(',').map((s) => s.trim()).filter(Boolean);
                const { error: gradError } = await supabase
                    .from('graduates')
                    .upsert({
                        user_id: user?.id,
                        specialization: profileData.specialization,
                        graduation_year: parseInt(profileData.graduation_year.toString()) || null,
                        skills: skillsArray,
                        cv_url: profileData.cv_url
                    });
                if (gradError) throw gradError;
            }

            if (role === 'company') {
                const { error: compError } = await supabase
                    .from('companies')
                    .upsert({
                        user_id: user?.id,
                        description: profileData.description,
                        website: profileData.website,
                        industry: profileData.industry,
                        location: profileData.location,
                        logo_url: profileData.logo_url
                    });
                if (compError) throw compError;
            }

            if (role === 'doctor') {
                const { error: docError } = await supabase
                    .from('doctors')
                    .upsert({
                        user_id: user?.id,
                        degree: profileData.degree,
                        department: profileData.department,
                        specialization: profileData.specialization,
                        bio: profileData.bio,
                        office_hours: profileData.office_hours,
                        research_interests: profileData.research_interests,
                        avatar_url: profileData.avatar_url
                    });
                if (docError) throw docError;
            }


            refreshProfile();
            toast.success(t('profile.saveChanges') + ' ✅');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            setUploading(true);

            const { error: uploadError } = await supabase.storage
                .from('cvs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('cvs')
                .getPublicUrl(filePath);

            setProfileData({ ...profileData, cv_url: publicUrl });
            toast.success('CV Uploaded Successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Error uploading CV.');
        } finally {
            setUploading(false);
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
        <div className="max-w-4xl mx-auto space-y-6">
            <PageBanner
                image="/images/profile-banner.png"
                title={t('profile.title')}
                icon={<User className="w-7 h-7 text-white" />}
                gradient="from-teal-700/85 to-cyan-700/85"
            />
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-2xl p-6 sm:p-10 border border-gray-100 dark:border-gray-700/50 transition-all duration-300">

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Common Info */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-500" /> {t('profile.fullName')}
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-indigo-500" /> {t('profile.phone')}
                            </label>
                            <input
                                type="tel"
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            />
                        </div>

                        {/* Graduate Specific Options */}
                        {role === 'graduate' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-indigo-500" /> {t('profile.specialization')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.specialization}
                                        onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-indigo-500" /> {t('profile.graduationYear')}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.graduation_year}
                                        onChange={(e) => setProfileData({ ...profileData, graduation_year: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-indigo-500" /> {t('profile.skills')}
                                    </label>
                                    <TagInput
                                        tags={profileData.skills ? profileData.skills.split(',').map(s => s.trim()).filter(Boolean) : []}
                                        onTagsChange={(newTags) => setProfileData({ ...profileData, skills: newTags.join(', ') })}
                                        placeholder={t('profile.skillsPlaceholder')}
                                        addButtonText={t('profile.addSkill')}
                                    />
                                </div>
                            </>
                        )}

                        {/* Company Specific Options */}
                        {role === 'company' && (
                            <>
                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <Building className="w-5 h-5 text-indigo-500" /> {t('profile.companyInfo')}
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-indigo-500" /> {t('profile.industry')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.industry}
                                        onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-500" /> {t('profile.website')}
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.website}
                                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-500" /> {t('profile.location')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.location}
                                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <FileText className="w-5 h-5 text-indigo-500" /> {t('profile.aboutCompany')}
                                    </h3>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-500" /> {t('profile.companyDescription')}
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.description}
                                        onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        {/* Doctor Specific Options */}
                        {role === 'doctor' && (
                            <>
                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <Award className="w-5 h-5 text-indigo-500" /> {t('profile.doctorInfo')}
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-indigo-500" /> {t('profile.academicDegree')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.degree}
                                        onChange={(e) => setProfileData({ ...profileData, degree: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Building className="w-4 h-4 text-indigo-500" /> {t('profile.department')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.department}
                                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-indigo-500" /> {t('profile.specialization')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.specialization}
                                        onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-indigo-500" /> {t('profile.researchInterests')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.research_interests}
                                        onChange={(e) => setProfileData({ ...profileData, research_interests: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-500" /> {t('profile.officeHours')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.office_hours}
                                        onChange={(e) => setProfileData({ ...profileData, office_hours: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-500" /> {t('profile.bio')}
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {role === 'graduate' && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-500" /> {t('profile.resumeInfo')}
                            </h3>

                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors">
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                    {uploading ? t('profile.uploading') : t('profile.uploadNewCV')}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={uploadFile}
                                        disabled={uploading}
                                    />
                                </label>

                                {profileData.cv_url && (
                                    <a
                                        href={profileData.cv_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline dark:text-indigo-400 text-sm font-medium truncate max-w-[200px]"
                                    >
                                        {t('profile.viewCurrentCV')}
                                    </a>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {t('profile.cvNotice')}
                            </p>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
