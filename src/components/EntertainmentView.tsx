import React, { useState } from 'react';
import { FundWallets, EntertainmentExpense, User } from '../types';
import { formatToman, toPersianDigits } from '../services/fundService';
import { Palmtree, Sparkles, Plus, Calendar, MapPin, Trash2, CheckCircle2 } from 'lucide-react';

interface EntertainmentViewProps {
  wallets: FundWallets;
  expenses: EntertainmentExpense[];
  currentUser: User;
  onOpenDisburseModal: () => void;
  onDeleteExpense?: (expenseId: string) => void;
}

export const EntertainmentView: React.FC<EntertainmentViewProps> = ({
  wallets,
  expenses,
  currentUser,
  onOpenDisburseModal,
  onDeleteExpense,
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.isDelegatedAdmin;
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleConfirmDelete = (id: string) => {
    if (onDeleteExpense) {
      onDeleteExpense(id);
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-1 sm:px-0 text-slate-900 dark:text-slate-100">
      {/* Hero Card: Golden / Emerald Theme with Dark Mode Polish */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-600/95 via-emerald-700/90 to-teal-800/95 backdrop-blur-xl p-4.5 sm:p-5 text-white shadow-lg shadow-emerald-950/20 relative overflow-hidden border border-emerald-600/30">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-100 border border-white/20">
                <Palmtree className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-amber-100 block">صندوق تفریحات و سفرهای خانوادگی</span>
                <span className="text-[10px] text-white/80">تامین شده از ۲٪ کارمزد مصوب اقساط وام‌ها</span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold text-amber-100 border border-white/20">
              ویژه دورهمی‌ها
            </span>
          </div>

          <div className="mt-4">
            <div className="text-[11px] text-amber-100/90 font-medium">موجودی آماده مصرف برای سفر بعدی:</div>
            <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-normal text-white mt-1">
              {formatToman(wallets.entertainmentFundBalance)}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-white/80 text-[11px]">کل برنامه‌های ثبت شده:</span>
            <span className="font-bold text-amber-200 text-xs tabular-nums">{toPersianDigits(expenses.length)} مورد</span>
          </div>
        </div>
      </div>

      {/* Admin Disburse CTA Button */}
      {isAdmin && (
        <button
          onClick={onOpenDisburseModal}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-1.5 active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت هزینه جدید برای دورهمی یا مسافرت</span>
        </button>
      )}

      {/* Concept Explanation Card */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/50 dark:border-amber-800/50">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">فلسفه وجودی صندوق تفریحات</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              از هر قسط وام‌های گردشی، سود ۲٪ کارمزد مستقیماً به این حساب واریز می‌شود تا صرف مسافرت‌های دسته‌جمعی، ویلا، دورهمی یا هدیه به اعضای خانواده شود.
            </p>
          </div>
        </div>
      </div>

      {/* Past Trips & Events Stream */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              سوابق هزینه‌کرد و برنامه‌ها
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{expenses.length} ردیف</span>
        </div>

        {expenses.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            هنوز هزینه‌ای از این صندوق ثبت نشده است.
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80 dark:divide-slate-800/80 mt-1">
            {expenses.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60 dark:border-amber-900/60">
                    <Palmtree className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>تایید: {item.registeredBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-left shrink-0">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                      - {formatToman(item.amount)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/60 inline-block mt-0.5">
                      انجام شده
                    </span>
                  </div>

                  {/* Delete Expense Action for Admin */}
                  {isAdmin && (
                    <div>
                      {deletingId === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleConfirmDelete(item.id)}
                            title="تایید حذف و برگشت وجه"
                            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold active:scale-95 transition"
                          >
                            حذف
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] active:scale-95 transition"
                          >
                            لغو
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(item.id)}
                          title="حذف هزینه و استرداد مبلغ به صندوق تفریحات"
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
