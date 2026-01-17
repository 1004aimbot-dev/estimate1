
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CURRENCY_FORMAT } from '../constants';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const estimateData = location.state?.estimateData;

    // Default data from state
    const data = estimateData || {
        title: '새 견적서',
        price: 0,
        date: new Date().toLocaleDateString(),
        customerName: '고객',
        author: 'Ucraft'
    };

    const finalPrice = Math.floor(data.price / 1000) * 1000;

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col max-w-[480px] mx-auto relative">
            <div className="flex items-center p-4 justify-between">
                <span onClick={() => navigate('/')} className="material-symbols-outlined cursor-pointer text-[#0d141b] dark:text-white">close</span>
            </div>

            <main className="flex-1 flex flex-col items-center px-6 pt-4 pb-12">
                <div className="relative w-full h-56 flex items-center justify-center mb-6">
                    <div className="relative z-10 w-48 h-48 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center border-8 border-primary/10">
                        <div className="w-36 h-36 bg-primary rounded-full flex items-center justify-center shadow-inner animate-fade-in">
                            <span className="material-symbols-outlined text-white text-7xl font-bold">check_circle</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 tracking-tight text-[#0d141b] dark:text-white">작성이 완료되었습니다!</h1>
                    <p className="text-slate-500 dark:text-slate-400">견적서가 안전하게 저장되었습니다.</p>
                </div>

                <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 text-sm font-medium">견적명</span>
                        <span className="font-bold text-slate-900 dark:text-white">{data.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm font-medium">최종 견적 금액</span>
                        <span className="text-primary text-xl font-black">{CURRENCY_FORMAT.format(finalPrice)}</span>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <button 
                        onClick={() => navigate('/')} 
                        className="h-15 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                    >
                        홈으로 이동
                    </button>
                </div>
            </main>
        </div>
    );
};
