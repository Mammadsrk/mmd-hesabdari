import React, { useState } from 'react';
import { Loan, User } from '../types';
import { formatToman } from '../services/fundService';
import { CreditCard, CheckCircle2, X, Wallet, Calendar, AlertCircle } from 'lucide-react';

interface ManualInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[];
  users: User[];
  preselectedLoanId?: string;
  onSubmit: (
    loanId: string,
    installmentsCount: number,
    paymentMethod: 'cash' | 'card_to_card' | 'bank_transfer',
    notes: string,
    customAmount?: number
  ) => void;
}

export const ManualInstallmentModal: React.FC<ManualInstallmentModalProps> = ({
  isOpen,
  onClose,
  loans,
  users,
  preselectedLoanId,
  onSubmit,
}) => {
  const activeLoans = loans.filter((l) => l.status === 'active');
  const [selectedLoanId, setSelectedLoanId] = useState<string>(() => {
    return preselectedLoanId || (activeLoans[0]?.id ?? '');
  });

  const targetLoan = loans.find((l) => l.id === selectedLoanId);
  const remainingInstallments = targetLoan
    ? targetLoan.totalInstallments - targetLoan.paidInstallments
    : 0;

  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_to_card' | 'bank_transfer'>('card_to_card');
  const [useCustomAmount, setUseCustomAmount] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const standardTotal = (targetLoan?.monthlyInstallmentAmount || 0) * installmentsCount;
  const finalAmount = useCustomAmount
    ? parseInt(customAmount.replace(/,/g, ''), 10) || 0
    : standardTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLoan) {
      alert('لطفاً یک وام فعال را انتخاب کنید.');
      return;
    }
    if (installmentsCount < 1) {
      alert('حداقل ۱ قسط باید ثبت شود.');
      return;
    }

    onSubmit(
      targetLoan.id,
      installmentsCount,
      paymentMethod,
      notes.trim(),
      useCustomAmount ? finalAmount : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 text-right max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Mobile Pull Bar */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                ثبت دستی پرداخت قسط
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                کسر از مانده بدهی عضو بدون نیاز به ثبت فیش توسط ایشان
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {activeLoans.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            در حال حاضر هیچ وام فعالی با اقساط پرداخت‌نشده وجود ندارد.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-3 flex-1">
            {/* Select Loan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                انتخاب پرونده وام و عضو
              </label>
              <select
                value={selectedLoanId}
                onChange={(e) => {
                  setSelectedLoanId(e.target.value);
                  setInstallmentsCount(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                {activeLoans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.memberName} — {loan.type === 'rotating' ? 'وام گردشی' : 'وام ضروری'} (
                    {loan.paidInstallments}/{loan.totalInstallments} قسط پرداخت شده)
                  </option>
                ))}
              </select>
            </div>

            {/* Target Loan Summary Card */}
            {targetLoan && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>مبلغ هر قسط:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatToman(targetLoan.monthlyInstallmentAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>اقساط باقیمانده:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {remainingInstallments} قسط
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>مانده کل بدهی فعلی:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {formatToman(
                      (targetLoan.totalInstallments - targetLoan.paidInstallments) *
                        targetLoan.monthlyInstallmentAmount
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Installments Count Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تعداد اقساط پرداختی در این مرحله
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    type="button"
                    key={num}
                    disabled={num > remainingInstallments}
                    onClick={() => setInstallmentsCount(num)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      installmentsCount === num
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 disabled:opacity-30'
                    }`}
                  >
                    {num} قسط
                  </button>
                ))}
                {remainingInstallments > 3 && (
                  <button
                    type="button"
                    onClick={() => setInstallmentsCount(remainingInstallments)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      installmentsCount === remainingInstallments
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    تسویه کل ({remainingInstallments})
                  </button>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                نحوه دریافت وجه توسط پدر
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card_to_card')}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    paymentMethod === 'card_to_card'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  کارت‌به‌کارت
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  نقدی دستی
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  انتقال پایا / چک
                </button>
              </div>
            </div>

            {/* Total Calculated Amount */}
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 block font-medium">
                  مبلغ دریافتی جهت ثبت:
                </span>
                <span className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  {formatToman(finalAmount)}
                </span>
              </div>
              <div className="text-[11px] text-right text-emerald-700 dark:text-emerald-400">
                <span>وضعیت پس از ثبت: </span>
                <span className="font-bold">
                  {(targetLoan?.paidInstallments || 0) + installmentsCount} از{' '}
                  {targetLoan?.totalInstallments} قسط
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                توضیحات / شماره پیگیری دستی
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: تحویل نقدی در دورهمی جمعه"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex-2 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ثبت قطعی پرداخت قسط</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
