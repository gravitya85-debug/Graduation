import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { askGemini } from '../lib/gemini';

export default function AIAssistant() {
    const [userQuestion, setUserQuestion] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    const handleAskAI = async (question?: string) => {
        const q = question || userQuestion;
        if (!q.trim()) return;

        setIsThinking(true);
        setUserQuestion("");

        try {
            const response = await askGemini(q);
            setAiResponse(response);
        } catch (error) {
            console.error("AI Error:", error);
            setAiResponse("عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة لاحقاً.");
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <section className="py-12 relative z-10 overflow-hidden">
            <div className="max-w-4xl mx-auto px-4">
                <div className="glass-panel p-8 md:p-12 rounded-[3rem] border-white/40 dark:border-gray-700/40 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Bot className="w-9 h-9 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">المساعد الذكي للخريجين</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">اطرح سؤالك وسأجيبك في الحال</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-bold border border-green-100 dark:border-green-900/30">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                متصل الآن
                            </div>
                        </div>

                        <div className="space-y-6 mb-12">
                            <AnimatePresence mode="wait">
                                {aiResponse ? (
                                    <motion.div
                                        key="response"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-8 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20 relative"
                                    >
                                        <div className="flex gap-4">
                                            <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                                <Bot className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed font-medium whitespace-pre-line">
                                                    {aiResponse}
                                                </p>
                                                <button 
                                                    onClick={() => setAiResponse("")}
                                                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                >
                                                    طرح سؤال آخر
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : isThinking ? (
                                    <motion.div
                                        key="thinking"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-4 p-8"
                                    >
                                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                        <p className="text-gray-500 font-bold text-lg animate-pulse">جاري تحليل سؤالك والبحث عن أفضل إجابة...</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="welcome"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {[
                                            "ما هي الأوراق المطلوبة للدراسات العليا؟",
                                            "ما هي الأوراق المطلوبة لاستلام الشهادة؟",
                                            "كيف أجد فرص عمل مناسبة؟",
                                            "كيف أوثق شهادة التخرج؟"
                                        ].map((suggest, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAskAI(suggest)}
                                                className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 text-right transition-all group"
                                            >
                                                <span className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold">{suggest}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                value={userQuestion}
                                onChange={(e) => setUserQuestion(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                                placeholder="اكتب سؤالك هنا..."
                                className="w-full p-6 md:p-8 pr-16 bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none transition-all text-lg font-bold shadow-inner"
                            />
                            <button
                                onClick={() => handleAskAI()}
                                disabled={!userQuestion.trim() || isThinking}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 active:scale-95"
                            >
                                <Send className="w-6 h-6 rotate-180" />
                            </button>
                        </div>
                        <p className="mt-6 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
                            <Sparkles className="w-4 h-4 inline-block ml-1 text-indigo-400" />
                            مدعوم بتقنيات الذكاء الاصطناعي لجامعة كفر الشيخ
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
