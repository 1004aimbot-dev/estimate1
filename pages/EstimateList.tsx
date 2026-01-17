import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { MOCK_ESTIMATES, CURRENCY_FORMAT } from '../constants';
import { EstimateStatus, Estimate } from '../types';

export const EstimateList: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'All' | 'Carpentry' | 'Tile'>('All');
    const [estimates, setEstimates] = useState<Estimate[]>([]);

    useEffect(() => {
        const savedEstimates = localStorage.getItem('estimates');
        if (savedEstimates) {
            setEstimates(JSON.parse(savedEstimates));
        } else {
            // Initialize with mock data if empty
            localStorage.setItem('estimates', JSON.stringify(MOCK_ESTIMATES));
            setEstimates(MOCK_ESTIMATES);
        }
    }, []);

    const filteredEstimates = estimates.filter(e => {
        if (filter === 'All') return true;
        return e.category === filter;
    });

    const getStatusBadge = (status: EstimateStatus) => {
        switch (status) {
            case EstimateStatus.Completed:
                return (
                    <div className="inline-flex items-center justify-center rounded-lg h-8 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 gap-1.5 text-xs font-bold tracking-wide">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span className="truncate">결제 완료</span>
                    </div>
                );
            case EstimateStatus.Sent:
                return (
                    <div className="inline-flex items-center justify-center rounded-lg h-8 px-3 bg-primary/10 dark:bg-primary/20 text-primary gap-1.5 text-xs font-bold tracking-wide">
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span className="truncate">전송 완료</span>
                    </div>
                );
            case EstimateStatus.Draft:
                return (
                    <div className="inline-flex items-center justify-center rounded-lg h-8 px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 gap-1.5 text-xs font-bold tracking-wide">
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        <span className="truncate">작성 중</span>
                    </div>
                );
        }
    };

    return (
        <Layout>
            <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2">
                <div className="flex items-center h-12 justify-between">
                    <div className="text-[#0d141b] dark:text-slate-100 flex size-12 shrink-0 items-center">
                        <span className="material-symbols-outlined text-2xl cursor-pointer">arrow_back_ios</span>
                    </div>
                    <div className="flex w-12 items-center justify-end gap-2">
                        <button className="flex cursor-pointer items-center justify-center rounded-lg h-12 w-12 bg-transparent text-[#0d141b] dark:text-slate-100">
                            <span className="material-symbols-outlined text-2xl">search</span>
                        </button>
                    </div>
                </div>
                <h1 className="text-[#0d141b] dark:text-slate-100 tracking-tight text-[28px] font-bold leading-tight mt-2">견적 내역</h1>
            </header>

            <nav className="flex gap-3 p-4 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setFilter('All')}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer transition-colors ${filter === 'All' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                    <p className="text-sm font-semibold leading-normal">전체</p>
                </button>
                <button
                    onClick={() => setFilter('Carpentry')}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 border cursor-pointer transition-colors ${filter === 'Carpentry' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">carpenter</span>
                    <p className="text-sm font-medium leading-normal">목공</p>
                </button>
                <button
                    onClick={() => setFilter('Tile')}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 border cursor-pointer transition-colors ${filter === 'Tile' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    <p className="text-sm font-medium leading-normal">타일</p>
                </button>
            </nav>

            <div className="flex flex-col gap-1 px-4 mt-2 pb-24">
                {filteredEstimates.map((est) => (
                    <div key={est.id} className="p-0 py-2 cursor-pointer" onClick={() => navigate(`/estimate/${est.id}`)}>
                        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-[2_2_0px] flex-col justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-primary text-[18px]">
                                            {est.category === 'Tile' ? 'grid_view' : est.category === 'Carpentry' ? 'carpenter' : 'inventory_2'}
                                        </span>
                                        <p className="text-primary text-xs font-bold uppercase tracking-wider">
                                            {est.category === 'Tile' ? '타일' : est.category === 'Carpentry' ? '목공' : '일반'}
                                        </p>
                                    </div>
                                    <p className="text-[#0d141b] dark:text-slate-100 text-lg font-bold leading-tight">{est.title}</p>
                                    <p className="text-[#4c739a] dark:text-slate-400 text-sm font-normal">고객: {est.customerName}</p>
                                    <p className="text-[#0d141b] dark:text-slate-200 text-base font-bold mt-2">
                                        {CURRENCY_FORMAT.format(est.price)}
                                    </p>
                                </div>
                                <div className="mt-4">
                                    {getStatusBadge(est.status)}
                                </div>
                            </div>
                            <div
                                className="w-28 h-28 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 bg-slate-200"
                                style={{ backgroundImage: `url(${est.imageUrl})` }}
                            />
                        </div>
                    </div>
                ))}
                {filteredEstimates.length === 0 && (
                    <div className="py-20 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">folder_off</span>
                        <p>해당 카테고리의 견적 내역이 없습니다.</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-24 right-6 z-40">
                <button 
                    onClick={() => navigate('/form')}
                    className="flex items-center justify-center gap-2 bg-primary text-white h-14 px-6 rounded-full shadow-lg shadow-primary/40 active:scale-95 transition-transform hover:bg-primary-dark"
                >
                    <span className="material-symbols-outlined font-bold">add</span>
                    <span className="font-bold tracking-wide text-base">새 견적서</span>
                </button>
            </div>
        </Layout>
    );
};