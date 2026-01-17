
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { EstimateItemDetail, LibraryItem, Estimate, EstimateStatus, EstimateTemplate } from '../types';
import { CURRENCY_FORMAT, MOCK_LIBRARY, MOCK_ESTIMATES, ESTIMATE_TEMPLATES } from '../constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const EstimateForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const initialData = location.state?.estimate;
    const selectedLibraryItem = location.state?.selectedLibraryItem as LibraryItem | undefined;
    const selectedLibraryItems = location.state?.selectedLibraryItems as LibraryItem[] | undefined;

    const normalizeUnit = (u: string | undefined) => {
        if (!u) return 'py';
        if (u === 'm²') return 'm2';
        return u;
    };
    
    // --- Supplier Info States ---
    const [supplierRegNo, setSupplierRegNo] = useState(initialData?.supplierRegNo || '');
    const [supplierName, setSupplierName] = useState(initialData?.supplierName || '');
    const [supplierRep, setSupplierRep] = useState(initialData?.supplierRep || '');
    const [supplierAddress, setSupplierAddress] = useState(initialData?.supplierAddress || '');

    // Load Default Supplier Info on Mount
    useEffect(() => {
        if (!initialData) {
            const savedSupplier = localStorage.getItem('ucraft_default_supplier');
            if (savedSupplier) {
                const parsed = JSON.parse(savedSupplier);
                setSupplierRegNo(parsed.regNo || '');
                setSupplierName(parsed.name || 'Y2K Interior');
                setSupplierRep(parsed.rep || '');
                setSupplierAddress(parsed.address || '');
            } else {
                setSupplierName('Y2K Interior');
            }
        }
    }, [initialData]);

    const saveSupplierAsDefault = () => {
        const info = {
            regNo: supplierRegNo,
            name: supplierName,
            rep: supplierRep,
            address: supplierAddress
        };
        localStorage.setItem('ucraft_default_supplier', JSON.stringify(info));
    };

    // --- Form Input States ---
    const [title, setTitle] = useState(initialData?.title || '');
    const [customerName, setCustomerName] = useState(initialData?.customerName || '');
    const [customerPlace, setCustomerPlace] = useState(initialData?.constructionPlace || '');
    
    const [name, setName] = useState(selectedLibraryItem?.name || '');
    const [description, setDescription] = useState(selectedLibraryItem?.description || '');
    const [unit, setUnit] = useState(normalizeUnit(selectedLibraryItem?.unit));
    const [quantity, setQuantity] = useState<string>('');
    const [materialCost, setMaterialCost] = useState<string>(selectedLibraryItem?.price?.toString() || '');
    const [laborCost, setLaborCost] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');

    const [bankName, setBankName] = useState(initialData?.bankInfo?.bankName || '신한은행');
    const [accountNumber, setAccountNumber] = useState(initialData?.bankInfo?.accountNumber || '');
    const [accountHolder, setAccountHolder] = useState(initialData?.bankInfo?.accountHolder || '');

    const [items, setItems] = useState<EstimateItemDetail[]>(initialData?.items || []);
    const [suggestions, setSuggestions] = useState<LibraryItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [libraryCategory, setLibraryCategory] = useState<string>('전체');
    const [librarySearch, setLibrarySearch] = useState('');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const totalEstimatedPrice = useMemo(() => {
        return items.reduce((sum, item) => sum + ((item.materialCost + item.laborCost) * item.quantity), 0);
    }, [items]);

    const finalPrice = Math.floor(totalEstimatedPrice / 1000) * 1000;
    const contractPrice = Math.floor(finalPrice * 0.3 / 1000) * 1000;
    const middlePrice = Math.floor(finalPrice * 0.4 / 1000) * 1000;
    const balancePrice = finalPrice - contractPrice - middlePrice;
    const todayDate = new Date().toLocaleDateString();

    useEffect(() => {
        if (selectedLibraryItems && selectedLibraryItems.length > 0) {
            const newItems: EstimateItemDetail[] = selectedLibraryItems.map((item, index) => ({
                id: Date.now().toString() + '-' + index,
                name: item.name,
                description: item.description,
                unit: normalizeUnit(item.unit),
                quantity: 1,
                materialCost: item.price,
                laborCost: 0,
            }));
            setItems(prev => [...prev, ...newItems]);
            window.history.replaceState({}, '');
        }
        if (selectedLibraryItem) {
            setName(selectedLibraryItem.name);
            setMaterialCost(selectedLibraryItem.price.toString());
            setUnit(normalizeUnit(selectedLibraryItem.unit));
            setDescription(selectedLibraryItem.description);
            window.history.replaceState({}, '');
        }
    }, [selectedLibraryItems, selectedLibraryItem]);

    const handleAddItem = () => {
        if (!name.trim()) return alert('품목명을 입력해주세요.');
        if (!quantity || parseFloat(quantity) <= 0) return alert('유효한 수량을 입력해주세요.');

        const newItem: EstimateItemDetail = {
            id: Date.now().toString(),
            name,
            description,
            unit,
            quantity: parseFloat(quantity),
            materialCost: parseFloat(materialCost) || 0,
            laborCost: parseFloat(laborCost) || 0,
            imageUrl: imageUrl || undefined,
        };
        setItems((prev) => [...prev, newItem]);
        setName(''); setDescription(''); setQuantity(''); setMaterialCost(''); setLaborCost(''); setImageUrl('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelectTemplate = (template: EstimateTemplate) => {
        const templateItems: EstimateItemDetail[] = template.items.map((item, index) => ({
            ...item,
            id: `template-${Date.now()}-${index}`
        }));
        setItems(prev => [...prev, ...templateItems]);
        setIsTemplateModalOpen(false);
        if (!title) setTitle(template.name);
    };

    const handleLibraryItemSelect = (item: LibraryItem) => {
        setName(item.name);
        setMaterialCost(item.price.toString());
        setUnit(normalizeUnit(item.unit));
        setDescription(item.description);
        setIsLibraryModalOpen(false);
    };

    const filteredLibraryItems = useMemo(() => {
        return MOCK_LIBRARY.filter(item => {
            const matchesCategory = libraryCategory === '전체' || item.category === libraryCategory;
            const matchesSearch = item.name.toLowerCase().includes(librarySearch.toLowerCase()) || 
                                item.description.toLowerCase().includes(librarySearch.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [libraryCategory, librarySearch]);

    const handleFinalSave = () => {
        if (!title.trim() || !customerName.trim()) return alert('견적명과 고객명을 입력해주세요.');
        saveSupplierAsDefault();
        const newEstimate: Estimate = {
            id: initialData?.id || Date.now().toString(),
            title: title || '새 견적서',
            customerName: customerName,
            supplierRegNo,
            supplierName: supplierName || 'Y2K Interior',
            supplierRep,
            supplierAddress,
            constructionPlace: customerPlace,
            price: totalEstimatedPrice,
            category: 'General', 
            status: initialData?.status || EstimateStatus.Draft,
            imageUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
            date: todayDate,
            items: items, 
            bankInfo: { bankName, accountNumber, accountHolder }
        };
        const savedEstimates = localStorage.getItem('estimates');
        let currentEstimates = savedEstimates ? JSON.parse(savedEstimates) : MOCK_ESTIMATES;
        if (initialData) {
            currentEstimates = currentEstimates.map((e: Estimate) => e.id === initialData.id ? newEstimate : e);
        } else {
            currentEstimates = [newEstimate, ...currentEstimates];
        }
        localStorage.setItem('estimates', JSON.stringify(currentEstimates));
        navigate('/success', { state: { estimateData: newEstimate } });
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('preview-pdf-container');
        if (!element) return;
        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`견적서_${customerName || '고객'}_${todayDate}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDF 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const CommonPaymentInfo = () => (
        <div className="flex gap-4 items-start">
            <div className="flex-[4] space-y-4">
                <div>
                    <h4 className="text-[12px] font-bold text-slate-700 mb-1.5">[공사 대금 지급 조건]</h4>
                    <div className="w-full border border-slate-200 text-[11px]">
                        <div className="flex border-b border-slate-200 h-8 bg-white items-center py-0 px-2">
                            <div className="w-18 text-slate-500 font-bold flex items-center justify-center h-full">계약금(30%)</div>
                            <div className="flex-1 font-bold text-slate-800 flex items-center justify-end h-full">{CURRENCY_FORMAT.format(contractPrice)}</div>
                        </div>
                        <div className="flex border-b border-slate-200 h-8 bg-white items-center py-0 px-2">
                            <div className="w-18 text-slate-500 font-bold flex items-center justify-center h-full">중도금(40%)</div>
                            <div className="flex-1 font-bold text-slate-800 flex items-center justify-end h-full">{CURRENCY_FORMAT.format(middlePrice)}</div>
                        </div>
                        <div className="flex h-9 bg-white items-center py-0 px-2">
                            <div className="w-18 text-primary font-bold flex items-center justify-center h-full text-[10px]">잔 금</div>
                            <div className="flex-1 font-black text-primary text-[12px] flex items-center justify-end h-full">{CURRENCY_FORMAT.format(balancePrice)}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-[12px] font-bold text-slate-700 mb-1.5">[입금 계좌 정보]</h4>
                    <div className="w-full border border-slate-200 text-[11px] rounded-sm p-3 bg-white space-y-2">
                        <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 w-12 font-medium">은행명</span>
                            <span className="font-bold text-slate-800">{bankName}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 w-12 font-medium">계좌</span>
                            <span className="font-bold text-slate-800">{accountNumber}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 w-12 font-medium">예금주</span>
                            <span className="font-bold text-slate-800">{accountHolder}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-[6] flex flex-col h-full gap-3">
                <div className="bg-white border-2 border-[#0052cc] text-[#0052cc] rounded-lg p-3 text-right flex flex-col justify-center min-h-[104px] py-4">
                    <p className="text-xs font-bold opacity-90 mb-1">총 합계 (VAT 포함 / 원단위 절사)</p>
                    <p className="text-2xl font-black tracking-tight leading-normal">{CURRENCY_FORMAT.format(finalPrice)}</p>
                </div>
                <div className="border border-slate-300 rounded-lg p-4 flex-1 bg-white flex flex-col justify-center min-h-[120px]">
                    <h4 className="text-[12px] font-bold text-slate-700 mb-2">[비고]</h4>
                    <ul className="text-[10px] text-slate-600 space-y-1 list-disc pl-4 leading-tight">
                        <li>본 견적은 발행일로부터 15일간 유효합니다.</li>
                        <li>공사 범위 외 사항은 별도 정산합니다.</li>
                        <li>하자 보수 기간은 준공 후 1년입니다.</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const TemplateA = () => (
        <>
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
                    <div className="w-6 bg-white border-r border-slate-400 flex items-center justify-center text-slate-700 font-bold p-0.5 text-center">
                        <span style={{ writingMode: 'vertical-rl', textOrientation: 'upright', letterSpacing: '4px' }}>공급자</span>
                    </div>
                    <div className="flex flex-col w-64 bg-white">
                        <div className="flex border-b border-slate-400 h-8 items-center px-0">
                            <div className="w-16 h-full font-bold text-slate-600 flex items-center justify-center border-r border-slate-400">등록번호</div>
                            <div className="flex-1 font-bold text-center tracking-wider px-2">{supplierRegNo || '000-00-00000'}</div>
                        </div>
                        <div className="flex border-b border-slate-400 h-8 items-center px-0">
                            <div className="w-16 h-full font-bold text-slate-600 flex items-center justify-center border-r border-slate-400">상 호</div>
                            <div className="flex-1 font-bold text-center px-2">{supplierName || 'Y2K Interior'}</div>
                        </div>
                        <div className="flex border-b border-slate-400 h-8 items-center px-0">
                            <div className="w-16 h-full font-bold text-slate-600 flex items-center justify-center border-r border-slate-400">대표자</div>
                            <div className="flex-1 flex justify-between px-4 font-bold items-center">
                                <span className="flex-1 text-center">{supplierRep || '(대표자)'}</span>
                                <span className="text-red-600 border border-red-600 rounded-sm w-5 h-5 flex items-center justify-center text-[10px] shrink-0">(인)</span>
                            </div>
                        </div>
                        <div className="flex h-8 items-center px-0">
                            <div className="w-16 h-full font-bold text-slate-600 flex items-center justify-center border-r border-slate-400">사업장</div>
                            <div className="flex-1 text-[9px] leading-tight text-center px-2 flex items-center justify-center">{supplierAddress || '(사업장 주소 미입력)'}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center mb-8"><h1 className="text-3xl font-extrabold tracking-[2rem] text-[#1a1a1a] border-b-2 border-slate-800 pb-3 pl-8 inline-block">견 적 서</h1></div>
            <div className="mb-6 space-y-2 pl-1">
                <div className="flex items-center text-[13px]"><span className="w-20 font-bold text-slate-600">견적명 :</span><span className="font-bold text-base text-slate-900 ml-2">{title || '(미입력)'}</span></div>
                <div className="flex items-center text-[13px]"><span className="w-20 font-bold text-slate-600">견적의뢰 :</span><span className="font-bold text-base text-slate-900 ml-2">{customerName || '고객'} 귀하</span></div>
                <div className="flex items-center text-[13px]"><span className="w-20 font-bold text-slate-600">시공장소 :</span><span className="text-slate-800 font-medium ml-2">{customerPlace || '정보 미기재'}</span></div>
            </div>
            <div className="mb-6 w-full border-t-2 border-primary border-b border-primary text-[12px] bg-white">
                <div className="flex w-full text-primary h-10 border-b border-primary/50 items-center font-bold">
                    <div className="w-[40%] text-center">품목/내용</div><div className="w-[10%] border-l border-slate-200 text-center">규격</div><div className="w-[10%] border-l border-slate-200 text-center">수량</div><div className="w-[20%] border-l border-slate-200 text-center">단가</div><div className="w-[20%] border-l border-slate-200 text-center">금액</div>
                </div>
                {items.map((item, idx) => (
                    <div key={item.id} className="flex w-full text-slate-700 border-b border-slate-200 min-h-[48px] items-stretch">
                        <div className="w-[40%] flex flex-col justify-center items-center px-2 py-2"><span className="font-bold text-slate-900 text-[12px] text-center">{item.name}</span>{item.description && <span className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{item.description}</span>}</div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 px-1 text-[11px]">{item.unit}</div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 font-medium px-1 text-[11px]">{item.quantity}</div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-3 text-[11px]">{CURRENCY_FORMAT.format(item.materialCost + item.laborCost).replace('₩', '')}</div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-3 font-bold text-slate-900 text-[11px]">{CURRENCY_FORMAT.format((item.materialCost + item.laborCost) * item.quantity).replace('₩', '')}</div>
                    </div>
                ))}
            </div>
            <CommonPaymentInfo />
        </>
    );

    return (
        <Layout showNav={false}>
            {isGeneratingPdf && (
                <div className="fixed inset-0 z-[200] bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                    <p className="text-white font-bold">PDF 생성 중...</p>
                </div>
            )}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center p-4 justify-between max-w-[480px] mx-auto">
                    <button onClick={() => navigate(-1)} className="text-primary text-base font-medium flex items-center gap-1"><span className="material-symbols-outlined">chevron_left</span> 뒤로</button>
                    <h2 className="text-lg font-bold">견적서 작성</h2>
                    <button onClick={() => setIsPreviewOpen(true)} disabled={items.length === 0} className={`text-base font-bold ${items.length > 0 ? 'text-primary' : 'text-slate-300'}`}>확인</button>
                </div>
            </div>
            <div className="max-w-md mx-auto pb-52 px-4 space-y-8 pt-6">
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-1"><span className="material-symbols-outlined text-primary text-xl">business_center</span><h3 className="font-bold text-[#0d141b] dark:text-white">공급자 정보 (나의 정보)</h3></div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1.5"><span className="text-[11px] font-bold text-slate-500 ml-1">상호 / 업체명</span><input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="예: Y2K Interior" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-sm font-bold" /></label>
                            <label className="flex flex-col gap-1.5"><span className="text-[11px] font-bold text-slate-500 ml-1">대표자 성함</span><input type="text" value={supplierRep} onChange={(e) => setSupplierRep(e.target.value)} placeholder="성함 입력" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-sm font-bold" /></label>
                        </div>
                        <label className="flex flex-col gap-1.5"><span className="text-[11px] font-bold text-slate-500 ml-1">사업자 등록번호</span><input type="text" value={supplierRegNo} onChange={(e) => setSupplierRegNo(e.target.value)} placeholder="000-00-00000" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-sm font-bold" /></label>
                        <label className="flex flex-col gap-1.5"><span className="text-[11px] font-bold text-slate-500 ml-1">사업장 주소</span><input type="text" value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} placeholder="사업장 상세 주소" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-sm font-medium" /></label>
                        <p className="text-[10px] text-slate-400 text-center pt-2">* 한 번 입력하면 다음 작성 시 자동으로 불러옵니다.</p>
                    </div>
                </section>
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-1"><span className="material-symbols-outlined text-primary text-xl">assignment_ind</span><h3 className="font-bold text-[#0d141b] dark:text-white">견적 및 의뢰인 정보</h3></div>
                    <div className="space-y-4">
                        <label className="flex flex-col gap-1.5"><span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">견적명 <span className="text-red-500">*</span></span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 역삼동 아파트 주방 리모델링" className="w-full rounded-xl border-slate-200 dark:border-slate-800 h-14 px-4 text-base font-bold shadow-sm" /></label>
                        <label className="flex flex-col gap-1.5"><span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">의뢰인 (고객명) <span className="text-red-500">*</span></span><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="고객 성함 또는 업체명" className="w-full rounded-xl border-slate-200 dark:border-slate-800 h-12 px-4 text-base shadow-sm" /></label>
                        <label className="flex flex-col gap-1.5"><span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">시공 장소</span><input type="text" value={customerPlace} onChange={(e) => setCustomerPlace(e.target.value)} placeholder="시공될 현장 주소" className="w-full rounded-xl border-slate-200 dark:border-slate-800 h-12 px-4 text-base shadow-sm" /></label>
                    </div>
                </section>
                <section className="space-y-4">
                    <div className="flex items-center justify-between mb-1"><h3 className="font-bold text-[#0d141b] dark:text-white">견적 항목 ({items.length})</h3><button onClick={() => setIsTemplateModalOpen(true)} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">템플릿 불러오기</button></div>
                    {items.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center group">
                            <div className="flex-1"><p className="font-bold text-slate-900 dark:text-slate-100">{item.name}</p><p className="text-xs text-slate-500 mt-1">{item.quantity} {item.unit} × {CURRENCY_FORMAT.format(item.materialCost + item.laborCost)}</p></div>
                            <div className="flex items-center gap-3"><p className="font-bold text-primary">{CURRENCY_FORMAT.format((item.materialCost + item.laborCost) * item.quantity)}</p><button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500"><span className="material-symbols-outlined text-xl">delete</span></button></div>
                        </div>
                    ))}
                    <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 mt-4">
                        <div className="relative">
                            <input type="text" value={name} onChange={(e) => {
                                setName(e.target.value);
                                if(e.target.value.trim()) {
                                    setSuggestions(MOCK_LIBRARY.filter(i => i.name.includes(e.target.value)));
                                    setShowSuggestions(true);
                                } else setShowSuggestions(false);
                            }} placeholder="추가할 품목명을 입력하세요" className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 px-4 pr-24 text-sm font-bold" />
                            <button onClick={() => setIsLibraryModalOpen(true)} className="absolute right-2 top-2 bottom-2 bg-primary/10 text-primary px-3 rounded-lg text-xs font-bold active:scale-95">라이브러리</button>
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-50 top-full left-0 right-0 bg-white shadow-xl border border-slate-100 rounded-xl mt-1 max-h-40 overflow-y-auto">
                                    {suggestions.slice(0, 5).map(s => (
                                        <li key={s.id} onClick={() => { setName(s.name); setMaterialCost(s.price.toString()); setUnit(normalizeUnit(s.unit)); setShowSuggestions(false); }} className="px-4 py-2 hover:bg-slate-50 text-xs font-medium cursor-pointer">{s.name} ({CURRENCY_FORMAT.format(s.price)})</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="수량" className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm" />
                            <select value={unit} onChange={e => setUnit(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm">
                                <option value="py">평</option><option value="m2">㎡</option><option value="m">m</option><option value="ea">개</option><option value="set">식</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative"><input type="number" value={materialCost} onChange={e => setMaterialCost(e.target.value)} placeholder="자재비(단가)" className="w-full h-11 rounded-xl border-slate-200 bg-white px-4 text-sm" /><span className="absolute right-3 top-3 text-[10px] text-slate-400">원</span></div>
                            <div className="relative"><input type="number" value={laborCost} onChange={e => setLaborCost(e.target.value)} placeholder="노무비(단가)" className="w-full h-11 rounded-xl border-slate-200 bg-white px-4 text-sm" /><span className="absolute right-3 top-3 text-[10px] text-slate-400">원</span></div>
                        </div>
                        <button onClick={handleAddItem} className="w-full h-12 rounded-xl bg-slate-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all">항목 추가하기</button>
                    </div>
                </section>
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                    <h3 className="font-bold text-[#0d141b] dark:text-white flex items-center gap-2"><span className="material-symbols-outlined text-slate-400">account_balance</span>입금 계좌 설정</h3>
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="은행명" className="w-full h-11 rounded-xl border-slate-100 bg-slate-50 px-4 text-sm font-medium" />
                    <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="계좌번호" className="w-full h-11 rounded-xl border-slate-100 bg-slate-50 px-4 text-sm font-medium" />
                    <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="예금주" className="w-full h-11 rounded-xl border-slate-100 bg-slate-50 px-4 text-sm font-medium" />
                </section>
            </div>
            <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 pb-8 z-50 flex items-center justify-between">
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">예상 합계</p><p className="text-xl font-black text-primary">{CURRENCY_FORMAT.format(totalEstimatedPrice)}</p></div>
                <button onClick={() => setIsPreviewOpen(true)} disabled={items.length === 0} className="bg-primary text-white h-14 px-10 rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50">견적 확인하기</button>
            </div>
            {isLibraryModalOpen && (
                <div className="fixed inset-0 z-[170] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-end animate-fade-in">
                    <div className="w-full max-w-[480px] h-[90vh] bg-background-light rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                        <div className="flex items-center justify-between p-5 bg-white border-b border-slate-100">
                            <h3 className="text-xl font-bold">자재 라이브러리</h3>
                            <button onClick={() => setIsLibraryModalOpen(false)} className="size-10 rounded-full bg-slate-100 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="bg-white p-4 border-b border-slate-100 space-y-3">
                            <div className="flex w-full items-center rounded-xl h-11 bg-slate-100 px-3"><span className="material-symbols-outlined text-slate-400">search</span><input type="text" placeholder="자재명 또는 설명 검색..." className="bg-transparent border-none focus:ring-0 text-sm w-full" value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} /></div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">{['전체', '목공', '타일', '자재', '기타'].map(cat => (<button key={cat} onClick={() => setLibraryCategory(cat)} className={`px-4 h-8 rounded-full text-xs font-bold whitespace-nowrap transition-all ${libraryCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>{cat}</button>))}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                            {filteredLibraryItems.length > 0 ? (
                                filteredLibraryItems.map(item => (
                                    <div key={item.id} onClick={() => handleLibraryItemSelect(item)} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center group">
                                        <div className="flex-1 min-w-0 pr-4"><div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">{item.category}</span><h4 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{item.name}</h4></div><p className="text-xs text-slate-500 truncate">{item.description}</p></div>
                                        <div className="text-right shrink-0"><p className="text-sm font-black text-slate-900">{CURRENCY_FORMAT.format(item.price)}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{item.unit}</p></div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-slate-400 flex flex-col items-center"><span className="material-symbols-outlined text-5xl mb-2 opacity-20">search_off</span><p className="text-sm">검색 결과가 없습니다.</p></div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-end animate-fade-in">
                    <div className="w-full max-w-[480px] h-[85vh] bg-background-light rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                        <div className="flex items-center justify-between p-5 bg-white border-b border-slate-100"><h3 className="text-xl font-bold">견적 템플릿 불러오기</h3><button onClick={() => setIsTemplateModalOpen(false)} className="size-10 rounded-full bg-slate-100 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button></div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {ESTIMATE_TEMPLATES.map(template => (
                                <div key={template.id} onClick={() => handleSelectTemplate(template)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.98] transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2"><span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase">{template.category}</span><span className="text-xs font-bold text-slate-400">{template.items.length}개 항목</span></div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{template.name}</h4><p className="text-sm text-slate-500 leading-tight mb-4">{template.description}</p>
                                    <div className="flex flex-wrap gap-2">{template.items.slice(0, 3).map((item, idx) => (<span key={idx} className="text-[11px] bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full border border-slate-100">{item.name}</span>))}{template.items.length > 3 && <span className="text-[11px] text-slate-400 py-1">외 {template.items.length - 3}개</span>}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center animate-fade-in">
                    <div className="w-full max-w-[480px] h-[95vh] bg-background-light sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white"><div className="flex items-center gap-2"><button onClick={() => setIsPreviewOpen(false)} className="size-10 rounded-full hover:bg-slate-100 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button><h3 className="text-lg font-bold">견적서 미리보기</h3></div><button onClick={handleDownloadPDF} className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"><span className="material-symbols-outlined">download</span></button></div>
                        <div className="flex-1 overflow-y-auto bg-slate-100 p-4"><div id="preview-pdf-container" className="bg-white shadow-lg min-w-[595px] px-14 py-10 text-slate-900 box-border flex flex-col mx-auto relative"><TemplateA /></div></div>
                        <div className="p-4 bg-white border-t border-slate-200 flex gap-3 pb-10"><button onClick={() => setIsPreviewOpen(false)} className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-700 font-bold">수정하기</button><button onClick={handleFinalSave} className="flex-[2] py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20">저장 및 발행</button></div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
