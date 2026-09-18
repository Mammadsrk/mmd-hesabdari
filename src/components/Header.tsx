import React from 'react';
import { User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Shield, Bell, ChevronDown, Sun, Moon, Sparkles } from 'lucide-react';
import { MainNavTab } from './MobileBottomNav';
import { toPersianDigits } from '../services/fundService';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onOpenUserSwitcher: () => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  activeTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenUserSwitcher,
  unreadNotifsCount,
  onOpenNotifications,
  activeTab,
  onChangeTab,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.isDelegatedAdmin;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div className="max-w-xl md:max-w-4xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Brand & App Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <Shield className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  صندوق پس‌انداز خانوادگی
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-[10px] font-semibold border border-teal-200 dark:border-teal-800">
                  PWA
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                وام‌های نوبتی، ضروری و تفریحات
              </p>
            </div>
          </div>

          {/* Right Actions (Minimalist & Compact) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Dark Mode Toggle */}
            <button
              id="header-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.8} />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" strokeWidth={1.8} />
              )}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Notification Bell */}
            <button
              id="header-notif-btn"
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="اعلان‌ها و هشدارها"
            >
              <Bell className="w-4 h-4" strokeWidth={1.8} />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse tabular-nums">
                  {toPersianDigits(unreadNotifsCount)}
                </span>
              )}
            </button>

            {/* User Switcher Pill */}
            <button
              id="header-user-switcher-chip"
              onClick={onOpenUserSwitcher}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 p-1 pr-1 pl-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="تغییر کاربر فعال خانواده"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-6 h-6 rounded-lg object-cover border border-slate-300 dark:border-slate-600 shrink-0"
              />
              <div className="text-right leading-none hidden xs:block">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-teal-600 dark:text-teal-400 font-medium">
                  {currentUser.role === 'admin'
                    ? 'مدیر (پدر)'
                    : currentUser.isDelegatedAdmin
                    ? 'مدیر کمکی'
                    : currentUser.familyRelation}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/70 text-xs">
          <button
            onClick={() => onChangeTab('dashboard')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            پیشخوان من
          </button>

          {isAdmin && (
            <button
              onClick={() => onChangeTab('admin')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeTab === 'admin'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>پنل بانکداری پدر</span>
            </button>
          )}

          <button
            onClick={() => onChangeTab('queue')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'queue'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            نوبت‌بندی وام‌ها
          </button>

          <button
            onClick={() => onChangeTab('entertainment')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'entertainment'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            صندوق تفریحات
          </button>

          <button
            onClick={() => onChangeTab('schema')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'schema'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            معماری دیتابیس
          </button>
        </div>
      </div>
    </header>
  );
};
