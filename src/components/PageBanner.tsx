import React from 'react';

interface PageBannerProps {
    image: string;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    gradient?: string;
}

export default function PageBanner({ image, title, subtitle, icon, gradient = 'from-indigo-700/85 to-purple-700/85' }: PageBannerProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl mb-8 shadow-lg group">
            {/* Background Image */}
            <img
                src={image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`}></div>
            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-64 h-64 rounded-full bg-purple-500/15 blur-2xl"></div>

            {/* Content */}
            <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-14 text-white">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl shadow-inner">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
                        {subtitle && (
                            <p className="mt-2 text-white/80 text-base sm:text-lg max-w-xl leading-relaxed">{subtitle}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
