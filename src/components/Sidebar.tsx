import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Briefcase,
    Award,
    BookOpen,
    Users,
    GraduationCap,
    LogOut,
    X,
    Shield,
    BarChart3,
    HelpCircle,
    ClipboardList,
    Calendar
} from 'lucide-react';

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean, setMobileMenuOpen: (b: boolean) => void }) {
    const { role, logout } = useAuth();
    const { t, i18n } = useTranslation();

    const handleLogout = async () => {
        await logout();
    };

    const commonLinks = [
        { name: t('sidebar.dashboard'), to: '/dashboard', icon: LayoutDashboard },
        { name: t('faq.title'), to: '/faq', icon: HelpCircle }
    ];

    const graduateLinks = [
        { name: t('sidebar.myProfile'), to: '/profile', icon: Users },
        { name: t('sidebar.jobs'), to: '/jobs', icon: Briefcase },
        { name: t('sidebar.certificates'), to: '/certificates', icon: Award },
        { name: t('sidebar.workshops'), to: '/workshops', icon: Calendar },
        { name: t('sidebar.courses'), to: '/courses', icon: BookOpen },
        { name: t('sidebar.postgraduates'), to: '/postgraduate', icon: GraduationCap },
    ];

    const companyLinks = [
        { name: t('sidebar.myProfile'), to: '/profile', icon: Users },
        { name: t('sidebar.manageJobs'), to: '/jobs/manage', icon: Briefcase },
        { name: t('sidebar.applicants'), to: '/applicants', icon: Users },
    ];

    const adminLinks = [
        { name: t('admin.tabOverview'), to: '/admin/overview', icon: BarChart3 },
        { name: t('admin.tabUsers'), to: '/admin/users', icon: Users },
        { name: t('admin.tabCerts'), to: '/admin/certificates', icon: Award },
        { name: t('admin.tabJobs'), to: '/admin/jobs', icon: Briefcase },
        { name: t('admin.tabCourses'), to: '/admin/courses', icon: BookOpen },
        { name: t('admin.tabPostgrad'), to: '/admin/postgraduate', icon: GraduationCap },
        { name: t('workshops.title'), to: '/admin/workshops', icon: Calendar },
        { name: t('sidebar.enrollments'), to: '/admin/enrollments', icon: ClipboardList },
        { name: t('sidebar.manageTopGrads'), to: '/admin/top-graduates', icon: Award },
    ];

    const doctorLinks = [
        { name: t('sidebar.dashboard'), to: '/dashboard', icon: LayoutDashboard },
        { name: t('sidebar.myProfile'), to: '/profile', icon: Users },
        { name: t('sidebar.manageCourses'), to: '/doctor/courses', icon: BookOpen },
        { name: t('sidebar.enrollments'), to: '/doctor/enrollments', icon: ClipboardList },
        { name: t('sidebar.manageWorkshops'), to: '/doctor/workshops', icon: Calendar },
        { name: t('sidebar.courses'), to: '/courses', icon: BookOpen },
        { name: t('sidebar.workshops'), to: '/workshops', icon: Calendar },
    ];

    let linksToRender = commonLinks;
    if (role === 'graduate') linksToRender = [...commonLinks, ...graduateLinks];
    if (role === 'company') linksToRender = [...commonLinks.filter(link => link.to !== '/faq'), ...companyLinks];
    if (role === 'admin') linksToRender = adminLinks;
    if (role === 'doctor') linksToRender = doctorLinks;

    const isArabic = i18n.language === 'ar';

    return (
        <>
            {/* Mobile backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar surface */}
            <div className={`
        fixed inset-y-0 ${isArabic ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-64 bg-white/80 dark:bg-gray-900/70 backdrop-blur-2xl border-gray-200/50 dark:border-gray-800/50 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 lg:static lg:inset-auto shadow-premium dark:shadow-premium-dark
        ${mobileMenuOpen ? 'translate-x-0' : (isArabic ? 'translate-x-full' : '-translate-x-full')}
      `}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="h-22 flex items-center justify-between px-6 border-b border-gray-200/50 dark:border-gray-800/50">
                        <div className="flex items-center gap-4 group cursor-pointer" title={t('sidebar.gradhub_1') + ' ' + t('sidebar.gradhub_2')}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[19px] font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight">
                                    {t('sidebar.gradhub_1')}
                                </span>
                                <span className="text-[15px] font-bold text-gray-500 dark:text-gray-400 leading-tight">
                                    {t('sidebar.gradhub_2')}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md ring-1 ring-gray-200 dark:ring-gray-700">
                                <img src="/images/logo.png" alt="University Logo" className="h-10 w-10 object-contain" />
                            </div>
                        </div>
                        <button
                            className="lg:hidden text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-transform active:scale-90 bg-gray-100 dark:bg-gray-800 p-1 rounded-md"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                        {linksToRender.map((link) => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={link.name}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-out
                    ${isActive
                                            ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/40 dark:from-indigo-900/40 dark:to-indigo-900/10 text-indigo-700 dark:text-indigo-300 shadow-[0_2px_10px_rgba(99,102,241,0.1)] border border-indigo-100/50 dark:border-indigo-800/30'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
                                        }
                    hover:scale-[1.01] hover:shadow-sm
                  `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:scale-110'}`} />
                                            <span className={`transition-transform duration-300 flex-1 ${isActive ? 'rtl:-translate-x-1 ltr:translate-x-1' : 'group-hover:rtl:-translate-x-1 group-hover:ltr:translate-x-1'}`}>
                                                {link.name}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Footer Profile / Logout */}
                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
                        <button
                            onClick={handleLogout}
                            className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                        >
                            <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rtl:translate-x-1 group-hover:ltr:-translate-x-1" />
                            {t('sidebar.logout')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

