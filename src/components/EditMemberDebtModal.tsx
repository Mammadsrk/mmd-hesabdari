import React, { useState } from 'react';
import { Loan, User } from '../types';
import { formatToman } from '../services/fundService';
import { Edit3, X, Check, AlertCircle } from 'lucide-react';

interface EditMemberDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSubmit: (
    loanId: string,
    totalInstallments: number,
    paidInstallments: number,
    purposeNote: string
  ) => void;
}

export const EditMemberDebtModal: React.FC<EditMemberDebtModalProps> = ({
  isOpen,
  onClose,
  loan,
  onSubmit,
}) => {
  if (!isOpen || !loan) return null;

  const [totalInstallments, setTotalInstallments] = useState<number>(loan.totalInstallments);
  const [paidInstallments, setPaidInstallments] = useState<number>(loan.paidInstallments);
  const [purposeNote, setPurposeNote] = useState<string>(loan.purposeNote || '');

  const remainingInstallments = Math.max(0, totalInstallments - paidInstallments);
  const estimatedDebtLeft = remainingInstallments * loan.monthlyInstallmentAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalInstallments < 1) {
      alert('تعداد کل اقساط باید حداقل ۱ باشد.');
      return;
    }
    if (paidInstallments > totalInstallments) {
      alert('اقساط پرداخت شده نمی‌تواند بیشتر از کل اقساط باشد.');
      return;
    }

    onSubmit(loan.id, totalInstallments, paidInstallments, purposeNote.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 text-right max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Edit3 className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                ویرایش و تنظیم اقساط وام
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                پرونده: {loan.memberName} ({loan.type === 'rotating' ? 'وام گردشی' : 'وام ضروری'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-3 flex-1">
          {/* Summary */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">اصل وام:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatToman(loan.principalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">مبلغ هر قسط:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatToman(loan.monthlyInstallmentAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                تعداد کل اقساط
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                اقساط پرداخت شده
              </label>
              <input
                type="number"
                min="0"
                max={totalInstallments}
                value={paidInstallments}
                onChange={(e) => setPaidInstallments(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Computed Debt */}
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs flex items-center justify-between">
            <span className="text-amber-900 dark:text-amber-300">مانده بدهی محاسبه‌شده:</span>
            <span className="font-bold text-amber-900 dark:text-amber-200">{formatToman(estimatedDebtLeft)}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              یادداشت یا علت تعدیل اقساط
            </label>
            <input
              type="text"
              value={purposeNote}
              onChange={(e) => setPurposeNote(e.target.value)}
              placeholder="مثلاً: تعدیل اقساط با هماهنگی پدر"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره تغییرات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
