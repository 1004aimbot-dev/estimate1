import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showNav = true }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getNavClass = (path: string) => {
        const isActive = location.pathname === path;
        return isActive 
            ? "flex flex-col items-center gap-1 text-primary cursor-pointer" 
            : "flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 cursor-pointer";
    };

    const getIconClass = (path: string, iconName: string) => {
         const isActive = location.pathname === path;
         // Material symbols filled style if active
         return isActive 
            ? "material-symbols-filled text-[24px]" 
            : "material-symbols-outlined text-[24px]";
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark max-w-[480px] mx-auto shadow-2xl overflow-hidden">
            <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {children}
            </main>

            {showNav && (
                <div className="fixed bottom-0 max-w-[480px] w-full bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 pb-4 h-20 z-50">
                    <div className={getNavClass('/')} onClick={() => navigate('/')}>
                        <span className={getIconClass('/', 'history')}>history</span>
                        <span className="text-[11px] font-medium">견적 내역</span>
                    </div>
                    <div className={getNavClass('/library')} onClick={() => navigate('/library')}>
                         <span className={getIconClass('/library', 'grid_view')}>grid_view</span>
                        <span className="text-[11px] font-medium">라이브러리</span>
                    </div>
                    <div className={getNavClass('/report')} onClick={() => navigate('/report')}>
                        <span className="material-symbols-outlined text-[24px]">analytics</span>
                        <span className="text-[11px] font-medium">리포트</span>
                    </div>
                    <div className={getNavClass('/settings')} onClick={() => navigate('/settings')}>
                        <span className="material-symbols-outlined text-[24px]">settings</span>
                        <span className="text-[11px] font-medium">설정</span>
                    </div>
                </div>
            )}
        </div>
    );
};
