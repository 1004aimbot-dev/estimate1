
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
    
    // Check for existing estimate (Edit mode) or Library item (Add mode)
    const initialData = location.state?.estimate;
    const selectedLibraryItem = location.state?.selectedLibraryItem as LibraryItem | undefined;
    const selectedLibraryItems = location.state?.selectedLibraryItems as LibraryItem[] | undefined;

    // Helper to normalize unit from library (e.g., 'm²' -> 'm2') for select input
    const normalizeUnit = (u: string | undefined) => {
        if (!u) return 'py';
        if (u === 'm²') return 'm2';
        return u;
    };
    
    // Form Input States
    const [author, setAuthor] = useState(initialData?.author || 'Ucraft'); // 1. 작성자
    const [title, setTitle] = useState(initialData?.title || ''); // 2. 견적명
    const [customerName, setCustomerName] = useState(initialData?.customerName || ''); // 3. 견적의뢰 (New)
    const [customerPlace, setCustomerPlace] = useState(initialData?.constructionPlace || ''); // 4. 시공장소
    
    // Initialize with SINGLE library item data if available
    const [name, setName] = useState(selectedLibraryItem?.name || '');
    const [description, setDescription] = useState(selectedLibraryItem?.description || '');
    const [unit, setUnit] = useState(normalizeUnit(selectedLibraryItem?.unit));
    const [quantity, setQuantity] = useState<string>('');
    const [materialCost, setMaterialCost] = useState<string>(selectedLibraryItem?.price?.toString() || '');
    const [laborCost, setLaborCost] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isImageError, setIsImageError] = useState(false);

    // Bank Info States
    const [bankName, setBankName] = useState(initialData?.bankInfo?.bankName || '신한은행');
    const [accountNumber, setAccountNumber] = useState(initialData?.bankInfo?.accountNumber || '');
    const [accountHolder, setAccountHolder] = useState(initialData?.bankInfo?.accountHolder || 'Ucraft');

    // Items List State
    const [items, setItems] = useState<EstimateItemDetail[]>(initialData?.items || []);
    
    // Autocomplete & Library Modal State
    const [suggestions, setSuggestions] = useState<LibraryItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [libraryCategory, setLibraryCategory] = useState<string>('전체');

    // Template Modal State
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    
    // Preview Modal State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    
    // Print Template State
    const [printTemplate, setPrintTemplate] = useState<'A' | 'B' | 'C'>('A');

    // Derived values for Preview and Save
    const totalEstimatedPrice = useMemo(() => {
        return items.reduce((sum, item) => sum + ((item.materialCost + item.laborCost) * item.quantity), 0);
    }, [items]);

    const rawTotalPrice = totalEstimatedPrice;
    const finalPrice = Math.floor(rawTotalPrice / 1000) * 1000;
    const contractPrice = Math.floor(finalPrice * 0.3 / 1000) * 1000;
    const middlePrice = Math.floor(finalPrice * 0.4 / 1000) * 1000;
    const balancePrice = finalPrice - contractPrice - middlePrice;
    const todayDate = new Date().toLocaleDateString();

    // Effect: Handle Bulk Add from Library
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
                imageUrl: undefined
            }));

            setItems(prev => [...prev, ...newItems]);
            window.history.replaceState({}, '');
        }
    }, [selectedLibraryItems]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageUrl(e.target.value);
        setIsImageError(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
                setIsImageError(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);

        if (value.trim()) {
            const filtered = MOCK_LIBRARY.filter(item => 
                item.name.toLowerCase().includes(value.toLowerCase()) || 
                item.category.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectLibraryItem = (item: LibraryItem) => {
        setName(item.name);
        setDescription(item.description);
        setUnit(normalizeUnit(item.unit));
        setMaterialCost(item.price.toString());
        setIsLibraryModalOpen(false);
        setShowSuggestions(false);
    };

    const handleApplyTemplate = (template: EstimateTemplate) => {
        const newItems = template.items.map((item, idx) => ({
            ...item,
            id: Date.now().toString() + '-' + idx + '-t',
            unit: normalizeUnit(item.unit) || '식'
        }));

        setItems(prev => [...prev, ...newItems]);
        setIsTemplateModalOpen(false);
    };

    const handleAddItem = () => {
        if (!name.trim()) {
            alert('품목명을 입력해주세요.');
            return;
        }
        if (!quantity || parseFloat(quantity) <= 0) {
            alert('유효한 수량을 입력해주세요.');
            return;
        }

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

        // Reset Inputs
        setName('');
        setDescription('');
        setQuantity('');
        setMaterialCost('');
        setLaborCost('');
        setImageUrl('');
        
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRemoveItem = (id: string) => {
        setItems((prev) => prev.filter(item => item.id !== id));
    };

    // 'Activate Estimate Confirmation' by making it clickable as long as there is at least one item
    const isFormValid = useMemo(() => {
        return items.length > 0;
    }, [items]);

    const handleReview = () => {
        if (!isFormValid) return;
        setIsPreviewOpen(true);
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('preview-pdf-container');
        if (!element) return;
        
        try {
            setIsGeneratingPdf(true);
            // Ensure any images are loaded
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff',
                width: element.scrollWidth,
                height: element.scrollHeight,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            
            // A4 size is 210 x 297 mm
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            pdf.save(`${title || '견적서'}_${printTemplate}타입.pdf`);
        } catch (error) {
            console.error(error);
            alert('PDF 생성 중 오류가 발생했습니다.');
        } finally { 
            setIsGeneratingPdf(false); 
        }
    };

    const handleFinalSave = () => {
        // Validation for final save only
        if (!title.trim() || !customerName.trim()) {
            alert('견적명과 고객명을 입력해주세요.');
            return;
        }

        const newEstimate: Estimate = {
            id: Date.now().toString(),
            title: title || '새 견적서',
            customerName: customerName,
            author: author,
            constructionPlace: customerPlace,
            price: totalEstimatedPrice,
            category: 'General', 
            status: EstimateStatus.Draft,
            imageUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
            date: todayDate,
            items: items, 
            bankInfo: {
                bankName,
                accountNumber,
                accountHolder
            }
        };

        const savedEstimates = localStorage.getItem('estimates');
        const currentEstimates = savedEstimates ? JSON.parse(savedEstimates) : MOCK_ESTIMATES;
        const updatedEstimates = [newEstimate, ...currentEstimates];
        localStorage.setItem('estimates', JSON.stringify(updatedEstimates));

        navigate('/success', { state: { estimateData: newEstimate } });
    };

    const handleShare = async () => {
        const shareData = {
            title: `[견적서] ${title}`,
            text: `${customerName}님을 위한 공사 견적서입니다.\n총 금액: ${CURRENCY_FORMAT.format(finalPrice)}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                alert('견적서 정보가 클립보드에 복사되었습니다.');
            } catch (err) {
                alert('공유하기를 지원하지 않는 브라우저입니다.');
            }
        }
    };

    const filteredLibraryItems = useMemo(() => {
        if (libraryCategory === '전체') return MOCK_LIBRARY;
        return MOCK_LIBRARY.filter(item => item.category === libraryCategory);
    }, [libraryCategory]);

    const categories = ['전체', '목공', '타일', '자재', '기타'];

    // --- TEMPLATE COMPONENTS ---

    const CommonPaymentInfo = () => (
        <div className="flex gap-4 items-start">
            {/* 좌측: 지급 조건 및 계좌 정보 (비율 축소) */}
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
                        <div className="flex border-b border-slate-200 h-8 bg-white items-center py-0 px-2">
                            <div className="w-18 text-slate-500 font-bold flex items-center justify-center h-full">잔 금(30%)</div>
                            <div className="flex-1 font-bold text-slate-800 flex items-center justify-end h-full">{CURRENCY_FORMAT.format(balancePrice)}</div>
                        </div>
                        <div className="flex h-9 bg-white items-center py-0 px-2">
                            <div className="w-18 text-primary font-bold flex items-center justify-center h-full">합 계</div>
                            <div className="flex-1 font-black text-primary text-[12px] flex items-center justify-end h-full">{CURRENCY_FORMAT.format(finalPrice)}</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-[12px] font-bold text-slate-700 mb-1.5">[입금 계좌 정보]</h4>
                    <div className="w-full border border-slate-200 text-[11px] rounded-sm p-3 bg-white space-y-2">
                        <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 w-12 font-medium flex items-center">은행명</span>
                            <span className="font-bold text-slate-800 flex items-center">{bankName}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 w-12 font-medium flex items-center">계좌번호</span>
                            <span className="font-bold text-slate-800 flex items-center">{accountNumber}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 w-12 font-medium flex items-center">예금주</span>
                            <span className="font-bold text-slate-800 flex items-center">{accountHolder}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 우측: 합계 및 비고 (비율 확대) */}
            <div className="flex-[6] flex flex-col h-full gap-3">
                <div className="bg-white border-2 border-[#0052cc] text-[#0052cc] rounded-lg p-3 text-right flex flex-col justify-center min-h-[104px] py-4">
                    <p className="text-xs font-bold opacity-90 mb-1">총 합계 (VAT 포함 / 원단위 절사)</p>
                    <p className="text-2xl font-black tracking-tight leading-normal">{CURRENCY_FORMAT.format(finalPrice)}</p>
                </div>

                <div className="border border-slate-300 rounded-lg p-4 flex-1 bg-white flex flex-col justify-center min-h-[140px]">
                    <h4 className="text-[12px] font-bold text-slate-700 mb-2">[비고 / 특이사항]</h4>
                    <ul className="text-[11px] text-slate-600 space-y-2 list-decimal pl-4 leading-normal tracking-tight">
                        <li>본 견적서는 발행일로부터 15일간 유효합니다.</li>
                        <li>공사 범위 외 추가 요청 시항은 별도 정산합니다.</li>
                        <li>하자 보수 기간은 준공일로부터 1년으로 합니다.</li>
                        <li>자재 수급 상황에 따라 동급 자재로 변경될 수 있습니다.</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    // Template A: Standard (Previous Default)
    const TemplateA = () => (
        <>
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
                    <div className="w-6 bg-white border-r border-slate-400 flex items-center justify-center text-slate-700 font-bold p-0.5 text-center">
                        <span style={{ writingMode: 'vertical-rl', textOrientation: 'upright', letterSpacing: '4px' }}>공급자</span>
                    </div>
                    <div className="flex flex-col w-64">
                        <div className="flex border-b border-slate-400 h-8 items-center bg-white py-0">
                            <div className="w-16 bg-white border-r border-slate-400 font-bold text-slate-600 text-[11px] flex items-center justify-center h-full">등록번호</div>
                            <div className="flex-1 font-medium tracking-wide text-slate-800 text-[11px] bg-white flex items-center justify-center h-full">123-45-67890</div>
                        </div>
                        <div className="flex border-b border-slate-400 h-8 items-center bg-white py-0">
                            <div className="w-16 bg-white border-r border-slate-400 font-bold text-slate-600 text-[11px] flex items-center justify-center h-full">상 호</div>
                            <div className="flex-1 font-bold text-slate-800 text-[11px] bg-white flex items-center justify-center h-full">{author}</div>
                        </div>
                        <div className="flex border-b border-slate-400 h-8 items-center bg-white py-0">
                            <div className="w-16 bg-white border-r border-slate-400 font-bold text-slate-600 text-[11px] flex items-center justify-center h-full">대표자</div>
                            <div className="flex-1 px-3 font-medium relative bg-white flex items-center justify-between h-full">
                                <div className="flex-1 text-center font-bold text-slate-800 tracking-widest text-[12px] pl-3 flex items-center justify-center h-full">홍 길 동</div>
                                <div className="text-red-600 font-serif text-[10px] opacity-80 border border-red-600 rounded-sm w-5 h-5 flex items-center justify-center shrink-0 select-none">(인)</div>
                            </div>
                        </div>
                        <div className="flex h-8 items-center bg-white py-0">
                            <div className="w-16 bg-white border-r border-slate-400 font-bold text-slate-600 text-[11px] flex items-center justify-center h-full">사업장</div>
                            <div className="flex-1 font-medium text-slate-800 text-[10px] px-1 break-keep bg-white flex items-center justify-center h-full text-center leading-tight">서울시 강남구 테헤란로 123</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mb-8 relative">
                <h1 className="text-3xl font-extrabold tracking-[2rem] text-[#1a1a1a] inline-block border-b-2 border-slate-800 pb-3 pl-8">견 적 서</h1>
            </div>

            <div className="mb-6 pl-2 space-y-2">
                <div className="flex items-center text-[13px] h-6 py-0">
                    <span className="w-20 font-bold text-slate-600 shrink-0 flex justify-between h-full items-center">
                        <span>견</span><span>적</span><span>명</span> <span>:</span>
                    </span>
                    <span className="font-bold text-base text-slate-900 ml-2 flex items-center h-full">{title || '(견적명 미입력)'}</span>
                </div>
                <div className="flex items-center text-[13px] h-6 py-0">
                    <span className="w-20 font-bold text-slate-600 shrink-0 flex justify-between h-full items-center">
                        <span>견</span><span>적</span><span>의</span><span>뢰</span> <span>:</span>
                    </span>
                    <span className="font-bold text-base text-slate-900 ml-2 flex items-center h-full">{customerName || '고객'} 귀하</span>
                </div>
                <div className="flex items-center text-[13px] h-6 py-0">
                    <span className="w-20 font-bold text-slate-600 shrink-0 flex justify-between h-full items-center">
                        <span>시</span><span>공</span><span>장</span><span>소</span> <span>:</span>
                    </span>
                    <span className="text-slate-800 font-medium text-[13px] ml-2 flex items-center h-full">{customerPlace || '정보 미기재'}</span>
                </div>
                <div className="flex items-center text-[13px] h-6 py-0">
                    <span className="w-20 font-bold text-slate-600 shrink-0 flex justify-between h-full items-center">
                        <span>견</span><span>적</span><span>일</span><span>자</span> <span>:</span>
                    </span>
                    <span className="text-slate-800 font-medium text-[13px] ml-2 flex items-center h-full">{todayDate}</span>
                </div>
            </div>

            <div className="mb-6 w-full border-t-2 border-primary border-b border-primary text-[12px]">
                <div className="flex w-full bg-white text-primary h-10 border-b border-primary/50 items-center font-bold py-0">
                    <div className="w-[40%] flex items-center justify-center h-full">품목/내용</div>
                    <div className="w-[10%] flex items-center justify-center border-l border-slate-200 h-full">규격</div>
                    <div className="w-[10%] flex items-center justify-center border-l border-slate-200 h-full">수량</div>
                    <div className="w-[20%] flex items-center justify-center border-l border-slate-200 h-full">단가</div>
                    <div className="w-[20%] flex items-center justify-center border-l border-slate-200 h-full">금액</div>
                </div>

                <div className="flex w-full bg-white text-slate-800 border-b border-slate-200 h-10 items-center justify-center font-bold py-0">
                    [종합 공사]
                </div>

                {items.map((item, idx) => (
                    <div key={item.id} className="flex w-full bg-white text-slate-700 border-b border-slate-200 min-h-[48px] items-stretch">
                        <div className="w-[40%] flex flex-col justify-center items-center px-2 py-2">
                            <span className="font-bold text-slate-900 block text-[12px] text-center leading-tight">{item.name}</span>
                            {item.description && <span className="text-[10px] text-slate-500 block mt-1 text-center leading-tight scale-95">{item.description}</span>}
                        </div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 px-1 text-[11px] py-0">
                            {item.unit}
                        </div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 font-medium px-1 text-[11px] py-0">
                            {item.quantity}
                        </div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-3 tracking-tight text-[11px] py-0">
                            {CURRENCY_FORMAT.format(item.materialCost + item.laborCost).replace('₩', '')}
                        </div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-3 font-bold tracking-tight text-slate-900 text-[11px] py-0">
                            {CURRENCY_FORMAT.format((item.materialCost + item.laborCost) * item.quantity).replace('₩', '')}
                        </div>
                    </div>
                ))}
                 {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex w-full bg-white border-b border-slate-200 h-10 items-center py-0">
                        <div className="w-[40%] h-full"></div>
                        <div className="w-[10%] border-l border-slate-100 h-full"></div>
                        <div className="w-[10%] border-l border-slate-100 h-full"></div>
                        <div className="w-[20%] border-l border-slate-100 h-full"></div>
                        <div className="w-[20%] border-l border-slate-100 h-full"></div>
                    </div>
                ))}
            </div>
            <CommonPaymentInfo />
            <div className="mt-8 text-center text-[12px] text-slate-400 font-medium">
                위와 같이 견적서를 제출합니다.
            </div>
        </>
    );

    // Template B: Modern Blue
    const TemplateB = () => (
        <>
            <div className="w-full bg-primary text-white p-10 flex justify-between items-center mb-10 -mx-14 -mt-8 px-14 pt-14 pb-14 w-[calc(100%+7rem)]">
                 <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-extrabold tracking-widest leading-none">견 적 서</h1>
                    <p className="opacity-80 text-sm font-light tracking-wider uppercase">Estimate Sheet</p>
                 </div>
                 <div className="text-right flex flex-col gap-2">
                    <p className="text-2xl font-bold opacity-90 leading-none">{title || '(견적명 미입력)'}</p>
                    <p className="text-sm opacity-70 leading-none">{todayDate}</p>
                 </div>
            </div>

            <div className="flex justify-between gap-6 mb-10">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col gap-3">
                     <div className="mb-1"><h3 className="text-primary font-bold text-sm border-b-2 border-primary pb-1 inline-block">받는 분 (Client)</h3></div>
                     <div className="space-y-2 text-xs">
                        <p className="flex items-center"><span className="text-slate-500 w-12 inline-block">성함</span> <span className="font-bold text-slate-800">{customerName || '고객'} 귀하</span></p>
                        <p className="flex items-center"><span className="text-slate-500 w-12 inline-block">현장</span> <span className="font-medium text-slate-700">{customerPlace || '정보 미기재'}</span></p>
                     </div>
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col gap-3">
                     <div className="mb-1"><h3 className="text-primary font-bold text-sm border-b-2 border-primary pb-1 inline-block">공급자 (Supplier)</h3></div>
                     <div className="space-y-2 text-xs">
                        <p className="flex items-center"><span className="text-slate-500 w-12 inline-block">상호</span> <span className="font-bold text-slate-800">{author}</span></p>
                        <p className="flex items-center"><span className="text-slate-500 w-12 inline-block">대표</span> <span className="font-medium text-slate-700">홍 길 동 (인)</span></p>
                        <p className="flex items-center"><span className="text-slate-500 w-12 inline-block">주소</span> <span className="font-medium text-slate-700">서울시 강남구 테헤란로 123</span></p>
                     </div>
                </div>
            </div>

             <div className="mb-6 w-full text-[12px] border-b-2 border-primary">
                <div className="flex w-full bg-primary text-white h-11 rounded-t-lg overflow-hidden items-center py-0">
                    <div className="w-[40%] flex items-center justify-center font-bold h-full">품목 / 내용</div>
                    <div className="w-[10%] flex items-center justify-center font-bold border-l border-white/20 h-full">규격</div>
                    <div className="w-[10%] flex items-center justify-center font-bold border-l border-white/20 h-full">수량</div>
                    <div className="w-[20%] flex items-center justify-center font-bold border-l border-white/20 h-full">단가</div>
                    <div className="w-[20%] flex items-center justify-center font-bold border-l border-white/20 h-full">금액</div>
                </div>

                {items.map((item, idx) => (
                    <div key={item.id} className={`flex w-full text-slate-700 border-x border-slate-200 min-h-[52px] items-stretch ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <div className="w-[40%] flex flex-col justify-center items-center px-2 py-3">
                            <span className="font-bold text-slate-800 block text-[12px] text-center leading-tight">{item.name}</span>
                            {item.description && <span className="text-[10px] text-slate-500 block mt-1.5 text-center leading-tight">{item.description}</span>}
                        </div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 px-1 text-[11px] py-0">
                            {item.unit}
                        </div>
                        <div className="w-[10%] flex items-center justify-center border-l border-slate-100 font-medium px-1 text-[11px] py-0">
                            {item.quantity}
                        </div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-4 text-[11px] tracking-tight py-0">
                            {CURRENCY_FORMAT.format(item.materialCost + item.laborCost).replace('₩', '')}
                        </div>
                        <div className="w-[20%] flex items-center justify-end border-l border-slate-100 px-4 font-bold tracking-tight text-primary text-[11px] py-0">
                            {CURRENCY_FORMAT.format((item.materialCost + item.laborCost) * item.quantity).replace('₩', '')}
                        </div>
                    </div>
                ))}
                 {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className={`flex w-full border-x border-slate-200 h-11 items-center py-0 ${i % 2 !== (items.length % 2 === 0 ? 0 : 1) ? 'bg-white' : 'bg-slate-50'}`}>
                        <div className="w-[40%] h-full"></div>
                        <div className="w-[10%] border-l border-slate-100 h-full"></div>
                        <div className="w-[10%] border-l border-slate-100 h-full"></div>
                        <div className="w-[20%] border-l border-slate-100 h-full"></div>
                        <div className="w-[20%] border-l border-slate-100 h-full"></div>
                    </div>
                ))}
            </div>

            <CommonPaymentInfo />
        </>
    );

    // Template C: Simple Boxed
    const TemplateC = () => (
        <>
            <div className="border-4 border-slate-800 p-8 min-h-[720px] relative flex flex-col">
                <div className="flex justify-between items-end border-b-2 border-slate-800 pb-6 mb-8">
                    <h1 className="text-4xl font-black text-slate-900 tracking-[0.2em] leading-normal uppercase">Estimate</h1>
                    <div className="text-right flex flex-col gap-1.5 pb-1">
                        <p className="text-sm font-bold text-slate-600 leading-none uppercase">No. {Date.now().toString().slice(-6)}</p>
                        <p className="text-sm font-bold text-slate-600 leading-none uppercase">Date. {todayDate}</p>
                    </div>
                </div>

                <div className="flex gap-10 mb-10 text-sm">
                    <div className="flex-1 space-y-4">
                        <div className="flex border-b border-slate-400 pb-2 items-center">
                            <span className="w-20 font-bold text-slate-500 uppercase text-xs">Project</span>
                            <span className="flex-1 font-bold text-slate-900">{title || '(견적명 미입력)'}</span>
                        </div>
                        <div className="flex border-b border-slate-400 pb-2 items-center">
                            <span className="w-20 font-bold text-slate-500 uppercase text-xs">Client</span>
                            <span className="flex-1 font-bold text-slate-900">{customerName || '고객'} 귀하</span>
                        </div>
                         <div className="flex border-b border-slate-400 pb-2 items-center">
                            <span className="w-20 font-bold text-slate-500 uppercase text-xs">Location</span>
                            <span className="flex-1 text-slate-700">{customerPlace || '정보 미기재'}</span>
                        </div>
                    </div>
                     <div className="flex-1 space-y-4 text-right">
                        <div className="flex justify-end border-b border-slate-400 pb-2 items-center">
                            <span className="font-bold text-slate-500 uppercase text-xs mr-4">Supplier</span>
                            <span className="font-bold text-slate-900">{author}</span>
                        </div>
                        <div className="flex justify-end border-b border-slate-400 pb-2 items-center">
                            <span className="font-bold text-slate-500 uppercase text-xs mr-4">Reg No</span>
                            <span className="text-slate-700 font-mono">123-45-67890</span>
                        </div>
                        <div className="flex justify-end border-b border-slate-400 pb-2 items-center">
                            <span className="font-bold text-slate-500 uppercase text-xs mr-4">Signature</span>
                            <span className="font-bold text-slate-900">홍 길 동 (인)</span>
                        </div>
                    </div>
                </div>

                <table className="w-full text-xs mb-10 border-collapse table-fixed">
                    <thead>
                        <tr className="border-y-2 border-slate-800 h-12 bg-slate-50">
                            <th className="font-bold w-[40%] text-left pl-4 py-0 align-middle uppercase text-slate-500 tracking-wider">Description</th>
                            <th className="font-bold w-[10%] text-center py-0 align-middle uppercase text-slate-500 tracking-wider">Unit</th>
                            <th className="font-bold w-[10%] text-center py-0 align-middle uppercase text-slate-500 tracking-wider">Qty</th>
                            <th className="font-bold w-[20%] text-right pr-4 py-0 align-middle uppercase text-slate-500 tracking-wider">Unit Price</th>
                            <th className="font-bold w-[20%] text-right pr-4 py-0 align-middle uppercase text-slate-500 tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                             <tr key={item.id} className="border-b border-slate-300 h-14 hover:bg-slate-50/50 transition-colors">
                                <td className="pl-4 py-3 align-middle">
                                    <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 leading-tight mt-1">{item.description}</p>
                                </td>
                                <td className="text-center py-0 align-middle">{item.unit}</td>
                                <td className="text-center font-bold py-0 align-middle">{item.quantity}</td>
                                <td className="text-right pr-4 py-0 align-middle">{CURRENCY_FORMAT.format(item.materialCost + item.laborCost).replace('₩', '')}</td>
                                <td className="text-right pr-4 font-bold py-0 align-middle">{CURRENCY_FORMAT.format((item.materialCost + item.laborCost) * item.quantity).replace('₩', '')}</td>
                            </tr>
                        ))}
                         {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
                            <tr key={`empty-${i}`} className="border-b border-slate-300 h-12">
                                <td colSpan={5}></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                         <tr className="border-t-2 border-slate-800 h-16 bg-slate-100">
                            <td colSpan={2} className="text-left pl-6 font-bold text-sm py-0 align-middle uppercase tracking-widest text-slate-600">Total Amount (VAT Incl.)</td>
                            <td colSpan={3} className="text-right pr-10 font-black text-xl py-0 align-middle text-slate-900">{CURRENCY_FORMAT.format(finalPrice)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-auto border border-slate-400 p-6 text-xs space-y-2.5 bg-slate-50 rounded-sm">
                    <p className="font-bold text-slate-800 uppercase mb-2 tracking-widest">Notes & Conditions</p>
                    <p className="text-slate-600">1. 본 견적서는 발행일로부터 2주간 유효합니다.</p>
                    <p className="text-slate-600">2. 계좌번호: {bankName} {accountNumber} (예금주: {accountHolder})</p>
                    <p className="text-slate-600">3. 상기 이외의 추가 공사 및 자재 변경 시 별도 정산합니다.</p>
                </div>
            </div>
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
                    <button onClick={() => navigate(-1)} className="text-primary text-base font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined">chevron_left</span>
                        뒤로
                    </button>
                    <h2 className="text-lg font-bold leading-tight tracking-tight">
                        {initialData ? '견적서 수정' : '견적서 작성'}
                    </h2>
                    <div className="flex items-center justify-end">
                        <button 
                            onClick={handleReview} 
                            disabled={!isFormValid}
                            className={`text-base font-bold leading-normal transition-colors ${
                                isFormValid ? 'text-primary cursor-pointer' : 'text-slate-300 cursor-not-allowed'
                            }`}
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto pb-52">
                {/* Basic Info Input Section */}
                <div className="px-4 pt-6 pb-2 space-y-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">작성자 (상호) <span className="text-red-500">*</span></span>
                        <input 
                            type="text" 
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-12 px-4 text-base"
                            placeholder="작성자 또는 업체명"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">견적명 <span className="text-red-500">*</span></span>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-14 px-4 text-lg font-bold placeholder:text-base placeholder:font-normal placeholder:text-slate-400 transition-shadow"
                            placeholder="예: 논현동 주택 2층 리모델링"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">견적 의뢰 (공급받는 자) <span className="text-red-500">*</span></span>
                        <input 
                            type="text" 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-12 px-4 text-base"
                            placeholder="고객명 또는 회사명"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">시공 장소</span>
                        <input 
                            type="text" 
                            value={customerPlace}
                            onChange={(e) => setCustomerPlace(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-12 px-4 text-base"
                            placeholder="예: 서울시 강남구 역삼동..."
                        />
                    </label>
                </div>

                {/* Added Items List Section */}
                {items.length > 0 && (
                    <div className="px-4 py-4 space-y-3">
                        <div className="flex items-center justify-between px-1">
                             <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">추가된 항목 ({items.length})</p>
                        </div>
                        {items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 relative animate-fade-in">
                                <button 
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                                <div className="flex gap-4">
                                    {item.imageUrl ? (
                                        <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-100 dark:border-slate-800">
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
                                            <span className="material-symbols-outlined">inventory_2</span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[#0d141b] dark:text-slate-100">{item.name}</h4>
                                        {item.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 line-clamp-1">{item.description}</p>}
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {item.quantity} {item.unit === 'py' ? '평' : item.unit} × {CURRENCY_FORMAT.format(item.materialCost + item.laborCost)}
                                        </p>
                                        <p className="text-primary font-bold text-sm mt-1">
                                            {CURRENCY_FORMAT.format((item.materialCost + item.laborCost) * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="h-2 bg-slate-100 dark:bg-slate-800/50 my-2"></div>

                {/* New Item Entry Section */}
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-[#0d141b] dark:text-white">새 항목 입력</p>
                            <button 
                                onClick={() => setIsTemplateModalOpen(true)}
                                className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                                템플릿 불러오기
                            </button>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <label className="flex flex-col flex-1 relative">
                            <p className="text-slate-700 dark:text-slate-300 text-sm font-bold pb-1.5 ml-1">품목명 <span className="text-red-500">*</span></p>
                            <div className="relative">
                                <input 
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-14 pl-4 pr-32 text-base" 
                                    type="text" 
                                    placeholder="예: 거실 바닥 타일 (600*600)" 
                                    value={name}
                                    onChange={handleNameChange}
                                    onFocus={() => { if(name) setShowSuggestions(true); }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    autoComplete="off"
                                />
                                <button 
                                    onClick={() => setIsLibraryModalOpen(true)}
                                    className="absolute right-2 top-2 bottom-2 bg-primary/10 text-primary px-3 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-base">dataset</span>
                                    불러오기
                                </button>
                            </div>
                            
                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-[60] top-[calc(100%+4px)] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden no-scrollbar">
                                    {suggestions.map((item) => (
                                        <li 
                                            key={item.id}
                                            onClick={() => handleSelectLibraryItem(item)}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 flex justify-between items-center group"
                                        >
                                            <div className="flex flex-col overflow-hidden">
                                                 <span className="font-bold text-sm text-[#0d141b] dark:text-slate-100 truncate">{item.name}</span>
                                                 <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.category} | {item.description}</span>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                 <span className="text-xs font-bold text-primary">{CURRENCY_FORMAT.format(item.price)}</span>
                                                 <span className="text-[10px] text-slate-400">/{item.unit}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </label>

                         <label className="flex flex-col flex-1 relative">
                            <p className="text-slate-700 dark:text-slate-300 text-sm font-bold pb-1.5 ml-1">상세 설명</p>
                            <input 
                                className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-14 px-4 text-base" 
                                type="text" 
                                placeholder="규격, 재질, 색상 등 상세 정보" 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                autoComplete="off"
                            />
                        </label>

                        {/* Image Hotlink/Upload */}
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-end pb-1.5 ml-1">
                                <p className="text-slate-700 dark:text-slate-300 text-sm font-bold">참고 이미지 (링크/업로드)</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-3 top-4 text-slate-400">link</span>
                                    <input 
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-14 pl-10 pr-4 text-sm truncate" 
                                        type="text" 
                                        placeholder="이미지 URL 입력 또는 우측 버튼"
                                        value={imageUrl}
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <input 
                                    type="file" 
                                    id="image-upload" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <label 
                                    htmlFor="image-upload" 
                                    className="h-14 w-14 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 shadow-sm active:scale-95 transition-transform cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <span className="material-symbols-outlined">add_photo_alternate</span>
                                </label>
                            </div>
                            {imageUrl && (
                                <div className="mt-3 relative w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                    <img 
                                        src={imageUrl} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                        onError={() => setIsImageError(true)}
                                    />
                                    {isImageError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2">broken_image</span>
                                            <span className="text-xs">이미지를 불러올 수 없습니다</span>
                                        </div>
                                    )}
                                    {!isImageError && (
                                        <button 
                                            onClick={() => {
                                                setImageUrl('');
                                                const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                                                if (fileInput) fileInput.value = '';
                                            }}
                                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col w-full">
                                <p className="text-slate-700 dark:text-slate-300 text-sm font-bold pb-1.5 ml-1">단위</p>
                                <div className="relative">
                                    <select 
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-14 px-4 text-base appearance-none"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                    >
                                        <option value="py">평</option>
                                        <option value="m2">㎡</option>
                                        <option value="m">m (미터)</option>
                                        <option value="ea">개 (EA)</option>
                                        <option value="set">식 (Set)</option>
                                        <option value="bundle">단 (Bundle)</option>
                                        <option value="box">박스 (Box)</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-slate-400 pointer-events-none">unfold_more</span>
                                </div>
                            </label>
                            <label className="flex flex-col w-full">
                                <p className="text-slate-700 dark:text-slate-300 text-sm font-bold pb-1.5 ml-1">수량 <span className="text-red-500">*</span></p>
                                <input 
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary focus:ring-primary h-14 px-4 text-base" 
                                    type="number" 
                                    placeholder="0" 
                                    step="0.01"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col">
                                <p className="text-slate-700 dark:text-slate-300 text-sm font-bold pb-1.5 ml-1">자재비 (단가)</p>
                                <div className="relative">
                                    <input 
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-14 pl-4 pr-10 text-base" 
                                        type="number" 
                                        placeholder="0"
                                        value={materialCost}
                                        onChange={(e) => setMaterialCost(e.target.value)} 
                                        onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    />
                                    <span className="absolute right-4 top-4 text-slate-400 text-sm">원</span>
                                </div>
                            </label>
                            <label className="flex flex-col">
                                <p className="text-slate-700 dark:text-slate-300 text-sm font-bold pb-1.5 ml-1">노무비 (단가)</p>
                                <div className="relative">
                                    <input 
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-14 pl-4 pr-10 text-base" 
                                        type="number" 
                                        placeholder="0"
                                        value={laborCost}
                                        onChange={(e) => setLaborCost(e.target.value)} 
                                        onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    />
                                    <span className="absolute right-4 top-4 text-slate-400 text-sm">원</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Account Settings Section */}
                <div className="px-4 py-2">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">account_balance</span>
                            <h4 className="font-bold text-[#0d141b] dark:text-white">입금 계좌 정보</h4>
                        </div>
                        <div className="space-y-4">
                            <label className="flex flex-col">
                                <p className="text-xs font-bold text-slate-500 mb-1 ml-1">은행명 <span className="text-red-500">*</span></p>
                                <input 
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 h-12 px-4 font-medium" 
                                    type="text" 
                                    placeholder="예: 신한은행"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                />
                            </label>
                             <label className="flex flex-col">
                                <p className="text-xs font-bold text-slate-500 mb-1 ml-1">계좌번호 <span className="text-red-500">*</span></p>
                                <input 
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 h-12 px-4 font-medium" 
                                    type="text" 
                                    placeholder="예: 110-123-456789"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                />
                            </label>
                             <label className="flex flex-col">
                                <p className="text-xs font-bold text-slate-500 mb-1 ml-1">예금주 <span className="text-red-500">*</span></p>
                                <input 
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 h-12 px-4 font-medium" 
                                    type="text" 
                                    placeholder="예: Ucraft"
                                    value={accountHolder}
                                    onChange={(e) => setAccountHolder(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar - Activated based on items.length > 0 */}
            <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-8 pt-4 px-6 z-50">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">예상 총액</span>
                        <span className="text-xl font-black text-[#0d141b] dark:text-white">
                            {CURRENCY_FORMAT.format(totalEstimatedPrice)}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleAddItem}
                            className="flex-1 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-base font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_box</span>
                            항목 추가
                        </button>
                        <button 
                            onClick={handleReview} 
                            disabled={!isFormValid}
                            className={`flex-1 text-base font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2
                                ${isFormValid 
                                    ? 'bg-primary text-white shadow-primary/30 active:scale-[0.98]' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">checklist</span>
                            견적 확인
                        </button>
                    </div>
                </div>
            </div>

            {/* Template Selection Modal */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center animate-fade-in">
                    <div className="w-full max-w-[480px] h-[70vh] bg-background-light dark:bg-background-dark sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                        <div className="flex justify-center py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 cursor-pointer" onClick={() => setIsTemplateModalOpen(false)}>
                            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-[#0d141b] dark:text-slate-100">견적 템플릿</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">프로젝트에 맞는 템플릿을 선택하세요.</p>
                            </div>
                            <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
                            {ESTIMATE_TEMPLATES.map((template) => (
                                <div 
                                    key={template.id} 
                                    onClick={() => handleApplyTemplate(template)}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold tracking-wide uppercase">{template.category}</span>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">add_circle</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#0d141b] dark:text-slate-100 mb-1">{template.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{template.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-sm">list</span>
                                        <span>포함 항목: {template.items.length}개</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Library Selection Modal */}
            {isLibraryModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center animate-fade-in">
                    <div className="w-full max-w-[480px] h-[80vh] bg-background-light dark:bg-background-dark sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                        <div className="flex justify-center py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 cursor-pointer" onClick={() => setIsLibraryModalOpen(false)}>
                            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-[#0d141b] dark:text-slate-100">라이브러리 선택</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">입력할 항목을 선택해주세요.</p>
                            </div>
                             <button onClick={() => setIsLibraryModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                             <div className="flex px-4 gap-2 overflow-x-auto no-scrollbar py-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setLibraryCategory(cat)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                                            libraryCategory === cat 
                                            ? 'bg-primary text-white' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
                            {filteredLibraryItems.length > 0 ? (
                                filteredLibraryItems.map((item) => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleSelectLibraryItem(item)}
                                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.99] transition-transform cursor-pointer flex gap-4 items-center group"
                                    >
                                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                             <span className="material-symbols-outlined">
                                                {item.category === '목공' ? 'construction' : item.category === '타일' ? 'grid_view' : 'inventory_2'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-bold text-[#0d141b] dark:text-slate-100 truncate">{item.name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.description}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-primary">{CURRENCY_FORMAT.format(item.price)}</p>
                                            <p className="text-[10px] text-slate-400">/{item.unit}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">find_in_page</span>
                                    <p className="text-sm">해당 카테고리에 항목이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center animate-fade-in">
                    <div className="w-full max-w-[480px] h-[95vh] bg-background-light dark:bg-background-dark sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsPreviewOpen(false)} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <span className="material-symbols-outlined text-[#0d141b] dark:text-white">close</span>
                                </button>
                                <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">견적서 미리보기</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={handleDownloadPDF} className="flex size-10 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                                    <span className="material-symbols-outlined text-primary">download</span>
                                </button>
                            </div>
                        </div>

                        {/* Template Selector */}
                         <div className="bg-white dark:bg-slate-900 p-2 border-b border-slate-200 dark:border-slate-800 flex justify-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
                            <button 
                                onClick={() => setPrintTemplate('A')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${printTemplate === 'A' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                            >
                                표준형 (기본)
                            </button>
                            <button 
                                onClick={() => setPrintTemplate('B')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${printTemplate === 'B' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                            >
                                모던형 (블루)
                            </button>
                            <button 
                                onClick={() => setPrintTemplate('C')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${printTemplate === 'C' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                            >
                                심플형 (라인)
                            </button>
                        </div>
                        
                        {/* Content (Scrollable) */}
                        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-4">
                            <div className="overflow-x-auto no-scrollbar">
                                <div id="preview-pdf-container" className="bg-white shadow-lg min-w-[595px] px-14 py-10 text-slate-900 box-border flex flex-col relative mx-auto">
                                     {printTemplate === 'A' && <TemplateA />}
                                     {printTemplate === 'B' && <TemplateB />}
                                     {printTemplate === 'C' && <TemplateC />}
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer Actions */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0 pb-10">
                            <button onClick={() => setIsPreviewOpen(false)} className="flex-1 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold active:scale-[0.98] transition-transform">
                                수정하기
                            </button>
                            <button onClick={handleFinalSave} className="flex-[2] py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
                                저장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
