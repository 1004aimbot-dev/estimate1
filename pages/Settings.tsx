
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { GoogleGenAI } from "@google/genai";

export const Settings: React.FC = () => {
    const navigate = useNavigate();
    
    // API key must be obtained exclusively from process.env.API_KEY
    const hasApiKey = !!process.env.API_KEY && process.env.API_KEY.length > 0;

    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');

    const handleTestConnection = async () => {
        // Critical: Always initialize right before use to ensure the latest key is used if applicable
        if (!process.env.API_KEY) {
            setTestStatus('error');
            setTestMessage('API 키가 설정되어 있지 않습니다.');
            return;
        }
        
        setTestStatus('loading');
        setTestMessage('');

        try {
            // Must use named parameter for apiKey initialization
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Verifying connection using gemini-3-flash-preview as per task type recommendations
            await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: 'Hello',
            });
            setTestStatus('success');
            setTestMessage('AI 서비스에 정상적으로 연결되었습니다.');
        } catch (error: any) {
            console.error("API Connection Test Failed:", error);
            setTestStatus('error');
            
            let msg = error.message || '알 수 없는 오류가 발생했습니다.';
            if (msg.includes('400') || msg.toLowerCase().includes('key')) {
                msg = 'API 키가 유효하지 않습니다. 관리자에게 문의하세요. (400 Bad Request)';
            } else if (msg.includes('404')) {
                msg = '모델을 찾을 수 없거나 접근 권한이 부족합니다. (404 Not Found)';
            } else if (msg.includes('403')) {
                msg = 'API 사용 권한이 없거나 할당량이 초과되었습니다. (403 Forbidden)';
            } else if (msg.includes('Failed to fetch') || msg.includes('Network')) {
                msg = '네트워크 연결에 실패했습니다. 인터넷 상태를 확인해주세요.';
            }
            setTestMessage(msg);
        }
    };

    return (
        <Layout>
             <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center h-12 justify-between">
                    <div className="text-[#0d141b] dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
                    </div>
                    <h2 className="text-[#0d141b] dark:text-slate-100 text-lg font-bold">설정</h2>
                     <div className="w-12"></div>
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* AI Service Status Section */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-base font-bold text-[#0d141b] dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">auto_awesome</span>
                        AI 서비스 상태
                    </h3>
                    
                    <div className={`flex items-center justify-between p-4 rounded-lg border mb-4 transition-colors ${
                        hasApiKey 
                        ? (testStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700')
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                        <div className="flex items-center gap-3">
                             <div className={`size-3 rounded-full ${
                                 !hasApiKey ? 'bg-red-500' : 
                                 testStatus === 'success' ? 'bg-green-500' : 
                                 testStatus === 'error' ? 'bg-red-500' : 'bg-slate-400'
                             }`}></div>
                             <span className={`font-bold text-sm ${
                                 !hasApiKey ? 'text-red-700 dark:text-red-400' : 
                                 testStatus === 'success' ? 'text-green-700 dark:text-green-400' : 
                                 'text-slate-700 dark:text-slate-300'
                             }`}>
                                {!hasApiKey 
                                    ? 'API 키 구성 필요' 
                                    : testStatus === 'success' 
                                        ? '서비스가 활성화되었습니다' 
                                        : '서비스 준비 완료'}
                             </span>
                        </div>
                        {testStatus === 'success' && (
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={handleTestConnection}
                            disabled={testStatus === 'loading'}
                            className="w-full h-11 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
                        >
                            {testStatus === 'loading' && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>}
                            {testStatus === 'loading' ? '확인 중...' : '서비스 연결 상태 확인'}
                        </button>

                        {testStatus === 'success' && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
                                <p className="text-xs font-medium text-green-700 dark:text-green-400 text-center">{testMessage}</p>
                            </div>
                        )}

                        {testStatus === 'error' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fade-in">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 mt-0.5 shrink-0">error</span>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-red-800 dark:text-red-300">연결 오류</p>
                                    <p className="text-xs text-red-700 dark:text-red-400 mt-1 leading-relaxed">{testMessage}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* App Info Section */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-base font-bold text-[#0d141b] dark:text-white mb-4">앱 정보</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">버전</span>
                            <span className="font-medium text-[#0d141b] dark:text-white">1.0.0</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">엔진</span>
                            <span className="font-medium text-[#0d141b] dark:text-white">Gemini 3 Flash</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
