import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { MOCK_LIBRARY, CURRENCY_FORMAT } from '../constants';
import { LibraryItem } from '../types';

export const Library: React.FC = () => {
    const navigate = useNavigate();
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    
    // Category Filtering State
    const [activeCategory, setActiveCategory] = useState<'전체' | '목공' | '타일' | '자재' | '기타'>('전체');
    const [searchQuery, setSearchQuery] = useState('');

    // Selection Mode State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const categories: ('전체' | '목공' | '타일' | '자재' | '기타')[] = ['전체', '목공', '타일', '자재', '기타'];

    const filteredItems = useMemo(() => {
        let items = MOCK_LIBRARY;
        
        if (activeCategory !== '전체') {
            items = items.filter(item => item.category === activeCategory);
        }
        
        if (searchQuery.trim()) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return items;
    }, [activeCategory, searchQuery]);

    const handleAddItemToEstimate = (item: LibraryItem) => {
        if (isSelectionMode) {
            toggleSelection(item.id);
        } else {
            // Navigate to form with the selected item data (Single Item Mode)
            navigate('/form', { state: { selectedLibraryItem: item } });
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleCreateNewEstimate = () => {
        navigate('/form');
    };

    const toggleSelectionMode = () => {
        if (isSelectionMode) {
            // Cancel selection
            setIsSelectionMode(false);
            setSelectedIds(new Set());
        } else {
            // Start selection
            setIsSelectionMode(true);
        }
    };

    const handleBulkAdd = () => {
        const selectedItems = MOCK_LIBRARY.filter(item => selectedIds.has(item.id));
        navigate('/form', { state: { selectedLibraryItems: selectedItems } });
    };

    return (
        <Layout>
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center p-4 justify-between">
                    <div className="text-[#0d141b] dark:text-slate-100 flex size-10 items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </div>
                    <h2 className="text-[#0d141b] dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">자재 및 공종 라이브러리</h2>
                    <div className="flex items-center justify-end">
                        <button 
                            onClick={toggleSelectionMode}
                            className={`flex items-center justify-center rounded-lg h-9 px-3 text-sm font-bold transition-colors ${
                                isSelectionMode 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                                : 'text-primary hover:bg-primary/5'
                            }`}
                        >
                            {isSelectionMode ? '취소' : '선택'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="px-4 py-3 bg-white dark:bg-background-dark flex flex-col gap-3">
                <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-primary transition-all">
                        <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input 
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141b] dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-transparent placeholder:text-slate-500 dark:placeholder:text-slate-400 px-3 text-base font-normal" 
                            placeholder="항목 검색..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pr-4 cursor-pointer">
                            <span className="material-symbols-outlined text-sm">tune</span>
                        </div>
                    </div>
                </label>
                {!isSelectionMode && (
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/bulk-upload')} className="flex-1 flex items-center justify-center gap-2 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-sm active:scale-[0.98] transition-all">
                            <span className="material-symbols-outlined text-xl">upload_file</span>
                            엑셀 업로드
                        </button>
                        <button onClick={() => setIsAdjustmentModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-primary font-semibold text-sm shadow-sm active:scale-[0.98] transition-all">
                            <span className="material-symbols-outlined text-xl">trending_up</span>
                            단가 일괄 조정
                        </button>
                    </div>
                )}
            </div>

            {/* Pill Style Category Bar matching the reference image */}
            <nav className="flex gap-3 p-4 bg-white dark:bg-background-dark overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 cursor-pointer transition-all duration-200 ${
                            activeCategory === cat 
                            ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <p className="text-sm leading-normal">{cat}</p>
                    </button>
                ))}
            </nav>

            <div className="flex flex-col pb-32">
                <div className="px-4 pt-6 pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {activeCategory} 라이브러리 ({filteredItems.length})
                    </h3>
                </div>
                
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => handleAddItemToEstimate(item)}
                            className={`group flex items-center gap-4 mx-4 my-2 p-3 rounded-xl border shadow-sm transition-all active:scale-[0.98] cursor-pointer
                                ${isSelectionMode && selectedIds.has(item.id) 
                                    ? 'bg-primary/5 border-primary ring-1 ring-primary dark:bg-primary/10' 
                                    : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:shadow-md'
                                }`}
                        >
                            {isSelectionMode ? (
                                <div className={`flex items-center justify-center size-6 rounded-full border transition-colors shrink-0 ${
                                    selectedIds.has(item.id) 
                                        ? 'bg-primary border-primary' 
                                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                                }`}>
                                    {selectedIds.has(item.id) && <span className="material-symbols-outlined text-white text-base font-bold">check</span>}
                                </div>
                            ) : (
                                <div className={`text-primary flex items-center justify-center rounded-xl bg-primary/10 shrink-0 size-14 ${item.isFavorite ? 'ring-2 ring-primary/20' : ''}`}>
                                    <span className="material-symbols-outlined text-3xl">
                                        {item.category === '목공' ? 'construction' : 
                                         item.category === '타일' ? 'grid_view' : 
                                         item.category === '자재' ? 'inventory_2' : 'architecture'}
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex flex-col justify-center flex-1">
                                <p className="text-[#0d141b] dark:text-slate-100 text-base font-semibold leading-tight line-clamp-1">{item.name}</p>
                                <p className="text-primary text-sm font-bold mt-1">{CURRENCY_FORMAT.format(item.price)} / {item.unit}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                            </div>
                            
                            {!isSelectionMode && (
                                <div className="shrink-0">
                                    <button className="flex items-center justify-center rounded-lg h-9 w-9 bg-primary text-white shadow-sm hover:bg-blue-600 transition-colors">
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-slate-400 flex flex-col items-center">
                        <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inventory</span>
                        <p className="text-sm">해당 조건에 맞는 아이템이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button (Default Mode) */}
            {!isSelectionMode && (
                <div className="fixed bottom-24 right-6 max-w-[480px]">
                    <button 
                        onClick={handleCreateNewEstimate}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all duration-200"
                    >
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </button>
                </div>
            )}

            {/* Selection Mode Bottom Bar */}
            {isSelectionMode && (
                <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 p-4 pb-8 z-50 animate-slide-up">
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setSelectedIds(new Set())}
                            disabled={selectedIds.size === 0}
                            className="flex-[1] h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            초기화
                        </button>
                        <button 
                            onClick={handleBulkAdd}
                            disabled={selectedIds.size === 0}
                            className="flex-[2] h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">add_circle</span>
                            {selectedIds.size}개 항목 추가하기
                        </button>
                    </div>
                </div>
            )}

            {/* Adjustment Modal (Omitted for brevity as it was mostly static UI, but kept logic) */}
            {isAdjustmentModalOpen && (
                <div className="absolute inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-[2px] animate-fade-in h-screen">
                    <div className="w-full bg-white dark:bg-[#1c2632] rounded-t-3xl shadow-2xl flex flex-col max-h-[90%] overflow-hidden animate-slide-up max-w-[480px]">
                        <div className="flex justify-center py-3" onClick={() => setIsAdjustmentModalOpen(false)}>
                            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                        </div>
                        <div className="px-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-[#0d141b] dark:text-slate-100 text-center">단가 일괄 조정</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">대상 항목을 선택하고 조정값을 입력하세요.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">조정 대상</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary bg-primary/5 text-primary text-sm font-bold">
                                        <span className="material-symbols-outlined text-lg">check_circle</span> 전체 항목
                                    </button>
                                    <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                                        <span className="material-symbols-outlined text-lg">category</span> 카테고리별
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">조정 수치</label>
                                <div className="flex items-center gap-3">
                                    <select className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm font-medium focus:ring-2 focus:ring-primary px-3">
                                        <option>퍼센트 (%)</option>
                                        <option>고정 금액 (₩)</option>
                                    </select>
                                    <div className="flex-[1.5] relative">
                                        <input className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold focus:ring-2 focus:ring-primary" type="number" defaultValue="5"/>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-primary">상승 (+)</button>
                                    <button className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-400">하락 (-)</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => setIsAdjustmentModalOpen(false)} className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 transition-colors">취소</button>
                            <button onClick={() => setIsAdjustmentModalOpen(false)} className="h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 transition-all">저장하기</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};