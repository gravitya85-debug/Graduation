import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users, Award, Briefcase, Globe, ArrowRight,
    Menu, X, GraduationCap,
    Send, MessageSquare, ArrowLeft,
    BookOpen,
    CheckCircle,
    Share2,
    LinkIcon,
    MapPin,
    Mail,
    Sparkles,
    Loader2,
    Bot,
    Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AIAssistant from '../../../components/AIAssistant';


// Animation variants
const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50, damping: 20 } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 60 } }
};

export default function Landing() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'graduate' | 'employer'>('graduate');
    const [topGrads, setTopGrads] = useState<any[]>([]);

    useEffect(() => {
        const fetchTopGrads = async () => {
            const { data } = await supabase
                .from('top_graduates')
                .select('*')
                .order('year', { ascending: false })
                .order('rank', { ascending: true });
            setTopGrads(data || []);
        };
        fetchTopGrads();
    }, []);

    const groupedGrads = topGrads.reduce((acc: any, grad: any) => {
        if (!acc[grad.department]) acc[grad.department] = [];
        acc[grad.department].push(grad);
        return acc;
    }, {});
    const { t, i18n } = useTranslation();

    const isArabic = i18n.language === 'ar';

    const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

    const features = [
        {
            icon: <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
            title: "إدارة الشهادات إلكترونياً",
            description: "اربط بياناتك الأكاديمية مع كلية التربية النوعية. قدم طلبات استخراج الشهادات، وتتبع حالة الطلب، وحدد مواعيد الاستلام بكل سهولة وموثوقية."
        },
        {
            icon: <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
            title: "فرص عمل حقيقية",
            description: "قم بالتواصل الفعّال مع كبرى الشركات واستكشف الوظائف التي تتناسب تماماً مع تخصصاتك ومسارك الأكاديمي بجامعة كفر الشيخ."
        },
        {
            icon: <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
            title: "تطوير مهارات التدريس والإبداع",
            description: "استفد من كورسات وبرامج تدريبية معتمدة لرفع كفاءتك المهنية ومواكبة سوق العمل في مجالات التربية النوعية."
        },
        {
            icon: <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
            title: "التقديم للدراسات العليا",
            description: "استكمل رحلتك الأكاديمية من خلال تصفح برامج الماجستير والدكتوراه المتاحة بالكلية والتقديم عليها عبر منصة واحدة متكاملة."
        }
    ];

    const steps = [
        { title: "سجل حسابك", desc: "قم بإنشاء حساب مجاني وموثق بخطوات بسيطة.", icon: <Users className="w-6 h-6" /> },
        { title: "أكمل ملفك", desc: "أضف سيرتك الذاتية ومهاراتك لعرضها على الشركات.", icon: <CheckCircle className="w-6 h-6" /> },
        { title: "استكشف الفرص", desc: "ابحث عن وظائف، كورسات، أو شهادات أكاديمية.", icon: <Globe className="w-6 h-6" /> },
        { title: "ابنِ مستقبلك", desc: "انطلق نحو مسيرة مهنية وأكاديمية ناجحة.", icon: <ArrowIcon className="w-6 h-6" /> }
    ];

    const successStories = [
        {
            name: "د. أحمد سامي",
            role: "باحث دكتوراه ومدرس مساعد",
            story: "وفرت المنصة علي الكثير من الوقت أثناء التقديم لبرامج الدراسات العليا واستخراج الأوراق، كلية التربية النوعية أبدعت في هذا التطور الرقمي.",
            image: "https://i.pravatar.cc/150?img=11"
        },
        {
            name: "سارة محمد",
            role: "خريجة ومصممة جرافيك",
            story: "بفضل معرض الوظائف الموجود بالمنصة، تمكنت من التواصل مع شركات وظفتني بعد شهر واحد من تخرجي من جامعة كفر الشيخ.",
            image: "https://i.pravatar.cc/150?img=5"
        },
        {
            name: "عمر طارق",
            role: "معلم تربية فنية",
            story: "الكورسات التطويرية على المنصة ساعدتني كثيراً في مواكبة أساليب التدريس الحديثة وتحسين قدراتي الإبداعية كمعلم نوعي.",
            image: "https://i.pravatar.cc/150?img=12"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 selection:bg-indigo-500/30 overflow-hidden relative">

            {/* Global Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40 dark:opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern text-gray-400 dark:text-gray-600"></div>
            </div>

            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-full h-screen mesh-gradient"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="glass-panel px-6 py-4 rounded-[2rem] flex justify-between items-center shadow-lg shadow-indigo-500/5">
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-md p-2 border border-white dark:border-gray-700 group-hover:rotate-12 transition-transform duration-500">
                                <img src="/images/logo.png" alt="University Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-600 to-gray-600 dark:from-white dark:via-indigo-400 dark:to-gray-300 tracking-tight">
                                {t('navbar.brandNameShort')}
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-10">
                            {[
                                { id: 'hero', label: 'الرئيسية' },
                                { id: 'features', label: 'المميزات' },
                                { id: 'success-stories', label: 'قصص النجاح' },
                                { id: 'top-graduates', label: 'أوائل الخريجين' },
                                { id: 'faq', label: 'المساعد الذكي' },
                                { id: 'about', label: 'عن الجامعة' }
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all hover:tracking-[0.2em]"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400 transition-colors px-6">
                                تسجيل الدخول
                            </Link>
                            <Link to="/register" className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 px-8 py-3 rounded-2xl transition-all active:scale-95">
                                ابدأ الآن
                            </Link>
                        </div>

                        <div className="md:hidden flex items-center">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300 glass-panel rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 pt-2 pb-6 flex flex-col gap-4 shadow-xl relative z-50"
                    >
                        {[
                            { id: 'hero', label: 'الرئيسية' },
                            { id: 'features', label: 'المميزات' },
                            { id: 'success-stories', label: 'قصص النجاح' },
                            { id: 'top-graduates', label: 'أوائل الخريجين' },
                            { id: 'faq', label: 'المساعد الذكي' },
                            { id: 'about', label: 'عن الجامعة' }
                        ].map((link) => (
                            <a
                                key={link.id}
                                href={`#${link.id}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-base font-bold text-gray-800 dark:text-gray-200 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="h-px bg-gray-200 dark:bg-gray-800 my-2"></div>
                        <Link to="/login" className="text-center text-base font-bold text-gray-800 dark:text-gray-200 p-3 rounded-xl border border-gray-200 dark:border-gray-700">تسجيل الدخول</Link>
                        <Link to="/register" className="text-center text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl shadow-md">ابدأ الآن</Link>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section — Split Layout with Image */}
            <section id="hero" className="pt-28 pb-16 md:pt-40 md:pb-24 px-4 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Text Content */}
                    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="flex-1 text-center lg:text-start space-y-8">
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-200 dark:border-indigo-800 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            المنصة الرسمية لخريجي تربية نوعية
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                            تمكين خريجي <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-normal">كلية التربية النوعية</span> للمستقبل
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            رحلتك لم تنتهِ بعد التخرج! بوابتك الرسمية المعتمدة للتواصل الدائم مع جامعة كفر الشيخ. استخرج شهاداتك الجامعية بأمان، وابحث عن وظائف مرموقة تتوافق مع تخصصك النوعي.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 pt-4">
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group">
                                ابدأ مسيرتك الآن
                                <ArrowIcon className="w-5 h-5 transition-transform duration-300 group-hover:rtl:-translate-x-1 group-hover:ltr:translate-x-1" />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-white rounded-2xl font-bold text-lg shadow-sm border border-gray-200 dark:border-gray-700/50 hover:bg-gray-50/90 dark:hover:bg-gray-700/90 transition-all duration-300 active:scale-95 text-center">
                                اكتشف المزيد
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-1 w-full max-w-lg lg:max-w-none"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative z-10"
                            >
                                <img
                                    src="/images/graduates-kfs.png"
                                    alt="خريجون يحتفلون بالتخرج في جامعة كفر الشيخ"
                                    className="w-full h-auto rounded-[2.5rem] shadow-2xl border-4 border-white/40 dark:border-gray-700/40 object-cover aspect-[4/3] backdrop-blur-sm"
                                />
                                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-indigo-900/30 via-transparent to-transparent"></div>
                            </motion.div>

                            {/* Floating Badge — Bottom */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="absolute -bottom-6 rtl:-right-6 ltr:-left-6 glass-panel rounded-[2rem] p-6 shadow-2xl border-white/40 dark:border-gray-700/40 z-20 hidden lg:block"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
                                        <Award className="w-7 h-7 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">شهادات مستخرجة</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">+1,200</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Badge — Top */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1, duration: 0.8 }}
                                className="absolute -top-6 rtl:-left-6 ltr:-right-6 glass-panel rounded-[2rem] p-6 shadow-2xl border-white/40 dark:border-gray-700/40 z-20 hidden lg:block"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                        <Briefcase className="w-7 h-7 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">فرصة عمل متاحة</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">+350</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 pb-8 pt-4 leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-600 to-gray-600 dark:from-white dark:via-indigo-400 dark:to-gray-300 overflow-visible">
                            خدمات متكاملة لدعم تميزك
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">نقدم لخريجي كلية التربية النوعية كافة الموارد والأدوات المهنية للارتقاء وتسهيل الخدمات الإدارية والأكاديمية.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="glass-panel group p-8 rounded-[2rem] hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 border-white/40 dark:border-gray-700/40"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-600/20 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                                    {React.cloneElement(feature.icon as React.ReactElement<any>, { className: "w-8 h-8 text-white" })}
                                </div>
                                <h3 className="text-xl font-bold mb-4 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm font-medium">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="glass-panel p-12 rounded-[3rem] grid grid-cols-2 lg:grid-cols-4 gap-12 border-indigo-500/10 shadow-2xl shadow-indigo-500/5">
                        {[
                            { label: "خريج نشط", value: "+2,500", icon: <Users className="text-indigo-600" /> },
                            { label: "شهادة معتمدة", value: "+4,800", icon: <Award className="text-purple-600" /> },
                            { label: "فرصة عمل", value: "+150", icon: <Briefcase className="text-blue-600" /> },
                            { label: "شركة مسجلة", value: "+85", icon: <Globe className="text-emerald-600" /> }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center space-y-4"
                            >
                                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl mx-auto flex items-center justify-center shadow-lg transform -rotate-3 border border-gray-100 dark:border-gray-700">
                                    {React.cloneElement(stat.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">{stat.value}</p>
                                    <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 pb-8 pt-4 leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-600 to-gray-600 dark:from-white dark:via-indigo-400 dark:to-gray-300 overflow-visible">كيف تعمل المنصة؟</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">أربع خطوات بسيطة تفصلك عن فرص وظائف، كورسات، وشهادات معتمدة تسهم في بناء وتأمين مستقبلك.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-200 dark:via-indigo-800 to-transparent z-0"></div>

                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="relative z-10 flex flex-col items-center text-center group"
                            >
                                <div className="w-20 h-20 glass-panel rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-white/60 dark:border-gray-700/60 relative">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                        {i + 1}
                                    </div>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-tight">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 px-4 text-sm font-medium leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section id="success-stories" className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 pb-8 pt-4 leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-600 to-gray-600 dark:from-white dark:via-indigo-400 dark:to-gray-300 overflow-visible">قصص نجاح من أبناء الكلية</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">ألقِ نظرة على ما يقوله زملاؤك من خريجي كلية التربية النوعية بجامعة كفر الشيخ عن تجربتهم ومدى استفادتهم من المنصة.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {successStories.map((story, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel group p-10 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border-white/50 dark:border-gray-700/50 flex flex-col justify-between"
                            >
                                <div className="relative">
                                    <div className="text-6xl text-indigo-600/10 absolute -top-4 -left-2 font-serif">“</div>
                                    <p className="text-gray-700 dark:text-gray-300 italic mb-10 relative z-10 leading-relaxed font-medium">
                                        {story.story}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="relative">
                                        <img src={story.image} alt={story.name} className="w-14 h-14 rounded-2xl object-cover shadow-md ring-2 ring-white dark:ring-gray-700" />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white tracking-tight">{story.name}</h4>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">{story.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Graduates Section */}
            {topGrads.length > 0 && (
                <section id="top-graduates" className="relative py-32 px-6 overflow-hidden bg-white/50 dark:bg-gray-950/30">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4"></div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center space-y-4 mb-20">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-sm"
                            >
                                <Award className="w-4 h-4" />
                                {t('topGraduates.title')}
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
                            >
                                {t('topGraduates.title')}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium"
                            >
                                {t('topGraduates.subtitle')}
                            </motion.p>
                        </div>

                        <div className="space-y-24">
                            {Object.entries(groupedGrads).map(([dept, grads]: [string, any], deptIndex) => (
                                <div key={dept} className="space-y-10">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="h-8 w-1.5 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full"></div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                            {dept}
                                        </h3>
                                    </motion.div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {grads.slice(0, 10).map((grad: any, index: number) => (
                                            <motion.div
                                                key={grad.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ y: -10 }}
                                                className="group relative"
                                            >
                                                {/* Rank Badge Floating */}
                                                <div className={`absolute -top-4 -right-4 z-20 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white dark:border-gray-800 transition-transform group-hover:scale-110 group-hover:rotate-12 ${
                                                    grad.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                                                    grad.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                                    grad.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                                    'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                                }`}>
                                                    <span className="text-xl font-black italic">
                                                        {grad.rank}
                                                    </span>
                                                </div>

                                                <div className="glass-panel overflow-hidden rounded-[2.5rem] border-white/40 dark:border-gray-700/40 bg-white/40 dark:bg-gray-800/20 backdrop-blur-xl h-full flex flex-col group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500">
                                                    {/* Image Container */}
                                                    <div className="relative h-64 overflow-hidden">
                                                        <img 
                                                            src={grad.image_url || '/images/default-avatar.png'} 
                                                            alt={grad.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-8 flex-1 flex flex-col">
                                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-3">
                                                            <Calendar className="w-4 h-4" />
                                                            {grad.year}
                                                        </div>
                                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                                                            {grad.name}
                                                        </h4>
                                                        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-6 flex-1">
                                                            {grad.grade || t('topGraduates.first')}
                                                        </p>
                                                        
                                                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                                                            <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                                                {dept}
                                                            </span>
                                                            <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                                                                grad.rank === 1 ? 'bg-amber-500/10 text-amber-600' :
                                                                grad.rank === 2 ? 'bg-gray-500/10 text-gray-600' :
                                                                'bg-orange-500/10 text-orange-600'
                                                            }`}>
                                                                {grad.rank === 1 ? t('topGraduates.first') : grad.rank === 2 ? t('topGraduates.second') : t('topGraduates.third')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section id="team" className="py-24 relative z-10 bg-indigo-50/30 dark:bg-indigo-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-black text-sm border border-indigo-100 dark:border-indigo-900 shadow-xl mb-8"
                        >
                            فريق العمل - مشروع التخرج
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 pb-4 leading-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            تيم (أثر باقِ)
                        </h2>
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">تحت إشراف</p>
                            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">أ.د / عبير بدير</h3>
                            <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {[
                            "آلاء حلمي عبد الخالق عبد الحميد", "أحمد جابر محمد منصور", "أميره علاء بسيوني احمد", "أميره محمد السيد حسين", "إسلام السعيد حسن محمد",
                            "إيمان عبد العال كمال عبد العال", "اسلام اشرف محمد ابراهیم بدر", "ايه سعد قطب أبو طالب", "جلال ممدوح محمود سعده", "جويريه عبد الناصر سليمان البناوي",
                            "حسن جابر صبري", "حنين عزمي محمد الوحش", "رانيا ناصر فتحي حسن كساب", "سارة حسني محمد الجداوي", "شيماء خالد سالم عبد العزيز",
                            "عادل فتح الله محمد فتح الله زايد", "علا عادل عوض احمد كساب", "غاده عبد العليم بدراوي قطب", "غاده محمد زغلول عبد الحي", "نسمه حامد عبد العزيز البحيري",
                            "عبد الله محمد فوزي عبد العزيز", "محمد محمد عبد الحليم", "سهام صادق عبد المطلب صادق", "عمرو احمد عبد السلام تاج الدين", "محمد وائل حسين محمد"
                        ].map((name, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (i % 5) * 0.1 }}
                                className="glass-panel p-6 rounded-3xl border-white/40 dark:border-gray-700/40 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                        {name}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive AI Assistant Section */}
            <div id="faq">
                <AIAssistant />
            </div>

            <section className="py-32 px-4 relative z-10 group/cta">
                <div className="max-w-6xl mx-auto glass-panel rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl border-white/20">
                    <img src="/images/jobs-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover scale-110 group-hover/cta:scale-100 transition-transform duration-[2s] ease-out opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-indigo-800/90 to-purple-900/95"></div>

                    <div className="absolute -top-[20%] -right-[10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative z-10 space-y-10"
                    >
                        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                            ابدأ رحلتك الجامعية <br />
                            <span className="text-indigo-300">لآفاق أرحب اليوم</span>
                        </h2>
                        <p className="text-indigo-100/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            انضم إلى آلاف الخريجين والباحثين واكتشف مسارات جديدة لمهنتك وشركات تبحث عن مواهبك التخصصية، كل ذلك ضمن محيط جامعة كفر الشيخ.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                            <Link to="/register" className="group/btn relative px-10 py-5 bg-white text-indigo-900 rounded-[1.5rem] font-black text-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 flex items-center gap-3">
                                سجل الآن وانطلق
                                <ArrowIcon className="w-6 h-6 transition-transform duration-500 group-hover/btn:translate-x-1" />
                            </Link>
                            <Link to="/login" className="px-10 py-5 bg-indigo-500/20 backdrop-blur-md border border-white/20 text-white rounded-[1.5rem] font-bold text-xl hover:bg-indigo-500/30 transition-all">
                                تسجيل الدخول
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <footer id="about" className="relative z-10 pt-32 pb-12 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Top Divider with Glow */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent mb-24"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                        {/* Brand Column */}
                        <div className="lg:col-span-4 space-y-10">
                            <a href="https://kfs.edu.eg/specific/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center p-3 shadow-2xl border border-white/50 dark:border-gray-700/50">
                                    <img src="/images/logo.png" alt="University Logo" className="h-full w-full object-contain" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight">
                                        كلية التربية النوعية
                                    </h4>
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">جامعة كفر الشيخ</p>
                                </div>
                            </a>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium text-lg max-w-sm">
                                المنصة الرسمية المعتمدة لخدمة خريجي الكلية. نسعى لتوفير بيئة رقمية متكاملة تربط الخريج بمؤسسته الأكاديمية وتفتح له آفاق سوق العمل.
                            </p>
                        </div>

                        {/* Quick Links Group */}
                        <div className="lg:col-span-4 grid grid-cols-2 gap-8">
                            <div className="space-y-8">
                                <h4 className="text-gray-900 dark:text-white font-black uppercase tracking-widest text-sm">الروابط السريعة</h4>
                                <ul className="space-y-5 text-gray-500 dark:text-gray-400 font-bold">
                                    {[
                                        { id: 'hero', label: 'الرئيسية' },
                                        { id: 'features', label: 'المميزات' },
                                        { id: 'success-stories', label: 'قصص النجاح' },
                                        { id: 'faq', label: 'المساعد الذكي' }
                                    ].map(link => (
                                        <li key={link.id}>
                                            <a href={`#${link.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-3 group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"></div>
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-8">
                                <h4 className="text-gray-900 dark:text-white font-black uppercase tracking-widest text-sm">البوابة الرقمية</h4>
                                <ul className="space-y-5 text-gray-500 dark:text-gray-400 font-bold">
                                    {[
                                        { label: 'تسجيل الدخول', url: '/login' },
                                        { label: 'إنشاء حساب', url: '/register' },
                                        { label: 'بوابة الشركات', url: '/register?role=company' },
                                        { label: 'الدراسات العليا', url: '/postgraduate' },
                                        { label: 'موقع الكلية', url: 'https://kfs.edu.eg/specific/', isExternal: true }
                                    ].map(link => (
                                        <li key={link.label}>
                                            {link.isExternal ? (
                                                <a 
                                                    href={link.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-3 group"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"></div>
                                                    {link.label}
                                                </a>
                                            ) : (
                                                <Link to={link.url} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-3 group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"></div>
                                                    {link.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Contact & Newsletter */}
                        <div className="lg:col-span-4 space-y-10">
                            <div className="glass-panel p-8 rounded-[2.5rem] border-white/40 dark:border-gray-700/40 space-y-8">
                                <h4 className="text-gray-900 dark:text-white font-black text-xl tracking-tight">اشترك في النشرة الإخبارية</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">ابقَ على اطلاع بأحدث الوظائف وفعاليات الكلية.</p>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        placeholder="بريدك الإلكتروني"
                                        className="w-full bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 ltr:pl-5 ltr:pr-14 rtl:pr-5 rtl:pl-14 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                    <button className="absolute ltr:right-2 rtl:left-2 top-2 bottom-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-indigo-600/20">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-5 pt-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600 shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm font-bold leading-relaxed">
                                            مبنى الكلية، جامعة كفر الشيخ، مصر.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600 shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm font-bold">info@kfs-grad.edu.eg</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-12 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-start">
                        <p className="text-gray-500 font-bold text-sm">
                            &copy; {new Date().getFullYear()} كلية التربية النوعية - جامعة كفر الشيخ. جميع الحقوق محفوظة.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 text-xs font-black uppercase tracking-widest text-gray-400">
                            <a href="#" className="hover:text-indigo-600 transition-colors">سياسة الخصوصية</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">شروط الاستخدام</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">دعم المستخدمين</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

