import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslation },
            ar: { translation: arTranslation }
        },
        // Set Arabic as default language
        fallbackLng: 'ar',

        // Automatically use AR if no detector logic overrides it
        lng: 'ar',

        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
