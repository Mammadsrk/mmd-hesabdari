import React, { useState, useMemo } from 'react';
import { User, Loan, Receipt, JournalEntry, FundProfile } from '../../types';
import { formatToman, toPersianDigits } from '../../services/fundService';
import {
  X,
  Printer,
  FileText,
  User as UserIcon,
  Phone,
  Calendar,
  CreditCard,
  Wallet,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Filter,
  Download,
  Building,
} from 'lucide-react';

interface MemberLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: User | null;
  allLoans: Loan[];
  allReceipts: Receipt[];
  allJournalEntries?: JournalEntry[];
  fundProfile?: FundProfile;
}

interface LedgerRow {
  id: string;
  voucherNumber?: number;
  date: string;
  description: string;
  categoryTitle: string;
  debit: number; // برداشت یا وام گرفته شده (افزایش بدهی به صندوق)
  credit: number; // واریز حق عضویت یا پرداخت قسط (کاهش بدهی یا افزایش سرمایه)
  runningBalance: number; // مانده حساب خالص
  trackingRef?: string;
}

export const MemberLedgerModal: React.FC<MemberLedgerModalProps> = ({
  isOpen,
  onClose,
  member,
  allLoans,
  allReceipts,
  allJournalEntries = [],
  fundProfile,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'dues' | 'loans' | 'installments'>('all');

  if (!isOpen || !member) return null;

  // Member's loans
  const memberLoans = useMemo(
    () => allLoans.filter((l) => l.memberId === member.id),
    [allLoans, member.id]
  );

  const activeLoan = memberLoans.find((l) => l.status === 'active');

  // Calculate high-level financial summary
  const totalDuesPaid = member.totalPaidDues || 0;
  const totalLoansPrincipalTaken = memberLoans.reduce((sum, l) => sum + l.principalAmount, 0);
  
  // Calculate remaining loan debt
  const totalRemainingDebt = useMemo(() => {
    return memberLoans.reduce((sum, l) => {
      if (l.status === 'active') {
        const remainingInst = Math.max(0, l.totalInstallments - l.paidInstallments);
        return sum + remainingInst * l.monthlyInstallmentAmount;
      }
      return sum;
    }, 0) + (activeLoan ? 0 : (member.initialDebt || 0));
  }, [memberLoans, activeLoan, member.initialDebt]);

  // Net position: Positive means member has more equity deposited than debt; negative means net borrower
  const netPosition = totalDuesPaid - totalRemainingDebt;

  // Build Chronological Ledger Entries
  const ledgerRows = useMemo(() => {
    const rows: Array<Omit<LedgerRow, 'runningBalance'>> = [];

    // 1. Incorporate Approved Receipts (Dues & Installments)
    const approvedReceipts = allReceipts.filter(
      (r) => r.memberId === member.id && r.status === 'approved'
    );

    approvedReceipts.forEach((r) => {
      let categoryTitle = 'واریز حق عضویت';
      if (r.paymentType === 'loan_installment') categoryTitle = 'پرداخت قسط وام گردشی';
      else if (r.paymentType === 'emergency_loan_payback') categoryTitle = 'بازپرداخت وام ضروری';

      rows.push({
        id: `rcpt-${r.id}`,
        date: r.submittedDate || '۱۴۰۳/۰۶/۰۱',
        description: `واریز ${categoryTitle} - کد رهگیری ${r.trackingCode}`,
        categoryTitle,
        debit: 0,
        credit: r.amount,
        trackingRef: r.trackingCode,
      });
    });

    // 2. Incorporate Loans Granted (Disbursements)
    memberLoans.forEach((l) => {
      rows.push({
        id: `loan-grant-${l.id}`,
        date: l.grantedDate || '۱۴۰۳/۰۱/۱۵',
        description: `دریافت اصل وام ${l.type === 'rotating' ? 'گردشی' : 'ضروری'} (${l.totalInstallments} ماهه)`,
        categoryTitle: 'اعطای وام',
        debit: l.principalAmount,
        credit: 0,
        trackingRef: `LOAN-${l.id.slice(-4)}`,
      });

      // Manual payment logs if any
      (l.manualPaymentLogs || []).forEach((m) => {
        rows.push({
          id: `man-${m.id}`,
          date: m.date,
          description: `پرداخت دستی ${m.installmentsCount} قسط (${m.paymentMethod === 'cash' ? 'نقدی' : 'بانکی'}) - ${m.notes}`,
          categoryTitle: 'پرداخت قسط',
          debit: 0,
          credit: m.amount,
          trackingRef: m.id,
        });
      });
    });

    // 3. Fallback to Journal Entries matching this member if available
    allJournalEntries
      .filter((j) => j.memberId === member.id && !rows.some((r) => r.trackingRef === j.trackingRef))
      .forEach((j) => {
        const isDebit = j.category === 'loan_disbursement';
        rows.push({
          id: `jv-${j.id}`,
          voucherNumber: j.voucherNumber,
          date: j.date,
          description: j.description,
          categoryTitle:
            j.category === 'monthly_due'
              ? 'حق عضویت'
              : j.category === 'loan_installment'
              ? 'قسط وام'
              : j.category === 'loan_disbursement'
              ? 'اصل وام'
              : 'سند مالی',
          debit: isDebit ? j.amount : 0,
          credit: !isDebit ? j.amount : 0,
          trackingRef: j.trackingRef,
        });
      });

    // If initial dues exist and no detailed records cover it, provide an opening balance row
    if (rows.length === 0 && totalDuesPaid > 0) {
      rows.push({
        id: `init-dues-${member.id}`,
        date: '۱۴۰۳/۰۱/۰۱',
        description: 'مانده انتقالی حق‌عضویت‌های تودیعی ابتدای دوره',
        categoryTitle: 'سرمایه اولیه',
        debit: 0,
        credit: totalDuesPaid,
        trackingRef: 'افتتاحیه',
      });
    }

    // Sort chronologically (simple Persian date string sort)
    rows.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate Running Balance
    let currentBalance = 0;
    const finalRows: LedgerRow[] = rows.map((r) => {
      // Credit increases member's positive standing / capital; Debit represents loan disbursed
      currentBalance += r.credit - r.debit;
      return {
        ...r,
        runningBalance: currentBalance,
      };
    });

    return finalRows;
  }, [allReceipts, memberLoans, allJournalEntries, member.id, totalDuesPaid]);

  // Apply visual category filter
  const filteredRows = useMemo(() => {
    if (filterType === 'all') return ledgerRows;
    if (filterType === 'dues') {
      return ledgerRows.filter((r) => r.categoryTitle.includes('حق عضویت') || r.categoryTitle.includes('سرمایه'));
    }
    if (filterType === 'loans') {
      return ledgerRows.filter((r) => r.categoryTitle.includes('اعطای وام') || r.debit > 0);
    }
    if (filterType === 'installments') {
      return ledgerRows.filter((r) => r.categoryTitle.includes('قسط'));
    }
    return ledgerRows;
  }, [ledgerRows, filterType]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 p-5 sm:p-6 text-white flex items-center justify-between print:bg-white print:text-slate-900 print:border-b print:border-slate-300 print:p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-200 border border-white/20 print:hidden">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">صورتحساب معین تفصیلی عضو</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium border border-white/25">
                  کد عضویت: #{toPersianDigits(member.id.replace(/\D/g, '') || '۱۰۲')}
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                {fundProfile?.name || 'صندوق قرض‌الحسنه و پس‌انداز خانوادگی'} • گردش ریز حساب و تراز مالی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-white/20 cursor-pointer"
              title="چاپ یا ذخیره PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">چاپ / ذخیره PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Header (Shows when printing) */}
        <div className="hidden print:block p-4 border-b border-slate-300 text-center mb-4">
          <h1 className="text-xl font-bold text-slate-900">{fundProfile?.name || 'صندوق قرض‌الحسنه و پس‌انداز خانوادگی'}</h1>
          <p className="text-xs text-slate-600 mt-1">
            برگ صورتحساب معین تفصیلی • تاریخ استخراج: {new Date().toLocaleDateString('fa-IR')}
          </p>
        </div>

        {/* Member Profile Quick Card */}
        <div className="p-4 sm:p-6 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Member Identity */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/50 dark:border-teal-800/50 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 block">نام و نسبت خانوادگی</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block">
                  {member.name} ({member.familyRelation})
                </span>
                <span className="text-[10px] text-slate-500 tabular-nums">{toPersianDigits(member.phoneNumber)}</span>
              </div>
            </div>

            {/* Total Dues Paid */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400 font-medium">سرمایه حق‌عضویت تودیعی</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
                {formatToman(totalDuesPaid)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                قسط ماهانه: {formatToman(member.monthlyDueAmount)}
              </span>
            </div>

            {/* Active Loan & Remaining Debt */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400 font-medium">مانده بدهی تسهیلات</span>
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums block">
                {formatToman(totalRemainingDebt)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {activeLoan
                  ? `${toPersianDigits(activeLoan.totalInstallments - activeLoan.paidInstallments)} قسط تا تسویه`
                  : 'فاقد وام معوق'}
              </span>
            </div>

            {/* Net Balance Status */}
            <div className={`p-3 rounded-2xl border shadow-xs ${
              netPosition >= 0
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium opacity-80">تراز وضعیت با صندوق</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold tabular-nums block">
                {formatToman(Math.abs(netPosition))}
              </span>
              <span className="text-[10px] font-semibold opacity-90 mt-0.5 block">
                {netPosition >= 0 ? 'بستانکار از صندوق (سرمایه مثبت)' : 'بدهکار به صندوق (تسهیلات مازاد)'}
              </span>
            </div>
          </div>
        </div>

        {/* Ledger Filter Tabs */}
        <div className="px-5 pt-4 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              همه گردش‌ها ({toPersianDigits(ledgerRows.length)})
            </button>
            <button
              onClick={() => setFilterType('dues')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'dues'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              حق عضویت‌ها
            </button>
            <button
              onClick={() => setFilterType('loans')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'loans'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              وام‌های دریافتی
            </button>
            <button
              onClick={() => setFilterType('installments')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterType === 'installments'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              اقساط پرداخت شده
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            تعداد ردیف معین: <strong className="text-slate-700 dark:text-slate-200 tabular-nums">{toPersianDigits(filteredRows.length)}</strong> مورد
          </span>
        </div>

        {/* Ledger Table */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">ردیف</th>
                <th className="py-2.5 px-3 whitespace-nowrap">تاریخ شمسی</th>
                <th className="py-2.5 px-3 whitespace-nowrap">سند / ارجاع</th>
                <th className="py-2.5 px-3 min-w-[200px]">شرح رویداد مالی</th>
                <th className="py-2.5 px-3 text-rose-600 dark:text-rose-400 whitespace-nowrap">بدهکار (وام)</th>
                <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">بستانکار (واریز)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-slate-800 dark:text-slate-200">مانده لحظه‌ای</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    هیچ تراکنشی در این فیلتر ثبت نشده است.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-slate-400 font-semibold tabular-nums">
                        {toPersianDigits(idx + 1)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium tabular-nums whitespace-nowrap">
                        {toPersianDigits(row.date)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 tabular-nums whitespace-nowrap">
                        {row.voucherNumber ? (
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold border border-teal-200/60 dark:border-teal-800/60 text-[10px]">
                            سند #{toPersianDigits(row.voucherNumber)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">{row.trackingRef || '-'}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {row.description}
                      </td>
                      <td className="py-3 px-3 font-bold text-rose-600 dark:text-rose-400 tabular-nums whitespace-nowrap">
                        {row.debit > 0 ? formatToman(row.debit) : '-'}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                        {row.credit > 0 ? formatToman(row.credit) : '-'}
                      </td>
                      <td className="py-3 px-3 font-bold tabular-nums whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[11px] ${
                            row.runningBalance >= 0
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50'
                          }`}
                        >
                          {formatToman(Math.abs(row.runningBalance))} {row.runningBalance >= 0 ? '(بس)' : '(بد)'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-600 font-bold bg-slate-50/60 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100">
                <td colSpan={4} className="py-3 px-3 text-right">
                  جمع گردش معین:
                </td>
                <td className="py-3 px-3 text-rose-600 dark:text-rose-400 tabular-nums whitespace-nowrap">
                  {formatToman(filteredRows.reduce((sum, r) => sum + r.debit, 0))}
                </td>
                <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                  {formatToman(filteredRows.reduce((sum, r) => sum + r.credit, 0))}
                </td>
                <td className="py-3 px-3 text-teal-700 dark:text-teal-300 tabular-nums whitespace-nowrap font-extrabold">
                  {formatToman(Math.abs(netPosition))} {netPosition >= 0 ? '(بستانکار)' : '(بدهکار)'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Official Printable Signature Section */}
        <div className="hidden print:grid grid-cols-3 gap-6 p-6 border-t border-slate-300 mt-8 text-center text-xs text-slate-700">
          <div>
            <span className="block font-bold">امضای عضو صندوق</span>
            <span className="block text-[10px] text-slate-500 mt-1">{member.name}</span>
            <div className="h-16 border-b border-dashed border-slate-400 mt-4"></div>
          </div>
          <div>
            <span className="block font-bold">امضا و تایید حسابدار / دبیر</span>
            <span className="block text-[10px] text-slate-500 mt-1">تراز دفاتر معین</span>
            <div className="h-16 border-b border-dashed border-slate-400 mt-4"></div>
          </div>
          <div>
            <span className="block font-bold">مهر و امضای مدیر صندوق</span>
            <span className="block text-[10px] text-slate-500 mt-1">{fundProfile?.accountHolder || 'پدر (مدیر اصلی)'}</span>
            <div className="h-16 border-b border-dashed border-slate-400 mt-4"></div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs print:hidden">
          <span className="text-slate-500">
            کلیه ارقام منطبق بر اسناد دفتر روزنامه و تاییدیه فیش‌های واریزی است.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ صورتحساب</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-600 transition cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
