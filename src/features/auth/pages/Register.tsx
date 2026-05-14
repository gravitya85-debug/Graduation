import { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../../../types';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'graduate' as UserRole
    });
    const [loading, setLoading] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await register(formData.email, formData.password, {
            name: formData.name,
            role: formData.role
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        // Automatically log in after registration
        const { error: loginError } = await login(formData.email, formData.password);
        
        if (loginError) {
            toast.error(t('auth.loginError'));
            setLoading(false);
            navigate('/login');
            return;
        }

        toast.success(t('auth.registerSuccess'));
        navigate('/dashboard');
        setLoading(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex transition-colors relative overflow-hidden">
            {/* Image Side */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <img
                    src="images/hero-bg.png"
                    alt="Graduates celebrating"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-indigo-900/40 to-transparent"></div>
                <div className="relative z-10 flex flex-col justify-end p-12 text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center p-2">
                            <img src="images/logo.png" alt="University Logo" className="w-full h-full object-contain brightness-110 shadow-sm" />
                        </div>
                        <span className="text-2xl font-extrabold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">{t('navbar.brandNameShort')}</span>
                    </div>
                    <h2 className="text-3xl font-extrabold mb-3 leading-tight">انضم إلى مجتمع الخريجين</h2>
                    <p className="text-indigo-100 text-lg leading-relaxed max-w-md">أنشئ حسابك وابدأ رحلتك المهنية مع منصة خريجي كلية التربية النوعية بجامعة كفر الشيخ.</p>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
                {/* Background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[100px]"></div>
                    <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-[100px]"></div>
                </div>

                <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700/50 relative z-10 animate-fade-in-up">
                    <div className="text-center">
                        <div className="mx-auto h-20 w-20 bg-white/80 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg border border-white dark:border-gray-700/50 p-3 mb-6 lg:hidden">
                            <img src="images/logo.png" alt="University Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                            {t('auth.registerTitle')}
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {formData.role === 'company' ? t('auth.fullName') : t('profile.fullName')}
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.password')}</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="mt-1 appearance-none relative block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.iam')}</label>
                                <select
                                    name="role"
                                    className="mt-1 block w-full px-4 py-3 text-base border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl transition-all shadow-sm"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="graduate">{t('auth.student')}</option>
                                    <option value="company">{t('auth.employer')}</option>
                                    <option value="doctor">{t('auth.doctor')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 active:scale-95"
                            >
                                {loading ? t('auth.creatingAccount') : t('auth.register')}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('auth.haveAccount')}{' '}
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                                {t('auth.signIn')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


