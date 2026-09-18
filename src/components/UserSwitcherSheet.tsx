import React from 'react';
import { User } from '../types';
import { formatToman } from '../services/fundService';
import { X, Check, Shield, User as UserIcon, Sparkles } from 'lucide-react';

interface UserSwitcherSheetProps {
  isOpen: boolean;
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export const UserSwitcherSheet: React.FC<UserSwitcherSheetProps> = ({
  isOpen,
  currentUser,
  allUsers,
  onSelectUser,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-5 text-right max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200 text-slate-900 dark:text-slate-100">
        {/* Mobile Pull Bar */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">تغییر کاربر فعال خانواده</h3>
              <p className="text-[10px] text-slate-400">مشاهده پنل از دیدگاه هر یک از اعضا</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hint banner */}
        <div className="my-2.5 p-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 text-[10px] text-teal-900 dark:text-teal-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>برای تست دسترسی پدر یا اعضای خانواده، روی نام عضو کلیک کنید.</span>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 py-1">
          {allUsers.map((user) => {
            const isSelected = user.id === currentUser.id;
            const isAdmin = user.role === 'admin';
            const isDelegated = user.isDelegatedAdmin;

            return (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl border text-right transition flex items-center justify-between gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    {isAdmin && (
                      <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Shield className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</span>
                      <span className="text-[10px] text-slate-400">({user.familyRelation})</span>
                      {isAdmin ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold">
                          مدیر اصلی (پدر)
                        </span>
                      ) : isDelegated ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold">
                          جانشین مدیر
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      حق عضویت: {formatToman(user.monthlyDueAmount)}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
