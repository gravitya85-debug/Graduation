
/**
 * AI Assistant Service using Cerebras (Ultra-fast & Free)
 */
export async function askGemini(prompt: string) {
    const apiKey = import.meta.env.VITE_CEREBRAS_API_KEY;

    if (!apiKey) {
        return "برجاء إضافة مفتاح Cerebras API (VITE_CEREBRAS_API_KEY) في ملف .env لتفعيل المساعد الذكي.";
    }

    try {
        console.log("Asking AI via Cerebras...");

        const systemPrompt = `
            أنت مساعد ذكي لمنصة خريجي كلية التربية النوعية بجامعة كفر الشيخ.
            مهمتك هي الإجابة على أسئلة الخريجين والطلاب حول الأوراق المطلوبة، التوثيق، فرص العمل، والخدمات التي تقدمها الكلية.
            
            معلومات هامة للالتزام بها:
            - الأوراق المطلوبة للدراسات العليا: (١. شهادة مؤهل، ٢. بيان التقديرات، ٣. شهادة حسن سير وسلوك، ٤. شهادة الميلاد، ٥. ٤ صور شخصية، ٦. صورة بطاقة، ٧. موافقة جهة العمل لو موظف).
            - الأوراق المطلوبة للخريجين لاستلام الشهادة: (١. عمل إخلاء طرف، ٢. بيان درجات، ٣. صورة شخصية، ٤. إفادة تخرج، ٥. شهادة ميلاد، ٦. دفع مصروفات الشهادة).
            - موقع الكلية الرسمي: https://kfs.edu.eg/specific/
            
            إرشادات الإجابة:
            1. يجب أن تكون الإجابة منظمة جداً ومهنية.
            2. استخدم اللغة العربية الفصحى المبسطة.
            3. استخدم أسطر جديدة ونقاط (مثل ١. ، ٢. أو •) لترتيب المتطلبات.
            4. إذا كان السؤال خارج نطاق الكلية أو الجامعة، اعتذر بلباقة ووجه المستخدم للأسئلة المتعلقة بالخريجين.
            5. اجعل الإجابة مختصرة ومفيدة.
        `;

        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                model: 'llama3.1-8b',
                temperature: 0.7,
                max_tokens: 1024,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `خطأ ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error: any) {
        console.error("Cerebras AI Error:", error);
        return `عذراً، حدث خطأ أثناء الاتصال بمساعد الذكاء الاصطناعي: ${error.message || 'خطأ غير معروف'}. يرجى التأكد من صحة مفتاح Cerebras API.`;
    }
}
