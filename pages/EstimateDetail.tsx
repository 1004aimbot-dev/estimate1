
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_ESTIMATES, CURRENCY_FORMAT } from '../constants';
import { EstimateItemDetail, Estimate, EstimateStatus } from '../types';

export const EstimateDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [allEstimates, setAllEstimates] = useState<Estimate[]>(() => {
        const saved = localStorage.getItem('estimates');
        return saved ? JSON.parse(saved) : MOCK_ESTIMATES;
    });

    const estimate = useMemo(() => {
        return allEstimates.find((e) => e.id === id) || allEstimates[0];
    }, [id, allEstimates]);

    const defaultSupplier = useMemo(() => {
        const saved = localStorage.getItem('ucraft_default_supplier');
        return saved ? JSON.parse(saved) : { name: 'Y2K Interior', rep: '', regNo: '', address: '' };
    }, []);

    const items: EstimateItemDetail[] = estimate.items || [];
    const finalPrice = Math.floor(estimate.price / 1000) * 1000;
    const contractPrice = Math.floor(finalPrice * 0.3 / 1000) * 1000;
    const middlePrice = Math.floor(finalPrice * 0.4 / 1000) * 1000;
    const balancePrice = finalPrice - contractPrice - middlePrice;

    const updateStatus = (newStatus: EstimateStatus) => {
        const updated = allEstimates.map(e => e.id === id ? { ...e, status: newStatus } : e);
        setAllEstimates(updated);
        localStorage.setItem('estimates', JSON.stringify(updated));
        if (newStatus === EstimateStatus.Completed) { alert('결제가 완료되었습니다.'); navigate('/'); }
    };

    const EstimateContent = () => (
        <div className="bg-white text-slate-900">
            <div className="flex justify-between items-start mb-6">
                <div className="pt-2 pl-1 flex flex-col items-start mb-4">
                    <div className="inline-block relative">
                        <div className="flex items-baseline gap-1 whitespace-nowrap">
                            <span className="text-2xl font-black text-primary tracking-tighter">Y2K</span>
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">INTERIOR</span>
                        </div>
                        <div className="w-full flex justify-between text-[7px] font-bold text-slate-400 uppercase mt-0.5">
                            {"PROFESSIONAL INTERIOR DESIGN".split("").map((char, i) => (
                                <span key={i} className="leading-none">{char === " " ? "\u00A0" : char}</span>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="flex text-[11px] border border-slate-400">
                    <div className="w-6 bg-slate-50 border-r border-slate-400 flex items-center justify-center font-bold p-0.5 text-center">
                        <span style={{ writingMode: 'vertical-rl', textOrientation: 'upright', letterSpacing: '4px' }}>공급자</span>
                    </div>
                    <div className="flex flex-col w-64 bg-white">
                        <div className="flex border-b border-slate-400 h-8 items-center px-0">
                            <div className="w-16 h-full font-bold text-slate-600 flex items-center justify-center border-r border-slate-400">등록번호</div>
                            <div className="flex-1 text-center font-bold tracking-wider px-2">{estimate.supplierRegNo || defaultSupplier.regNo || '000-00-00000'}</div>
                        </div>
                        <div className="flex border-b border-slate-400 h-8 items-center px-0">
                            <div className="w-16 h-full font-bold text-slate-600 flex items-center justify-center border-r border-slate-400">상 호</div>
                            <div className="flex-1 font-bold text-center px-2">{estimate.supplierName || estimate.author || defaultSupplier.name || 'Y2K Interior'}</div>
                        </div>
                        <div className="flex border-b border-slate-400 h-8 items-center px-0">
                            <div className="w-16 h-full font-bold text-slate-600 flex items-center justify-center border-r border-slate-400">대표자</div>
                            <div className="flex-1 flex justify-between px-4 font-bold items-center">
                                <span className="flex-1 text-center">{estimate.supplierRep || defaultSupplier.rep || '(대표자)'}</span>
                                <span className="text-red-600 border border-red-600 rounded-sm w-5 h-5 flex items-center justify-center text-[10px] shrink-0">(인)</span>
                            </div>
                        </div>
                        <div className="flex h-8 items-center px-0">
                            <div className="w-16 h-full font-bold text-slate-600 flex items-center justify-center border-r border-slate-400">사업장</div>
                            <div className="flex-1 text-[9px] leading-tight text-center px-2 flex items-center justify-center">{estimate.supplierAddress || defaultSupplier.address || '(사업장 주소 미입력)'}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center mb-8"><h1 className="text-3xl font-extrabold tracking-[2rem] text-[#1a1a1a] border-b-2 border-slate-800 pb-3 pl-8 inline-block">견 적 서</h1></div>
            <div className="mb-6 pl-2 space-y-2">
                <div className="flex items-center text-[13px] h-6"><span className="w-20 font-bold text-slate-600">견적의뢰 :</span><span className="font-bold text-base text-slate-900 ml-2">{estimate.customerName} 귀하</span></div>
                <div className="flex items-center text-[13px] h-6"><span className="w-20 font-bold text-slate-600">시공장소 :</span><span className="text-slate-800 font-medium ml-2">{estimate.constructionPlace || '정보 미기재'}</span></div>
                <div className="flex items-center text-[13px] h-6"><span className="w-20 font-bold text-slate-600">견적일자 :</span><span className="text-slate-800 font-medium ml-2">{estimate.date}</span></div>
            </div>
            <div className="mb-6 w-full border-t-2 border-primary border-b border-primary text-[12px] bg-white">
                <div className="flex w-full text-primary h-10 border-b border-primary/50 items-center font-bold">
                    <div className="w-[40%] text-center">품목/내용</div><div className="w-[10%] border-l border-slate-200 text-center">규격</div><div className="w-[10%] border-l border-slate-200 text-center">수량</div><div className="w-[20%] border-l border-slate-200 text-center">단가</div><div className="w-[20%] border-l border-slate-200 text-center">금액</div>
                </div>
                {items.map((item, idx) => (
                    <div key={idx} className="flex w-full text-slate-700 border-b border-slate-200 min-h-[48px] items-stretch">
                        <div className="w-[40%] flex flex-col justify-center items-center px-2 py-3"><span className="font-bold text-slate-900 text-[12px] text-center">{item.name}</span>{item.description && <span className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{item.description}</span>}</div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 px-1 text-[11px]">{item.unit}</div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 font-medium px-1 text-[11px]">{item.quantity}</div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-3 text-[11px] tracking-tight">{CURRENCY_FORMAT.format(item.materialCost + item.laborCost).replace('₩', '')}</div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-3 font-bold tracking-tight text-slate-900 text-[11px]">{CURRENCY_FORMAT.format((item.materialCost + item.laborCost) * item.quantity).replace('₩', '')}</div>
                    </div>
                ))}
            </div>
            <div className="flex gap-4 items-start bg-white">
                <div className="flex-[4] space-y-4">
                    <div>
                        <h4 className="text-[12px] font-bold text-slate-700 mb-1.5">[대금 지급 조건]</h4>
                        <div className="w-full border border-slate-200 text-[10px]">
                            <div className="flex border-b border-slate-200 h-8 items-center px-2"><div className="w-18 text-slate-500 font-bold">계약금(30%)</div><div className="flex-1 text-right font-bold pr-1">{CURRENCY_FORMAT.format(contractPrice)}</div></div>
                            <div className="flex border-b border-slate-200 h-8 items-center px-2"><div className="w-18 text-slate-500 font-bold">중도금(40%)</div><div className="flex-1 text-right font-bold pr-1">{CURRENCY_FORMAT.format(middlePrice)}</div></div>
                            <div className="flex h-9 items-center px-2"><div className="w-18 text-primary font-bold">잔 금</div><div className="flex-1 text-right font-black text-primary text-[11px] pr-1">{CURRENCY_FORMAT.format(balancePrice)}</div></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[12px] font-bold text-slate-700 mb-1.5">[입금 계좌]</h4>
                        <div className="w-full border border-slate-200 text-[10px] p-2 space-y-1"><p className="flex justify-between"><span>은행: {estimate.bankInfo?.bankName}</span> <span>예금주: {estimate.bankInfo?.accountHolder}</span></p><p className="font-bold">계좌: {estimate.bankInfo?.accountNumber}</p></div>
                    </div>
                </div>
                <div className="flex-[6] bg-white border-2 border-[#0052cc] text-[#0052cc] rounded-lg p-3 text-right flex flex-col justify-center min-h-[104px] py-4"><p className="text-xs font-bold opacity-90 mb-1">총 합계 (VAT 포함)</p><p className="text-2xl font-black tracking-tight">{CURRENCY_FORMAT.format(finalPrice)}</p></div>
            </div>
        </div>
    );

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] min-h-screen flex flex-col items-center">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"><div className="flex items-center p-4 justify-between max-w-[480px] mx-auto"><div className="flex items-center gap-2"><button onClick={() => navigate('/')} className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button><h2 className="text-lg font-bold">견적서 상세</h2></div><button onClick={() => navigate('/form', { state: { estimate } })} className="text-primary font-bold">수정</button></div></div>
            <main className="pt-20 pb-40 px-0 w-full max-w-[595px]"><div className="bg-white shadow-2xl min-h-[842px] px-14 py-10 mb-8 flex flex-col relative text-slate-900 mx-auto w-full box-border"><EstimateContent /></div></main>
            <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 p-4 pb-8 z-50"><div className="flex gap-3">
                    {estimate.status === EstimateStatus.Draft ? (<button onClick={() => updateStatus(EstimateStatus.Sent)} className="flex-1 h-14 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg"><span className="material-symbols-outlined">send</span>전송 처리</button>) : estimate.status === EstimateStatus.Sent ? (<button onClick={() => updateStatus(EstimateStatus.Completed)} className="flex-1 h-14 bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg"><span className="material-symbols-outlined">check_circle</span>결제 완료</button>) : (<div className="flex-1 h-14 bg-green-50 text-green-700 font-bold rounded-2xl flex items-center justify-center gap-2 border border-green-200"><span className="material-symbols-outlined">verified</span>결제 완료됨</div>)}
            </div></div>
        </div>
    );
};
