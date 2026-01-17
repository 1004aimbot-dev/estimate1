import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { MOCK_LIBRARY, CURRENCY_FORMAT } from '../constants';
import { LibraryItem } from '../types';

export const Library: React.FC = () => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    // Category Filtering State
    const [activeCategory, setActiveCategory] = useState<'전체' | '목공' | '타일' | '자재' | '기타'>('전체');
    const [searchQuery, setSearchQuery] = useState('');

    // Selection Mode State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const categories: ('전체' | '목공' | '타일' | '자재' | '기타')[] = ['전체', '목공', '타일', '자재', '기타'];

    // Scroll tracking for "Back to Top" button
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) setShowBackToTop(true);
            else setShowBackToTop(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    // Group items by category for "All" view
    const groupedItems = useMemo(() => {
        const groups: Record<string, LibraryItem[]> = {
            '목공': filteredItems.filter(i => i.category === '목공'),
            '타일': filteredItems.filter(i => i.category === '타일'),
            '자재': filteredItems.filter(i => i.category === '자재'),
            '기타': filteredItems.filter(i => i.category === '기타'),
        };
        return groups;
    }, [filteredItems]);

    const handleCategoryClick = (cat: typeof activeCategory) => {
        setActiveCategory(cat);
        if (cat === '전체') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Smooth scroll to the specific category section ID
            setTimeout(() => {
                const element = document.getElementById(`section-${cat}`);
                if (element) {
                    const offset = 140; // Sticky header offset
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    };

    const handleAddItemToEstimate = (item: LibraryItem) => {
        if (isSelectionMode) {
            toggleSelection(item.id);
        } else {
            navigate('/form', { state: { selectedLibraryItem: item } });
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const toggleSelectionMode = () => {
        if (isSelectionMode) {
            setIsSelectionMode(false);
            setSelectedIds(new Set());
        } else {
            setIsSelectionMode(true);
        }
    };

    const handleBulkAdd = () => {
        const selectedItems = MOCK_LIBRARY.filter(item => selectedIds.has(item.id));
        navigate('/form', { state: { selectedLibraryItems: selectedItems } });
    };

    const renderItemCard = (item: LibraryItem) => (
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
            
            <div className="flex flex-col justify-center flex-1 min-w-0">
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
    );

    return (
        <Layout>
            <header className="sticky top-0 z-30 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center p-4 justify-between">
                    <div className="text-[#0d141b] dark:text-slate-100 flex size-10 items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </div>
                    <h2 className="text-[#0d141b] dark:text-slate-100 text-lg font-bold flex-1 text-center">라이브러리</h2>
                    <div className="flex items-center justify-end">
                        <button onClick={toggleSelectionMode} className="text-primary text-sm font-bold h-9 px-3 hover:bg-primary/5 rounded-lg transition-colors">
                            {isSelectionMode ? '취소' : '선택'}
                        </button>
                    </div>
                </div>
                
                {/* Fixed Pills Navigation for Smooth Scrolling */}
                <nav className="flex gap-2 p-3 overflow-x-auto no-scrollbar bg-white dark:bg-background-dark">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 cursor-pointer transition-all duration-200 ${
                                activeCategory === cat 
                                ? 'bg-primary text-white shadow-md font-bold' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200'
                            }`}
                        >
                            <span className="text-sm whitespace-nowrap">{cat}</span>
                        </button>
                    ))}
                </nav>
            </header>

            <div className="px-4 py-3 bg-white dark:bg-background-dark sticky top-[108px] z-20 shadow-sm border-b border-slate-100 dark:border-slate-800">
                <div className="flex w-full items-stretch rounded-xl h-12 bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-primary transition-all">
                    <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input 
                        className="flex w-full flex-1 bg-transparent border-none focus:ring-0 text-base font-normal px-3 placeholder:text-slate-400" 
                        placeholder="항목 검색..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col pb-40">
                {activeCategory === '전체' ? (
                    // Grouped view for "All" with anchor targets
                    // Fix: Explicitly cast Object.entries result to handle 'unknown' type for items
                    (Object.entries(groupedItems) as [string, LibraryItem[]][]).map(([category, items]) => (
                        <div key={category} id={`section-${category}`} className="scroll-mt-40">
                            <div className="sticky top-[160px] z-10 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">
                                        {category === '목공' ? 'construction' : category === '타일' ? 'grid_view' : category === '자재' ? 'inventory_2' : 'architecture'}
                                    </span>
                                    {category} ({items.length})
                                </h3>
                            </div>
                            {items.length > 0 ? (
                                items.map(item => renderItemCard(item))
                            ) : (
                                <div className="p-10 text-center text-slate-400 text-xs">표시할 항목이 없습니다.</div>
                            )}
                        </div>
                    ))
                ) : (
                    // Single category view
                    <div className="pt-4">
                        {filteredItems.map(item => renderItemCard(item))}
                        {filteredItems.length === 0 && (
                            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
                                <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inventory</span>
                                <p className="text-sm">검색 결과가 없습니다.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Back to Top Floating Button */}
            {showBackToTop && (
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 h-10 px-4 rounded-full bg-slate-800/80 backdrop-blur text-white text-xs font-bold shadow-xl z-40 flex items-center gap-2 animate-fade-in"
                >
                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    맨 위로
                </button>
            )}

            {/* Selection Mode Bottom Bar */}
            {isSelectionMode && (
                <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 p-4 pb-8 z-50 animate-slide-up">
                    <button 
                        onClick={handleBulkAdd}
                        disabled={selectedIds.size === 0}
                        className="w-full h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        {selectedIds.size}개 항목 견적에 추가
                    </button>
                </div>
            )}
        </Layout>
    );
};