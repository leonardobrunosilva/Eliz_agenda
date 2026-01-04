import React from 'react';
import { ViewState } from '../types';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    showNotifications?: boolean;
    onNotificationsClick?: () => void;
    showProfile?: boolean;
    onProfileClick?: () => void;
    subtitle?: string;
    rightIcon?: string;
    onRightClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    title = "Eliz & Rô",
    subtitle = "Salão de Beleza",
    showBack = false,
    onBack,
    showNotifications = false,
    onNotificationsClick,
    showProfile = false,
    onProfileClick,
    rightIcon,
    onRightClick
}) => {
    return (
        <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-primary/10 shadow-sm px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {showBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center size-10 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back</span>
                    </button>
                )}
                <div className={`flex flex-col ${!showBack ? 'pl-2' : ''}`}>
                    <h1 className="text-text-main dark:text-white font-cursive text-3xl leading-none tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <span className="text-[10px] uppercase tracking-[0.15em] text-primary mt-1 font-display font-bold">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {rightIcon && (
                    <button
                        onClick={onRightClick}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-sm text-slate-700 dark:text-white transition hover:text-primary"
                    >
                        <span className="material-symbols-outlined text-[24px]">{rightIcon}</span>
                    </button>
                )}
                {showNotifications && (
                    <button
                        onClick={onNotificationsClick}
                        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-sm text-slate-700 dark:text-white transition hover:text-primary"
                    >
                        <span className="material-symbols-outlined text-[24px]">notifications</span>
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-white dark:border-slate-800"></span>
                    </button>
                )}
                {showProfile && (
                    <div
                        onClick={onProfileClick}
                        className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm bg-slate-200 cursor-pointer hover:border-primary transition-all"
                    >
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmHuvJ6vVzcHSkt9xVxv7uAeWJgFSWPqLx_afjOQh0pA5QxreUPbF_jj4k8DRP4T8EOjgiBqipCAqHyXAGlh8t6pSpqzQzgW-T4oVyX5bGj-VijccwUvEeC_YLkIwmAUWPbsBQERnjs-ixUnoe183SlAapaL_r269ebiZfsQFVkYQKiMfStIIh2AweVXSHm_CjMn7qAdWgssZuhukeZSYaUmsBpZdmwDp_EKEIeH55OniNsI0FRsmYIZ-PDeA11MihOAUUyzGPQ3o"
                            alt="Foto de perfil"
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
