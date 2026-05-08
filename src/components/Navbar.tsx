import { useState, useEffect } from 'react';
import { Menu, Bell, User, Moon, Sun, Globe, CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotifications';

export default function Navbar({ setMobileMenuOpen }: { setMobileMenuOpen: (o: boolean) => void }) {
    const { user, role, userName } = useAuth();
    const { t, i18n } = useTranslation();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);

    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme === 'dark';
            return false;
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
        document.documentElement.lang = newLang;
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    useEffect(() => {
        document.documentElement.lang = i18n.language;
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    const isArabic = i18n.language === 'ar';
    const roleName = t(`navbar.${role}`);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <header className={`h-16 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 transition-all duration-500`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-transform active:scale-90"
                    title={t('navbar.openMenu')}
                >
                    <Menu className="h-6 w-6" />
                </button>
                <span className="hidden sm:block text-sm font-semibold text-gray-600 dark:text-gray-300 capitalize whitespace-nowrap bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                    {roleName}
                </span>
            </div>

            <div className="flex items-center gap-5">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all duration-300 active:scale-95 text-sm font-bold bg-gray-50/50 dark:bg-gray-800/30 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    title="تغيير اللغة | Change Language"
                >
                    <Globe className="w-5 h-5" />
                    <span>{isArabic ? 'EN' : 'العربية'}</span>
                </button>

                <button
                    onClick={toggleTheme}
                    className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all duration-300 active:scale-90 bg-gray-50/50 dark:bg-gray-800/30 p-2 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    title={t('navbar.toggleTheme')}
                >
                    {isDark ? <Sun className="w-5 h-5 animate-in spin-in-12" /> : <Moon className="w-5 h-5 animate-in spin-in-12" />}
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all duration-300 active:scale-90 relative bg-gray-50/50 dark:bg-gray-800/30 p-2 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        title={t('navbar.notifications')}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-in fade-in zoom-in duration-300">
                                {unreadCount > 9 ? '+9' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className={`absolute top-full mt-3 ${isArabic ? 'left-0' : 'right-0'} w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50`}>
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <h3 className="font-bold text-sm">{t('navbar.notifications')}</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                        تحديد الكل كمقروء
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            onClick={() => markAsRead(n.id)}
                                            className={`p-4 border-b border-gray-50 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1">{getIcon(n.type)}</div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold dark:text-white leading-tight">{n.title}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{n.message}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-medium">
                                                        {new Date(n.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                {!n.read && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5"></div>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <Bell className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">لا توجد إشعارات حالياً</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex items-center gap-3 border-gray-200/50 dark:border-gray-700/50 ${isArabic ? 'border-r pr-4' : 'border-l pl-4'} h-8`}>
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                            {userName || user?.email}
                        </p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm ring-2 ring-white dark:ring-gray-900 cursor-pointer hover:scale-105 transition-transform duration-300">
                        <User className="w-4.5 h-4.5" />
                    </div>
                </div>
            </div>
            {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>}
        </header>
    );
}
