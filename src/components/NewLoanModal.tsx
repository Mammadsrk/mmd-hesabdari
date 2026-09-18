import React, { useState } from 'react';
import { User, LoanType, FundWallets } from '../types';
import { calculateLoanFigures, formatToman } from '../services/fundService';
import { X, Check, Calculator, AlertCircle } from 'lucide-react';

interface NewLoanModalProps {
  isOpen: boolean;
  type: LoanType;
  allUsers: User[];
  wallets: FundWallets;
  preselectedUserId?: string;
  onClose: () => void;
  onSubmit: (
    memberId: string,
    type: LoanType,
    principalAmount: number,
    profitRate: number,
    totalInstallments: number,
    dueDateDesc: string,
    purposeNote: string
  ) => void;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  isOpen,
  type,
  allUsers,
  wallets,
  preselectedUserId,
  onClose,
  onSubmit,
}) => {
  const members = allUsers.filter((u) => u.role === 'member');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    preselectedUserId || members[0]?.id || ''
  );
  const [principalAmount, setPrincipalAmount] = useState<number>(
    type === 'rotating' ? 20000000 : 5000000
  );
  const [profitRate, setProfitRate] = useState<number>(type === 'rotating' ? 2 : 0);
  const [totalInstallments, setTotalInstallments] = useState<number>(type === 'rotating' ? 10 : 2);
  const [dueDateDesc, setDueDateDesc] = useState<string>(
    type === 'rotating' ? '۱۰ هر ماه' : 'تسویه در ۲ ماه'
  );
  const [purposeNote, setPurposeNote] = useState<string>('');

  if (!isOpen) return null;

  const figures = calculateLoanFigures(principalAmount, profitRate, totalInstallments);
  const availableBalance =
    type === 'rotating' ? wallets.monthlyDuesBalance : wallets.emergencyFundBalance;
  const isBalanceSufficient = availableBalance >= principalAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanceSufficient) {
      alert('موجودی صندوق مربوطه برای اعطای این مبلغ کافی نیست');
      return;
    }
    onSubmit(
      selectedMemberId,
      type,
      principalAmount,
      profitRate,
      totalInstallments,
      dueDateDesc,
      purposeNote
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-right max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              اعطای {type === 'rotating' ? 'وام گردشی (نوبتی)' : 'وام ضروری (اورژانسی)'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              موجودی قابل پرداخت: <strong className="text-teal-700">{formatToman(availableBalance)}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs flex-1 overflow-y-auto pr-0.5">
          {/* Member Selection */}
          <div>
            <label className="font-black text-slate-700 block mb-1">عضو دریافت‌کننده وام:</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-hidden"
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.familyRelation})
                </option>
              ))}
            </select>
          </div>

          {/* Principal Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">اصل مبلغ وام (تومان):</label>
              <span className="text-teal-800 font-black">{formatToman(principalAmount)}</span>
            </div>
            <input
              type="number"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(Number(e.target.value))}
              step={1000000}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-slate-900 text-sm focus:ring-2 focus:ring-teal-500 outline-hidden"
              required
            />
          </div>

          {/* Fee / Profit rate */}
          {type === 'rotating' ? (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">کارمزد تفریحات (%):</label>
                <input
                  type="number"
                  value={profitRate}
                  onChange={(e) => setProfitRate(Number(e.target.value))}
                  step={0.5}
                  min={0}
                  max={10}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-hidden"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">تعداد اقساط (ماه):</label>
                <input
                  type="number"
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(Number(e.target.value))}
                  min={1}
                  max={24}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-hidden"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="font-bold text-slate-700 block mb-1">تعداد اقساط بازپرداخت:</label>
              <input
                type="number"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(Number(e.target.value))}
                min={1}
                max={6}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800"
              />
            </div>
          )}

          {/* Calculation Breakdown */}
          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
              <Calculator className="w-4 h-4 text-teal-600" />
              <span>محاسبه سهم هر قسط و کارمزد تفریحات:</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>مبلغ هر قسط ماهانه:</span>
              <strong className="text-slate-900">{formatToman(figures.monthlyInstallment)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>واریز به صندوق تفریحات:</span>
              <strong className="text-emerald-700">{formatToman(figures.totalFee)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>کل بازپرداختی عضو:</span>
              <strong className="text-slate-900">{formatToman(figures.totalPayable)}</strong>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">موعد پرداخت اقساط:</label>
            <input
              type="text"
              value={dueDateDesc}
              onChange={(e) => setDueDateDesc(e.target.value)}
              placeholder="مثلاً: دهم هر ماه"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">توضیحات و بابت وام:</label>
            <input
              type="text"
              value={purposeNote}
              onChange={(e) => setPurposeNote(e.target.value)}
              placeholder="مثلاً: هزینه تحصیل، جهیزیه یا فوریت پزشکی..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          {!isBalanceSufficient && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>موجودی صندوق کمتر از اصل مبلغ وام است.</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 safe-bottom">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!isBalanceSufficient}
              className={`flex-1 py-2.5 rounded-xl font-black text-white transition shadow-sm flex items-center justify-center gap-1.5 ${
                isBalanceSufficient
                  ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>ثبت و پرداخت وام</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
