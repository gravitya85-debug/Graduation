import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface TagInputProps {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
    addButtonText?: string;
}

export default function TagInput({ tags, onTagsChange, placeholder = 'Add...', maxTags = 15, addButtonText }: TagInputProps) {
    const { t } = useTranslation();
    const [input, setInput] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmedInput = input.trim();
        if (trimmedInput && !tags.includes(trimmedInput) && tags.length < maxTags) {
            onTagsChange([...tags, trimmedInput]);
            setInput('');
        }
    };

    const removeTag = (index: number) => {
        onTagsChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2 p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all min-h-[52px] items-center shadow-sm">
                <AnimatePresence>
                    {tags.map((tag, index) => (
                        <motion.span
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold border border-indigo-200 dark:border-indigo-800/50"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="hover:text-indigo-500 dark:hover:text-white transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>

                <div className="flex-1 min-w-[200px] flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-2"
                    />
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); addTag(); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 whitespace-nowrap flex items-center gap-1 shadow-sm shadow-indigo-600/20"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {addButtonText || t('common.add') || 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
}
