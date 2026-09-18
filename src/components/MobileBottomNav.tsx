import React from 'react';
import { Home, Users, Plus, Palmtree, Shield, Database } from 'lucide-react';
import { User } from '../types';
import { toPersianDigits } from '../services/fundService';

export type MainNavTab = 'dashboard' | 'queue' | 'entertainment' | 'admin' | 'schema';

interface MobileBottomNavProps {
  activeTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
  onOpenNewReceiptModal: () => void;
  currentUser: User;
  pendingReceiptsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenNewReceiptModal,
  currentUser,
  pendingReceiptsCount,
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.isDelegatedAdmin;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 shadow-lg safe-bottom md:hidden">
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around relative">
        {/* 1. Home / Dashboard */}
        <button
          id="mobile-nav-home"
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] ${
            activeTab === 'dashboard'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <Home className="w-4 h-4" strokeWidth={activeTab === 'dashboard' ? 2.2 : 1.7} />
          <span className="text-[10px] mt-1 whitespace-nowrap">پیشخوان</span>
        </button>

        {/* 2. Queue */}
        <button
          id="mobile-nav-queue"
          onClick={() => onChangeTab('queue')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] ${
            activeTab === 'queue'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <Users className="w-4 h-4" strokeWidth={activeTab === 'queue' ? 2.2 : 1.7} />
          <span className="text-[10px] mt-1 whitespace-nowrap">صف نوبت</span>
        </button>

        {/* 3. Sleek Minimal Center Action: Quick Pay & Receipt */}
        <div className="relative -top-2 flex flex-col items-center">
          <button
            id="mobile-nav-quickpay"
            onClick={onOpenNewReceiptModal}
            className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-600/30 active:scale-95 transition-transform"
            aria-label="ثبت فیش واریز جدید"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
            ثبت فیش
          </span>
        </div>

        {/* 4. Entertainment & Trips */}
        <button
          id="mobile-nav-entertainment"
          onClick={() => onChangeTab('entertainment')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] ${
            activeTab === 'entertainment'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <Palmtree className="w-4 h-4" strokeWidth={activeTab === 'entertainment' ? 2.2 : 1.7} />
          <span className="text-[10px] mt-1 whitespace-nowrap">تفریحات</span>
        </button>

        {/* 5. Admin / Schema */}
        {isAdmin ? (
          <button
            id="mobile-nav-admin"
            onClick={() => onChangeTab('admin')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] relative ${
              activeTab === 'admin'
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <div className="relative">
              <Shield className="w-4 h-4" strokeWidth={activeTab === 'admin' ? 2.2 : 1.7} />
              {pendingReceiptsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[12px] h-3 px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center animate-pulse tabular-nums">
                  {toPersianDigits(pendingReceiptsCount)}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 whitespace-nowrap">بانکداری</span>
          </button>
        ) : (
          <button
            id="mobile-nav-schema"
            onClick={() => onChangeTab('schema')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[50px] ${
              activeTab === 'schema'
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <Database className="w-4 h-4" strokeWidth={activeTab === 'schema' ? 2.2 : 1.7} />
            <span className="text-[10px] mt-1 whitespace-nowrap">معماری</span>
          </button>
        )}
      </div>
    </nav>
  );
};
