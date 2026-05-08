import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageBanner from '../../../components/PageBanner';
import AIAssistant from '../../../components/AIAssistant';

import { useAuth } from '../../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function FAQ() {
    const { t } = useTranslation();
    const { role } = useAuth();
    const [openIndex, setOpenIndex] = React.useState<number | null>(0);

    if (role === 'company') {
        return <Navigate to="/dashboard" replace />;
    }

    const faqs = [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q4'), a: t('faq.a4') },
        { q: t('faq.q5'), a: t('faq.a5') }
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 relative overflow-hidden">
            {/* Background elements to match landing */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern text-gray-400 dark:text-gray-600"></div>
            </div>

            <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                <PageBanner
                    image="/images/dashboard-bg.png"
                    title={t('faq.title')}
                    subtitle={t('faq.subtitle')}
                    icon={<HelpCircle className="w-7 h-7 text-white" />}
                />

                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel rounded-[2rem] border-white/20 dark:border-gray-700/30 overflow-hidden shadow-xl shadow-indigo-500/5 transition-all"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-8 text-right focus:outline-none hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
                            >
                                <span className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{faq.q}</span>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-indigo-600 text-white rotate-180' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </button>

                            <motion.div
                                initial={false}
                                animate={{
                                    height: openIndex === index ? 'auto' : 0,
                                    opacity: openIndex === index ? 1 : 0,
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="px-8 pb-8 pt-2">
                                    <div className="h-px bg-gray-100 dark:bg-gray-800 mb-6 opacity-50"></div>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-lg whitespace-pre-line">
                                        {faq.a}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Intelligent Assistant Section */}
                <div className="mt-20">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">لم تجد إجابة لسؤالك؟</h2>
                        <p className="text-gray-500 dark:text-gray-400">تواصل مع مساعدنا الذكي للحصول على إجابات فورية ودقيقة</p>
                    </div>
                    <AIAssistant />
                </div>
            </div>
        </div>
    );
}
