import React from 'react';
import { FundWallets, User, Loan, EntertainmentExpense } from '../../types';
import { formatToman } from '../../services/fundService';
import {
  Wallet,
  Landmark,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Plus,
  Wifi,
  ShieldCheck,
  Palmtree,
  Coins,
} from 'lucide-react';

interface TreasuryCashFlowViewProps {
  wallets: FundWallets;
  allUsers: User[];
  loans: Loan[];
  expenses: EntertainmentExpense[];
  onOpenEntertainmentModal: () => void;
}

export const TreasuryCashFlowView: React.FC<TreasuryCashFlowViewProps> = ({
  wallets,
  allUsers,
  loans,
  expenses,
  onOpenEntertainmentModal,
}) => {
  const totalCash = wallets.monthlyDuesBalance + wallets.emergencyFundBalance + wallets.entertainmentFundBalance;
  
  // Calculate projected monthly cash inflows
  const totalMonthlyDuesInflow = allUsers.reduce((sum, u) => sum + (u.monthlyDueAmount || 500000), 0);
  const activeLoans = loans.filter((l) => l.status === 'active');
  const monthlyLoanInstallmentsInflow = activeLoans.reduce((sum, l) => sum + l.monthlyInstallmentAmount, 0);
  const totalProjectedMonthlyInflow = totalMonthlyDuesInflow + monthlyLoanInstallmentsInflow;

  // Standard rotating loan disbursement per month
  const standardRotatingLoanOutflow = 20000000; // 20 million tomans
  const monthlyNetCashFlow = totalProjectedMonthlyInflow - standardRotatingLoanOutflow;

  return (
    <div className="space-y-4">
      {/* 1. Official Central Banking Card of the Fund */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-5 text-white shadow-xl border border-teal-600/30 backdrop-blur-xl">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <Landmark className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">حساب مرکزی خزانه‌داری صندوق خانوادگی</span>
              <span className="text-[10px] text-teal-300/80">متصل به شبکه بانکی شتاب و پایا</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-[10px] font-semibold">
            <Wifi className="w-3 h-3 rotate-90 text-teal-300" />
            <span>تسویه آنلاین</span>
          </div>
        </div>

        {/* Smart Chip & Card Number */}
        <div className="relative z-10 mt-6 flex items-center justify-between">
          <div className="w-10 h-7.5 rounded-lg bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-400 p-1 flex flex-col justify-between border border-amber-400/60 shadow-xs">
            <div className="w-full h-0.5 bg-amber-700/20 rounded-xs" />
            <div className="w-full h-0.5 bg-amber-700/20 rounded-xs" />
          </div>

          <div className="text-left font-mono tracking-widest text-xs sm:text-sm text-slate-300">
            ۶۰۳۷ - ۹۹۷۱ - ۲۳۴۵ - ۸۸۹۰
          </div>
        </div>

        {/* Total Cash Balance Strip */}
        <div className="relative z-10 mt-6 pt-3.5 border-t border-white/15 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-teal-300/80 block">کل نقدینگی موجود در خزانه‌داری:</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block tabular-nums tracking-normal">
              {formatToman(totalCash)}
            </span>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-slate-400 block">شماره شبا رسمی صندوق:</span>
            <span className="text-[11px] font-mono text-amber-300 mt-0.5 block tabular-nums">
              IR82-0120-0000-0000-1234-5678
            </span>
          </div>
        </div>
      </div>

      {/* 2. Three Distinct Treasury Vaults (۳ صندوق تفکیکی) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Vault 1: Monthly Dues & Rotating Loan Fund */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border border-teal-200/80 dark:border-teal-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">صندوق وام‌های گردشی</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800">
              حق عضویت‌ها
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[10px] text-slate-400 block">موجودی نقد قابل تخصیص:</span>
            <span className="text-base sm:text-lg font-black text-teal-600 dark:text-teal-400 block mt-0.5">
              {formatToman(wallets.monthlyDuesBalance)}
            </span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>ورودی ماهانه ثابت:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {formatToman(totalMonthlyDuesInflow)}
            </span>
          </div>
        </div>

        {/* Vault 2: Emergency Loans Reserve */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border border-amber-200/80 dark:border-amber-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">صندوق وام‌های ضروری</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
              بدون کارمزد
            </span>
          </div>

          <div className="mt-3">
            <span className="text-[10px] text-slate-400 block">ذخیره نقدی موارد اضطراری:</span>
            <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 block mt-0.5">
              {formatToman(wallets.emergencyFundBalance)}
            </span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>سقف اعطای فوری:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">۱۰,۰۰۰,۰۰۰ تومان</span>
          </div>
        </div>

        {/* Vault 3: Entertainment & Trips Fund (from 2% fee) */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border border-emerald-200/80 dark:border-emerald-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Palmtree className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">صندوق تفریحات و سفر</span>
            </div>
            <button
              onClick={onOpenEntertainmentModal}
              className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 transition active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>ثبت هزینه</span>
            </button>
          </div>

          <div className="mt-3">
            <span className="text-[10px] text-slate-400 block">موجودی کارمزدهای ۲٪:</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
              {formatToman(wallets.entertainmentFundBalance)}
            </span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>تعداد برنامه‌های برگزار شده:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{expenses.length} برنامه</span>
          </div>
        </div>
      </div>

      {/* 3. Three-Month Projected Cash Flow Forecast (پیش‌بینی جریان وجوه نقد ۳ ماهه) */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                پیش‌بینی گردش نقدینگی ۳ ماه آینده (Cash Flow Forecast)
              </h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                تطبیق ورودی‌های قطعی (حق عضویت + اقساط) با وام نوبتی مصوب ماهانه
              </span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            مازاد مثبت ماهانه
          </span>
        </div>

        {/* Forecast Table Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5">
          {/* Month 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 pb-1.5 border-b border-slate-200 dark:border-slate-700">
              <span>ماه جاری (تیرماه)</span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400">دوره فعلی</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
              <span>ورودی‌های پیش‌بینی‌شده:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatToman(totalProjectedMonthlyInflow)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
              <span>خروجی وام نوبتی:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                -{formatToman(standardRotatingLoanOutflow)}
              </span>
            </div>
            <div className="pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              <span>تراز نقدی پایان ماه:</span>
              <span className="text-teal-600 dark:text-teal-400">
                {formatToman(totalCash + monthlyNetCashFlow)}
              </span>
            </div>
          </div>

          {/* Month 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 pb-1.5 border-b border-slate-200 dark:border-slate-700">
              <span>ماه بعد (مردادماه)</span>
              <span className="text-[10px] text-slate-400">پیش‌بینی ۱</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
              <span>ورودی‌های پیش‌بینی‌شده:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatToman(totalProjectedMonthlyInflow)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
              <span>خروجی وام نوبتی:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                -{formatToman(standardRotatingLoanOutflow)}
              </span>
            </div>
            <div className="pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              <span>تراز نقدی پایان ماه:</span>
              <span className="text-teal-600 dark:text-teal-400">
                {formatToman(totalCash + monthlyNetCashFlow * 2)}
              </span>
            </div>
          </div>

          {/* Month 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 pb-1.5 border-b border-slate-200 dark:border-slate-700">
              <span>۲ ماه بعد (شهریورماه)</span>
              <span className="text-[10px] text-slate-400">پیش‌بینی ۲</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
              <span>ورودی‌های پیش‌بینی‌شده:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatToman(totalProjectedMonthlyInflow)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
              <span>خروجی وام نوبتی:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                -{formatToman(standardRotatingLoanOutflow)}
              </span>
            </div>
            <div className="pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              <span>تراز نقدی پایان ماه:</span>
              <span className="text-teal-600 dark:text-teal-400">
                {formatToman(totalCash + monthlyNetCashFlow * 3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
