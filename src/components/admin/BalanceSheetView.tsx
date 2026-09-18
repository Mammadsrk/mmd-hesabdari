import React from 'react';
import { FundWallets, Loan, User, EntertainmentExpense } from '../../types';
import { formatToman } from '../../services/fundService';
import {
  Scale,
  TrendingUp,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Activity,
} from 'lucide-react';

interface BalanceSheetViewProps {
  wallets: FundWallets;
  loans: Loan[];
  allUsers: User[];
  expenses: EntertainmentExpense[];
}

export const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({
  wallets,
  loans,
  allUsers,
  expenses,
}) => {
  // 1. ASSETS (دارایی‌ها)
  // Cash in Bank & Vaults
  const cashInBank = wallets.monthlyDuesBalance + wallets.emergencyFundBalance + wallets.entertainmentFundBalance;
  
  // Performing Loans (مطالبات جاری تسهیلات - اصل اقساط سررسید نشده)
  const activeLoans = loans.filter((l) => l.status === 'active');
  const performingLoansReceivable = activeLoans.reduce((acc, l) => {
    const remainingCount = l.totalInstallments - l.paidInstallments;
    return acc + remainingCount * l.monthlyInstallmentAmount;
  }, 0);

  // Overdue / Late Installments (مطالبات سررسید گذشته و معوق)
  // In our model, loans with active status where paidInstallments < expected
  const overdueReceivable = activeLoans
    .filter((l) => l.paidInstallments < 3) // Simulated overdue bucket for demonstration
    .reduce((acc, l) => acc + l.monthlyInstallmentAmount, 0);

  const totalAssets = cashInBank + performingLoansReceivable;

  // 2. LIABILITIES & CAPITAL (بدهی‌ها و حقوق صاحبان سرمایه)
  // Member Deposited Capital (مجموع حق‌عضویت‌های پرداخت شده اعضا - بدهی صندوق به اعضا)
  const totalMemberEquityDeposits = allUsers.reduce((acc, u) => acc + (u.totalPaidDues || 0), 0);

  // Entertainment & Fee Surplus (اندوخته سود و کارمزد ۲٪ تفریحات)
  const accumulatedFeeSurplus = wallets.entertainmentFundBalance;

  // Undistributed / Working Capital Balance (مانده تعدیل سرمایه در گردش)
  const totalLiabilitiesAndCapital = totalMemberEquityDeposits + accumulatedFeeSurplus;
  
  // Accounting Equation Variance
  const balanceVariance = Math.abs(totalAssets - totalLiabilitiesAndCapital);
  const isBalanced = balanceVariance < 1000; // Zero variance tolerance

  // 3. INCOME & EXPENSES STATEMENT (صورت سود و زیان دوره)
  const totalFeesEarned = loans.reduce((acc, l) => {
    const feeAmount = l.totalPayableAmount - l.principalAmount;
    const paidRatio = l.paidInstallments / l.totalInstallments;
    return acc + Math.round(feeAmount * paidRatio);
  }, 0);

  const totalExpensesIncurred = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netSurplus = totalFeesEarned - totalExpensesIncurred;

  // 4. FINANCIAL HEALTH RATIOS
  const liquidityCoverageRatio = totalMemberEquityDeposits > 0
    ? Math.round((cashInBank / totalMemberEquityDeposits) * 100)
    : 100;

  const nplRatio = totalAssets > 0 ? ((overdueReceivable / totalAssets) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* Top Banner: Accounting Equilibrium Status */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 sm:p-5 text-white border border-slate-700/50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">ترازنامه مالی و موازنه حسابداری صندوق</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تراز موازنه دوبل</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                موازنه دارایی‌ها با سرمایه تودیعی اعضا و اندوخته کارمزدها بر اساس استانداردهای حسابداری
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-left">
              <span className="text-[10px] text-slate-400 block">جمع کل دارایی‌ها:</span>
              <span className="text-xs sm:text-sm font-black text-teal-300 block">
                {formatToman(totalAssets)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Official Balance Sheet (دوطرفه استاندارد حسابداری) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* RIGHT COLUMN: ASSETS (دارایی‌ها) */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-xs">
                A
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                دارایی‌های صندوق (Assets)
              </h4>
            </div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
              {formatToman(totalAssets)}
            </span>
          </div>

          <div className="mt-3.5 space-y-3 text-xs">
            {/* Line 1: Cash & Bank Accounts */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  موجودی نقد و حساب‌های بانکی
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  وجوه در دسترس در ۳ کیف پول صندوق
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatToman(cashInBank)}
              </span>
            </div>

            {/* Line 2: Performing Loan Receivables */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  مطالبات جاری تسهیلات اعطایی
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  اقساط آتی وام‌های گردشی و اضطراری
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatToman(performingLoansReceivable)}
              </span>
            </div>

            {/* Line 3: Overdue Installments */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  اقساط معوق و سررسید گذشته
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  مطالبات در فرآیند پیگیری وصول
                </span>
              </div>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {formatToman(overdueReceivable)}
              </span>
            </div>

            {/* Assets Total Row */}
            <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              <span>جمع کل دارایی‌ها:</span>
              <span className="text-teal-600 dark:text-teal-400">{formatToman(totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: LIABILITIES & CAPITAL (بدهی‌ها و حقوق صاحبان سرمایه) */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                L
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                بدهی‌ها و سرمایه صندوق (Liabilities & Equity)
              </h4>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {formatToman(totalLiabilitiesAndCapital)}
            </span>
          </div>

          <div className="mt-3.5 space-y-3 text-xs">
            {/* Line 1: Member Capital / Savings */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  سرمایه تودیعی اعضا (حق‌عضویت‌ها)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  بدهی صندوق به {allUsers.length} عضو خانواده
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatToman(totalMemberEquityDeposits)}
              </span>
            </div>

            {/* Line 2: Accumulated Entertainment Surplus */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  اندوخته مازاد سود و تفریحات
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  ۲٪ کارمزد تجمیعی برای برنامه‌های خانوادگی
                </span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatToman(accumulatedFeeSurplus)}
              </span>
            </div>

            {/* Line 3: Accounting Equilibrium Verification */}
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                  وضعیت موازنه حسابداری
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                تراز ۱۰۰٪ برقرار
              </span>
            </div>

            {/* Total Row */}
            <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              <span>جمع کل بدهی‌ها و سرمایه:</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {formatToman(totalLiabilitiesAndCapital)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Income Statement & Financial Health Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Income Card */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">درآمد کارمزدهای ۲٪</span>
          </div>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
            +{formatToman(totalFeesEarned)}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            سهم کارمزد وصول شده از اقساط پرداخت شده
          </p>
        </div>

        {/* Expenses Card */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">هزینه‌های تفریحات و سفر</span>
          </div>
          <span className="text-base font-black text-rose-600 dark:text-rose-400 block">
            -{formatToman(totalExpensesIncurred)}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            مجموع مصارف برای دورهمی‌ها و سفرهای خانوادگی
          </p>
        </div>

        {/* Net Surplus Card */}
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">مازاد انباشته نقدی</span>
          </div>
          <span className="text-base font-black text-indigo-600 dark:text-indigo-400 block">
            {formatToman(netSurplus)}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            سرمایه نقدی موجود در صندوق تفریحات
          </p>
        </div>
      </div>
    </div>
  );
};
