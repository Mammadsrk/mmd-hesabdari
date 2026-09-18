import React from 'react';
import { User, Loan, QueueItem, Receipt } from '../types';
import { formatToman, toPersianDigits } from '../services/fundService';
import {
  CreditCard,
  PlusCircle,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Sparkles,
  Wifi,
  Eye,
  Landmark,
  Shield,
} from 'lucide-react';

interface MemberDashboardProps {
  currentUser: User;
  loans: Loan[];
  queue: QueueItem[];
  receipts: Receipt[];
  onOpenNewReceiptModal: (prefillType?: 'monthly_due' | 'loan_installment' | 'emergency_loan_payback') => void;
  onViewQueue: () => void;
  onViewReceiptDetail: (receipt: Receipt) => void;
  isAdmin?: boolean;
  onSwitchToAdmin?: () => void;
  onOpenMyLedger?: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  currentUser,
  loans,
  queue,
  receipts,
  onOpenNewReceiptModal,
  onViewQueue,
  onViewReceiptDetail,
  isAdmin,
  onSwitchToAdmin,
  onOpenMyLedger,
}) => {
  const myLoans = loans.filter((l) => l.memberId === currentUser.id && l.status === 'active');
  const myReceipts = receipts.filter((r) => r.memberId === currentUser.id);
  const myQueueItem = queue.find((q) => q.memberId === currentUser.id);

  const rotatingLoan = myLoans.find((l) => l.type === 'rotating');
  const emergencyLoan = myLoans.find((l) => l.type === 'emergency');

  const peopleAheadCount = myQueueItem ? myQueueItem.order - 1 : 0;

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-1 sm:px-0 text-slate-900 dark:text-slate-100">
      {/* Admin Quick Switcher Banner */}
      {isAdmin && onSwitchToAdmin && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900/90 via-teal-950/90 to-slate-900/90 border border-teal-500/40 p-3.5 flex items-center justify-between text-white shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block text-white">میز مدیریت و حسابداری صندوق</span>
              <span className="text-[10px] text-teal-300/80">شما به عنوان مدیر کل (پدر) دسترسی بانکی دارید</span>
            </div>
          </div>
          <button
            onClick={onSwitchToAdmin}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold transition active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <span>ورود به بانکداری</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {/* 1. Digital Membership / Banking Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950/95 via-slate-900/90 to-teal-900/95 p-5 text-white shadow-lg shadow-teal-950/20 border border-teal-700/40 backdrop-blur-xl">
        {/* Subtle Background Glow */}
        <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />

        {/* Top of Card */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-100 block">
                صندوق پس‌انداز خانوادگی
              </span>
              <span className="text-[10px] text-teal-400/80">کارت اعتباری عضویت</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-teal-300/80 rotate-90" />
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs text-teal-200 font-medium">
              {currentUser.familyRelation}
            </span>
          </div>
        </div>

        {/* Chip & User Info */}
        <div className="relative z-10 mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Smart Chip */}
            <div className="w-9 h-7 rounded-lg bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-400 p-0.5 flex flex-col justify-between border border-amber-400/50 shadow-xs">
              <div className="w-full h-0.5 bg-amber-700/20 rounded-xs" />
              <div className="w-full h-0.5 bg-amber-700/20 rounded-xs" />
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">{currentUser.name}</h2>
              <span className="text-[10px] text-teal-300/80">عضویت از {currentUser.joinedDate}</span>
            </div>
          </div>

          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover border-2 border-white/20 shadow-md"
          />
        </div>

        {/* Total Savings & Monthly Due in Card */}
        <div className="relative z-10 mt-5 pt-3.5 border-t border-white/15 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-teal-300/90 block">مجموع پس‌انداز شما در صندوق:</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block tabular-nums tracking-normal">
              {formatToman(currentUser.totalPaidDues)}
            </span>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-teal-300/90 block">حق عضویت ماهانه:</span>
            <span className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5 block tabular-nums tracking-normal">
              {formatToman(currentUser.monthlyDueAmount)}
            </span>
          </div>
        </div>

        {onOpenMyLedger && (
          <button
            onClick={onOpenMyLedger}
            className="relative z-10 w-full mt-3 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-between transition cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>مشاهده و چاپ صورتحساب معین شما (گردش مالی و اقساط)</span>
            </div>
            <span className="text-[10px] text-teal-200">دفتر معین شخصی &larr;</span>
          </button>
        )}
      </div>

      {/* 2. Quick Action Grid (Sleek Minimal Touch Buttons) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        <button
          id="quick-pay-monthly"
          onClick={() => onOpenNewReceiptModal('monthly_due')}
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-md hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer min-h-[82px] active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1.5 shadow-2xs">
            <PlusCircle className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">
            حق عضویت
          </span>
          <span className="text-[9px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">ماهانه</span>
        </button>

        <button
          id="quick-pay-installment"
          onClick={() => onOpenNewReceiptModal('loan_installment')}
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer min-h-[82px] active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 shadow-2xs">
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">
            قسط وام
          </span>
          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">نوبتی</span>
        </button>

        <button
          id="quick-pay-emergency"
          onClick={() => onOpenNewReceiptModal('emergency_loan_payback')}
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer min-h-[82px] active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 shadow-2xs">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">
            وام ضروری
          </span>
          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">اورژانسی</span>
        </button>

        <button
          id="quick-view-queue"
          onClick={onViewQueue}
          className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer min-h-[82px] active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 shadow-2xs">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">
            صف نوبت
          </span>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            نوبت {myQueueItem?.order || '-'}
          </span>
        </button>
      </div>

      {/* 3. My Queue Spotlight Banner */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">نوبت وام گردشی شما</h3>
          </div>

          <button
            onClick={onViewQueue}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums tracking-normal">
              نوبت {myQueueItem?.order ? toPersianDigits(myQueueItem.order) : '-'}
            </span>
            <span className="text-[11px] text-slate-400 tabular-nums">از بین {toPersianDigits(queue.length)} نفر</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-100/80 dark:border-indigo-900/50 shadow-2xs tabular-nums">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{toPersianDigits(myQueueItem?.estimatedDate) || 'در حال محاسبه'}</span>
          </div>
        </div>

        {/* Progress Bar to Turn */}
        <div className="mt-3">
          <div className="w-full bg-slate-100/90 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-700/40">
            <div
              className="bg-gradient-to-r from-indigo-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  queue.length > 0
                    ? Math.max(10, ((queue.length - (myQueueItem?.order || 1) + 1) / queue.length) * 100)
                    : 100
                }%`,
              }}
            />
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between tabular-nums">
            <span>
              {peopleAheadCount === 0
                ? '✨ شما در ابتدای صف هستید و وام بعدی به شما تعلق دارد!'
                : `${toPersianDigits(peopleAheadCount)} نفر پیش از شما در نوبت هستند.`}
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">مبلغ مصوب: ۲۰,۰۰۰,۰۰۰ تومان</span>
          </div>
        </div>
      </div>

      {/* 4. Active Rotating Loan Card */}
      {rotatingLoan && (
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 border border-teal-200/70 dark:border-teal-900/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">اقساط وام گردشی فعال</h3>
                <span className="text-[10px] text-teal-600 dark:text-teal-400">۲٪ کارمزد جهت صندوق تفریحات</span>
              </div>
            </div>

            <button
              onClick={() => onOpenNewReceiptModal('loan_installment')}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold shadow-xs transition active:scale-95 tabular-nums"
            >
              پرداخت قسط {toPersianDigits(rotatingLoan.paidInstallments + 1)}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-xs p-2.5 rounded-xl border border-slate-100/90 dark:border-slate-800/70">
              <span className="text-[10px] text-slate-400 block">مبلغ هر قسط</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block tabular-nums">
                {formatToman(rotatingLoan.monthlyInstallmentAmount)}
              </span>
            </div>
            <div className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-xs p-2.5 rounded-xl border border-slate-100/90 dark:border-slate-800/70">
              <span className="text-[10px] text-slate-400 block">اقساط تسویه شده</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block tabular-nums">
                {toPersianDigits(rotatingLoan.paidInstallments)} از {toPersianDigits(rotatingLoan.totalInstallments)}
              </span>
            </div>
            <div className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-xs p-2.5 rounded-xl border border-slate-100/90 dark:border-slate-800/70">
              <span className="text-[10px] text-slate-400 block">موعد ماه جاری</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block tabular-nums">
                {toPersianDigits(rotatingLoan.dueDate)}
              </span>
            </div>
          </div>

          {/* Interactive Installment Pills */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-2">
              <span>وضعیت پرداخت ۱۰ قسط:</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">۴۰,۰۰۰ تومان از هر قسط برای سفر خانواده</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: rotatingLoan.totalInstallments }).map((_, idx) => {
                const isPaid = idx < rotatingLoan.paidInstallments;
                const isCurrent = idx === rotatingLoan.paidInstallments;

                return (
                  <div
                    key={idx}
                    className={`py-1.5 px-1 rounded-xl text-center border text-[11px] transition-all tabular-nums ${
                      isPaid
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                        : isCurrent
                        ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold'
                        : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-400 font-normal'
                    }`}
                  >
                    <div className="text-[9px] text-slate-400">قسط {toPersianDigits(idx + 1)}</div>
                    <div className="text-[9px] mt-0.5 font-medium">
                      {isPaid ? '✓ تسویه' : isCurrent ? 'جاری' : 'آینده'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. Emergency Loan Alert if Active */}
      {emergencyLoan && (
        <div className="rounded-2xl bg-amber-50/85 dark:bg-amber-950/40 backdrop-blur-md p-4 sm:p-5 border border-amber-300/70 dark:border-amber-900/60 text-slate-800 dark:text-slate-200 shadow-[0_8px_30px_rgb(245,158,11,0.05)] transition-all">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">وام ضروری فعال (بدون کارمزد)</h4>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                  فوریت
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300/80 mt-1 leading-relaxed">
                مبلغ {formatToman(emergencyLoan.principalAmount)} بابت «
                {emergencyLoan.purposeNote || 'مخارج فوری'}». فاقد هرگونه کارمزد.
              </p>
              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-amber-200/80 dark:border-amber-900/50">
                <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300">
                  {emergencyLoan.paidInstallments} از {emergencyLoan.totalInstallments} قسط بازگردانده شده
                </span>
                <button
                  onClick={() => onOpenNewReceiptModal('emergency_loan_payback')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold shadow-xs active:scale-95"
                >
                  ثبت بازپرداخت
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. My Receipts & Activity History */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">فیش‌ها و واریزی‌های من</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{myReceipts.length} فیش</span>
        </div>

        {myReceipts.length === 0 ? (
          <div className="py-7 text-center">
            <p className="text-xs text-slate-400">تاکنون فیش واریزی توسط شما ثبت نشده است.</p>
            <button
              onClick={() => onOpenNewReceiptModal()}
              className="mt-3 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-xs active:scale-95"
            >
              ثبت اولین واریزی
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80 dark:divide-slate-800/80 mt-1">
            {myReceipts.map((rec) => {
              const isApproved = rec.status === 'approved';
              const isPending = rec.status === 'pending';

              return (
                <div
                  key={rec.id}
                  className="py-3 px-2 rounded-xl flex items-center justify-between gap-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer active:scale-[0.99]"
                  onClick={() => onViewReceiptDetail(rec)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs">
                      <img
                        src={rec.receiptImageUrl}
                        alt="تصویر فیش"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {rec.paymentType === 'monthly_due'
                            ? 'حق عضویت ماهانه'
                            : rec.paymentType === 'loan_installment'
                            ? `قسط وام (قسط ${rec.installmentNumber || 'جاری'})`
                            : 'بازپرداخت وام ضروری'}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                            isApproved
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : isPending
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {isApproved ? '✓ تایید شده' : isPending ? '⏳ در انتظار' : '✕ رد شده'}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{rec.bankName}</span>
                        <span>•</span>
                        <span>پیگیری: {rec.trackingCode}</span>
                        <span>•</span>
                        <span>{rec.submittedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {formatToman(rec.amount)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
