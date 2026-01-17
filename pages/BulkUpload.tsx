import React from 'react';
import { useNavigate } from 'react-router-dom';

export const BulkUpload: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] dark:text-slate-50 min-h-screen max-w-[480px] mx-auto">
            <div className="sticky top-0 z-50 flex items-center bg-white dark:bg-[#1a2632] p-4 border-b border-slate-200 dark:border-slate-800 justify-between">
                <div className="flex items-center gap-3">
                    <span onClick={() => navigate(-1)} className="material-symbols-outlined cursor-pointer text-[#0d141b] dark:text-white">arrow_back_ios</span>
                    <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-tight">엑셀 대량 업로드</h2>
                </div>
                <div className="flex size-6 shrink-0 items-center justify-center">
                    <span className="material-symbols-outlined text-sm">more_horiz</span>
                </div>
            </div>

            <div className="pb-24">
                <div className="px-4 pt-6 pb-2">
                    <h3 className="text-[#0d141b] dark:text-white tracking-tight text-2xl font-bold leading-tight">자재 라이브러리 일괄 등록</h3>
                    <p className="text-[#4c739a] dark:text-slate-400 text-sm font-normal leading-normal mt-2">
                        엑셀 파일을 활용하여 대량의 자재 데이터를 한 번에 업로드하고 효율적으로 관리하세요.
                    </p>
                </div>

                <div className="p-4">
                    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2632] p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">download_for_offline</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[#0d141b] dark:text-white text-base font-bold leading-tight">샘플 양식 다운로드</p>
                                <p className="text-[#4c739a] dark:text-slate-400 text-xs font-normal leading-normal">정확한 데이터 등록을 위해 반드시 지정된 양식을 사용해 주세요.</p>
                            </div>
                        </div>
                        <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal transition-opacity hover:opacity-90">
                            <span className="truncate">양식 다운로드 (xlsx)</span>
                        </button>
                    </div>
                </div>

                <div className="px-4">
                    <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-[#1a2632] px-6 py-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
                                <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight">엑셀 파일 업로드</p>
                                <p className="text-[#4c739a] dark:text-slate-400 text-xs font-normal leading-normal text-center">
                                    파일을 터치하여 선택하거나 이 영역으로 끌어다 놓으세요.
                                </p>
                            </div>
                        </div>
                        <button className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-[#e7edf3] dark:bg-slate-800 text-[#0d141b] dark:text-white text-sm font-bold leading-normal">
                            <span className="truncate">엑셀 파일 선택</span>
                        </button>
                    </div>
                </div>

                <div className="px-4 pt-8">
                    <h4 className="text-[#0d141b] dark:text-white text-sm font-bold uppercase tracking-wider mb-4 px-1">데이터 작성 가이드</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-white dark:bg-[#1a2632] rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white font-bold text-sm">A</div>
                            <div>
                                <p className="text-sm font-bold text-[#0d141b] dark:text-white">카테고리</p>
                                <p className="text-xs text-[#4c739a] dark:text-slate-400">목공, 타일, 전기, 도장 등 분류명</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-3 bg-white dark:bg-[#1a2632] rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white font-bold text-sm">B</div>
                            <div>
                                <p className="text-sm font-bold text-[#0d141b] dark:text-white">품명</p>
                                <p className="text-xs text-[#4c739a] dark:text-slate-400">자재의 정확한 명칭 및 규격</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-3 bg-white dark:bg-[#1a2632] rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white font-bold text-sm">C</div>
                            <div>
                                <p className="text-sm font-bold text-[#0d141b] dark:text-white">단위</p>
                                <p className="text-xs text-[#4c739a] dark:text-slate-400">㎡, box, ea, m 등 사용 단위</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-3 bg-white dark:bg-[#1a2632] rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white font-bold text-sm">D</div>
                            <div>
                                <p className="text-sm font-bold text-[#0d141b] dark:text-white">단가</p>
                                <p className="text-xs text-[#4c739a] dark:text-slate-400">숫자만 입력 (예: 25000)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

             <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 max-w-[480px] mx-auto">
                <div className="flex gap-3">
                    <button onClick={() => navigate(-1)} className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white font-bold text-sm">
                        취소
                    </button>
                    <button className="flex-[2] h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 transition-transform active:scale-95">
                        데이터 저장하기
                    </button>
                </div>
            </div>
        </div>
    );
};
