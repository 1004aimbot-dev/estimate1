
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_ESTIMATES, CURRENCY_FORMAT } from '../constants';
import { EstimateItemDetail, Estimate, EstimateStatus } from '../types';

export const EstimateDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Load estimates from localStorage to handle updates
    const [allEstimates, setAllEstimates] = useState<Estimate[]>(() => {
        const saved = localStorage.getItem('estimates');
        return saved ? JSON.parse(saved) : MOCK_ESTIMATES;
    });

    // Find the specific estimate
    const estimate = useMemo(() => {
        return allEstimates.find((e) => e.id === id) || allEstimates[0];
    }, [id, allEstimates]);

    // Items list (using estimate's items or fallback to mock)
    const items: EstimateItemDetail[] = estimate.items || [
        { id: '1', name: '영림 도어 세트 (ABS)', description: '문틀, 문짝, 경첩, 손잡이 세트', unit: 'set', quantity: 33, materialCost: 248333, laborCost: 0 },
        { id: '2', name: '편백나무 루바', description: '무절, 2400mm x 100mm (8pcs)', unit: 'bundle', quantity: 333, materialCost: 45333, laborCost: 0 },
        { id: '3', name: '600각 포세린 타일 시공', description: '거실/주방 바닥, 졸리컷 마감 별도', unit: 'm2', quantity: 3332.99, materialCost: 78333, laborCost: 0 },
    ];

    const finalPrice = Math.floor(estimate.price / 1000) * 1000;
    const contractPrice = Math.floor(finalPrice * 0.3 / 1000) * 1000;
    const middlePrice = Math.floor(finalPrice * 0.4 / 1000) * 1000;
    const balancePrice = finalPrice - contractPrice - middlePrice;

    const bankInfo = estimate.bankInfo || {
        bankName: '신한은행',
        accountNumber: '110-123-456789',
        accountHolder: 'Ucraft'
    };

    // State Change Logic: Draft -> Sent -> Completed -> Back to Home
    const updateStatus = (newStatus: EstimateStatus) => {
        const updated = allEstimates.map(e => 
            e.id === id ? { ...e, status: newStatus } : e
        );
        setAllEstimates(updated);
        localStorage.setItem('estimates', JSON.stringify(updated));
        
        if (newStatus === EstimateStatus.Completed) {
            alert('결제가 완료되었습니다. 초기 화면으로 돌아갑니다.');
            navigate('/');
        } else {
            const statusName = newStatus === EstimateStatus.Sent ? '전송 완료' : '결제 완료';
            alert(`상태가 [${statusName}]로 변경되었습니다.`);
        }
    };

    const getCategoryDisplayName = (category: string) => {
        switch (category) {
            case 'Tile': return '타일 공사';
            case 'Carpentry': return '목공 공사';
            default: return '종합 공사';
        }
    };

    const EstimateContent = () => (
        <div className="bg-white text-slate-900">
            {/* Top Section: Logo & Supplier Info */}
            <div className="flex justify-between items-start mb-6">
                <div className="pt-2 pl-1">
                    <div className="w-48 h-24 flex items-center justify-start overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1635405074683-96d6921a2a2c?q=80&w=400&auto=format&fit=crop" 
                            alt="U CRAFT INTERIOR" 
                            className="w-full h-full object-contain"
                            style={{ filter: 'brightness(1.05) contrast(1.1)' }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<div class="flex flex-col"><span class="text-2xl font-black text-slate-800 tracking-tighter">U CRAFT</span><span class="text-[10px] font-bold text-slate-400 tracking-[0.2em] -mt-1">INTERIOR DESIGN</span></div>';
                                }
                            }}
                        />
                    </div>
                </div>
                
                <div className="flex text-[11px] border border-slate-400">
                    <div className="w-6 bg-slate-50 border-r border-slate-400 flex items-center justify-center font-bold p-0.5 text-center">
                        <span style={{ writingMode: 'vertical-rl', textOrientation: 'upright', letterSpacing: '4px' }}>공급자</span>
                    </div>
                    <div className="flex flex-col w-64 bg-white">
                        <div className="flex border-b border-slate-400 h-8 items-center px-2">
                            <div className="w-16 font-bold text-slate-600">등록번호</div>
                            <div className="flex-1">123-45-67890</div>
                        </div>
                        <div className="flex border-b border-slate-400 h-8 items-center px-2">
                            <div className="w-16 font-bold text-slate-600">상 호</div>
                            <div className="flex-1 font-bold">{estimate.author || 'Ucraft'}</div>
                        </div>
                        <div className="flex border-b border-slate-400 h-8 items-center px-2">
                            <div className="w-16 font-bold text-slate-600">대표자</div>
                            <div className="flex-1 flex justify-between font-bold">
                                <span>홍 길 동</span>
                                <span className="text-red-600 border border-red-600 rounded-sm w-5 h-5 flex items-center justify-center text-[10px] font-bold">(인)</span>
                            </div>
                        </div>
                        <div className="flex h-8 items-center px-2">
                            <div className="w-16 font-bold text-slate-600">사업장</div>
                            <div className="flex-1 text-[10px] leading-tight">서울시 강남구 테헤란로 123</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mb-8"><h1 className="text-3xl font-extrabold tracking-[2rem] text-[#1a1a1a] inline-block border-b-2 border-slate-800 pb-3 pl-8">견 적 서</h1></div>

            <div className="mb-6 pl-2 space-y-2 bg-white">
                <div className="flex items-center text-[13px] h-6 py-0">
                    <span className="w-20 font-bold text-slate-600 shrink-0">시 공 장 소 :</span>
                    <span className="text-slate-800 font-medium ml-2">{estimate.constructionPlace || '정보 미기재'}</span>
                </div>
                <div className="flex items-center text-[13px] h-6 py-0">
                    <span className="w-20 font-bold text-slate-600 shrink-0">견 적 일 자 :</span>
                    <span className="text-slate-800 font-medium ml-2">{estimate.date}</span>
                </div>
            </div>

            <div className="mb-6 w-full border-t-2 border-primary border-b border-primary text-[12px] bg-white">
                <div className="flex w-full bg-white text-primary h-10 border-b border-primary/50 items-center font-bold py-0">
                    <div className="w-[40%] flex items-center justify-center h-full">품목/내용</div>
                    <div className="w-[10%] flex items-center justify-center border-l border-slate-200 h-full">규격</div>
                    <div className="w-[10%] flex items-center justify-center border-l border-slate-200 h-full">수량</div>
                    <div className="w-[20%] flex items-center justify-center border-l border-slate-200 h-full">단가</div>
                    <div className="w-[20%] flex items-center justify-center border-l border-slate-200 h-full">금액</div>
                </div>

                <div className="flex w-full bg-white text-slate-800 border-b border-slate-200 h-10 items-center justify-center font-bold py-0">
                    [{getCategoryDisplayName(estimate.category)}]
                </div>

                {items.map((item, idx) => (
                    <div key={idx} className="flex w-full bg-white text-slate-700 border-b border-slate-200 min-h-[48px] items-stretch">
                        <div className="w-[40%] flex flex-col justify-center items-center px-2 py-3">
                            <span className="font-bold text-slate-900 block text-[12px] text-center leading-tight">{item.name}</span>
                            {item.description && <span className="text-[10px] text-slate-500 block mt-1.5 text-center leading-tight scale-95">{item.description}</span>}
                        </div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 px-1 text-[11px] py-0">{item.unit}</div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 font-medium px-1 text-[11px] py-0">{item.quantity}</div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-3 text-[11px] tracking-tight py-0">{CURRENCY_FORMAT.format(item.materialCost + item.laborCost).replace('₩', '')}</div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-3 font-bold tracking-tight text-slate-900 text-[11px] py-0">{CURRENCY_FORMAT.format((item.materialCost + item.laborCost) * item.quantity).replace('₩', '')}</div>
                    </div>
                ))}
                {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex w-full bg-white border-b border-slate-200 h-10 items-center py-0">
                        <div className="w-[40%] h-full"></div><div className="w-[10%] border-l border-slate-100 h-full"></div><div className="w-[10%] border-l border-slate-100 h-full"></div><div className="w-[20%] border-l border-slate-100 h-full"></div><div className="w-[20%] border-l border-slate-100 h-full"></div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 items-start bg-white">
                <div className="flex-[4] space-y-4 bg-white">
                    <div>
                        <h4 className="text-[12px] font-bold text-slate-700 mb-1.5">[공사 대금 지급 조건]</h4>
                        <div className="w-full border border-slate-200 text-[11px] bg-white">
                            <div className="flex border-b border-slate-200 h-8 bg-white items-center py-0 px-2">
                                <div className="w-18 text-slate-500 font-bold flex items-center justify-center h-full">계약금(30%)</div>
                                <div className="flex-1 pr-2 font-bold text-slate-800 flex items-center justify-end h-full">{CURRENCY_FORMAT.format(contractPrice)}</div>
                            </div>
                            <div className="flex border-b border-slate-200 h-8 bg-white items-center py-0 px-2">
                                <div className="w-18 text-slate-500 font-bold flex items-center justify-center h-full">중도금(40%)</div>
                                <div className="flex-1 pr-2 font-bold text-slate-800 flex items-center justify-end h-full">{CURRENCY_FORMAT.format(middlePrice)}</div>
                            </div>
                            <div className="flex h-9 bg-white items-center py-0 px-2">
                                <div className="w-18 text-primary font-bold flex items-center justify-center h-full">잔 금(30%)</div>
                                <div className="flex-1 pr-2 font-black text-primary text-[12px] flex items-center justify-end h-full">{CURRENCY_FORMAT.format(balancePrice)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-[6] flex flex-col h-full gap-3 bg-white">
                    <div className="bg-white border-2 border-[#0052cc] text-[#0052cc] rounded-lg p-3 text-right flex flex-col justify-center min-h-[104px] py-4 shadow-sm">
                        <p className="text-xs font-bold opacity-90 mb-1">총 합계 (VAT 포함 / 원단위 절사)</p>
                        <p className="text-2xl font-black tracking-tight leading-normal">{CURRENCY_FORMAT.format(finalPrice)}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] min-h-screen flex flex-col items-center">
            {/* Header with circled X Button */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center p-4 justify-between max-w-[480px] mx-auto">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate('/')} 
                            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[#0d141b] dark:text-white">close</span>
                        </button>
                        <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight">견적서 상세 내역</h2>
                    </div>
                </div>
            </div>

            <main className="pt-20 pb-40 px-0 w-full max-w-[595px] overflow-y-auto">
                <div className="bg-white shadow-2xl min-h-[842px] px-14 py-10 mb-8 flex flex-col relative text-slate-900 mx-auto w-full box-border">
                    <EstimateContent />
                </div>
            </main>

            {/* Fixed Bottom Action Bar: Logic implemented for Draft -> Sent -> Completed */}
            <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 pb-8 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <div className="flex gap-3">
                    {estimate.status === EstimateStatus.Draft && (
                        <button 
                            onClick={() => updateStatus(EstimateStatus.Sent)}
                            className="flex-1 h-14 bg-primary text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined">send</span>
                            전송 처리
                        </button>
                    )}
                    {estimate.status === EstimateStatus.Sent && (
                        <button 
                            onClick={() => updateStatus(EstimateStatus.Completed)}
                            className="flex-1 h-14 bg-green-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            결제 완료
                        </button>
                    )}
                    {estimate.status === EstimateStatus.Completed && (
                        <div className="flex-1 h-14 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold rounded-2xl flex items-center justify-center gap-2 border border-green-200 dark:border-green-800">
                            <span className="material-symbols-outlined">verified</span>
                            결제 완료됨
                        </div>
                    )}
                    <button 
                        onClick={() => navigate('/form', { state: { estimate } })}
                        className="size-14 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
