import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-900/75" onClick={onCancel}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-700/50 animate-fade-in-up">
                <p className="text-gray-900 dark:text-white font-bold text-lg mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">{t('admin.cancel')}</button>
                    <button onClick={onConfirm} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-95">{t('admin.confirmDeleteBtn')}</button>
                </div>
            </div>
        </div>
    );
}
