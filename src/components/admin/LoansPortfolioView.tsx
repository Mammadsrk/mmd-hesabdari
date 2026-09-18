import React, { useState } from 'react';
import { Loan, User } from '../../types';
import { formatToman, toPersianDigits } from '../../services/fundService';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Plus,
  Edit3,
  FileCheck2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  History,
  Coins,
} from 'lucide-react';

interface LoansPortfolioViewProps {
  loans: Loan[];
  allUsers: User[];
  onOpenManualInstallmentModal: (loanId?: string) => void;
  onOpenEditLoanModal: (loan: Loan) => void;
  onOpenNewLoanModal: (type: 'rotating' | 'emergency') => void;
}

export const LoansPortfolioView: React.FC<LoansPortfolioViewProps> = ({
  loans,
  allUsers,
  onOpenManualInstallmentModal,
  onOpenEditLoanModal,
  onOpenNewLoanModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [settlementCertificateLoan, setSettlementCertificateLoan] = useState<Loan | null>(null);

  // KPIs
  const activeLoans = loans.filter((l) => l.status === 'active');
  const completedLoans = loans.filter((l) => l.status === 'completed');
  
  const totalPrincipalAllLoans = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalOutstanding = activeLoans.reduce((sum, l) => {
    const remainingCount = l.totalInstallments - l.paidInstallments;
    return sum + remainingCount * l.monthlyInstallmentAmount;
  }, 0);

  // Filter logic
  const filteredLoans = loans.filter((loan) => {
    if (filterStatus === 'active' && loan.status !== 'active') return false;
    if (filterStatus === 'completed' && loan.status !== 'completed') return false;
    if (filterStatus === 'overdue') {
      // simulated overdue logic: active and paidInstallments < 3
      if (loan.status !== 'active' || loan.paidInstallments >= 3) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return loan.memberName.toLowerCase().includes(q) || (loan.purposeNote || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* 1. Header Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">کل وام‌های اعطایی</span>
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 block mt-0.5">
            {loans.length} فقره
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            ارزش: {formatToman(totalPrincipalAllLoans)}
          </span>
        </div>

        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 border border-teal-200/80 dark:border-teal-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block">وام‌های فعال جاری</span>
          <span className="text-base sm:text-lg font-black text-teal-600 dark:text-teal-400 block mt-0.5 tabular-nums">
            {toPersianDigits(activeLoans.length)} پرونده
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block tabular-nums">
            مانده: {formatToman(totalOutstanding)}
          </span>
        </div>

        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 border border-emerald-200/80 dark:border-emerald-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">تسویه کامل شده</span>
          <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-0.5 tabular-nums">
            {toPersianDigits(completedLoans.length)} پرونده
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">مختومه و تسویه شده</span>
        </div>

        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 border border-amber-200/80 dark:border-amber-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">کارمزد ۲٪ تفریحات</span>
          <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 block mt-0.5 tabular-nums">
            ۴۰۰,۰۰۰ تومان
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">به ازای هر وام گردشی</span>
        </div>
      </div>

      {/* 2. Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی پرونده وام با نام عضو یا علت..."
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition tabular-nums ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            همه ({toPersianDigits(loans.length)})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition tabular-nums ${
              filterStatus === 'active'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            جاری ({toPersianDigits(activeLoans.length)})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition tabular-nums ${
              filterStatus === 'completed'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            تسویه شده ({toPersianDigits(completedLoans.length)})
          </button>
        </div>

        {/* New Loan CTA */}
        <button
          onClick={() => onOpenNewLoanModal('rotating')}
          className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>اعطای وام جدید</span>
        </button>
      </div>

      {/* 3. Loans Cards List */}
      {filteredLoans.length === 0 ? (
        <div className="py-10 text-center rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6">
          <CreditCard className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">هیچ پرونده تسهیلاتی با این شرایط یافت نشد.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLoans.map((loan) => {
            const user = allUsers.find((u) => u.id === loan.memberId);
            const isCompleted = loan.status === 'completed';
            const progressPercent = Math.round((loan.paidInstallments / loan.totalInstallments) * 100);
            const remainingInstallments = loan.totalInstallments - loan.paidInstallments;
            const remainingAmount = remainingInstallments * loan.monthlyInstallmentAmount;
            const isExpanded = expandedLoanId === loan.id;

            return (
              <div
                key={loan.id}
                className={`rounded-2xl backdrop-blur-md p-4 sm:p-5 border transition-all ${
                  isCompleted
                    ? 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 opacity-90'
                    : 'bg-white/85 dark:bg-slate-900/85 border-slate-200/90 dark:border-slate-800/90 shadow-[0_8px_30px_rgb(0,0,0,0.03)]'
                }`}
              >
                {/* Header of Loan Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={loan.memberName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          {loan.memberName}
                        </h4>
                        <span className="text-[10px] text-slate-400">({user?.familyRelation || 'عضو'})</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                            loan.type === 'rotating'
                              ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {loan.type === 'rotating' ? 'وام گردشی ۲٪' : 'وام ضروری بدون سود'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        اعطا: {loan.grantedDate} | سررسید ماه جاری: {loan.dueDate}
                      </p>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold border shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    {isCompleted ? '✓ تسویه نهایی' : `جاری (${progressPercent}%)`}
                  </span>
                </div>

                {/* Progress Bar & Repayment Stats */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      پیشرفت بازپرداخت اقساط:
                    </span>
                    <span>
                      {loan.paidInstallments} از {loan.totalInstallments} قسط تسویه شده
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-teal-500 to-indigo-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">اصل مبلغ وام:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {formatToman(loan.principalAmount)}
                      </span>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">مبلغ هر قسط:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {formatToman(loan.monthlyInstallmentAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">مانده بدهی:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                        {formatToman(remainingAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operations & Action Buttons */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {!isCompleted && (
                      <>
                        <button
                          onClick={() => onOpenManualInstallmentModal(loan.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition active:scale-95 flex items-center gap-1 shadow-2xs"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>ثبت دستی قسط</span>
                        </button>

                        <button
                          onClick={() => onOpenEditLoanModal(loan)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium transition active:scale-95 flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>تنظیم اقساط / استمهال</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setSettlementCertificateLoan(loan)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium transition active:scale-95 flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                    >
                      <FileCheck2 className="w-3 h-3 text-teal-500" />
                      <span>گواهی پرونده</span>
                    </button>
                  </div>

                  {loan.manualPaymentLogs && loan.manualPaymentLogs.length > 0 && (
                    <button
                      onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                      className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-700 flex items-center gap-1"
                    >
                      <History className="w-3 h-3" />
                      <span>{loan.manualPaymentLogs.length} پرداخت دستی</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Expanded Manual Payment Logs Drawer */}
                {isExpanded && loan.manualPaymentLogs && (
                  <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      سوابق ثبت دستی اقساط توسط مدیر:
                    </span>
                    {loan.manualPaymentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            ثبت {log.installmentsCount} قسط ({formatToman(log.amount)})
                          </span>
                          <span className="text-[10px] text-slate-400">
                            تاریخ: {log.date} | روش: {log.paymentMethod === 'card_to_card' ? 'کارت‌به‌کارت' : log.paymentMethod === 'cash' ? 'نقدی' : 'حواله'} | {log.notes}
                          </span>
                        </div>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                          تایید پدر
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      {settlementCertificateLoan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-2">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                برگه خلاصه وضعیت تسهیلات صندوق
              </h3>
              <p className="text-[11px] text-slate-400">صندوق پس‌انداز و قرض‌الحسنه خانوادگی</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">نام وام‌گیرنده:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{settlementCertificateLoan.memberName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">نوع وام:</span>
                <span className="font-bold">{settlementCertificateLoan.type === 'rotating' ? 'وام نوبتی گردشی' : 'وام ضروری'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">اصل مبلغ وام:</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{formatToman(settlementCertificateLoan.principalAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">اقساط بازپرداخت شده:</span>
                <span className="font-bold">{settlementCertificateLoan.paidInstallments} از {settlementCertificateLoan.totalInstallments} قسط</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">وضعیت نهایی:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {settlementCertificateLoan.status === 'completed' ? 'تسویه کامل و مختومه' : 'جاری و فعال'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setSettlementCertificateLoan(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition"
              >
                بستن برگه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
