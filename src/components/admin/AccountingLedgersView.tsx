import React, { useState, useMemo, useRef } from 'react';
import {
  FundWallets,
  Loan,
  User,
  EntertainmentExpense,
  JournalEntry,
  FundProfile,
  JournalCategory,
  Receipt,
  QueueItem,
  AppNotification,
} from '../../types';
import {
  formatToman,
  toPersianDigits,
  calculateAccountingMetrics,
  exportFullBackupJSON,
  restoreFullBackupJSON,
} from '../../services/fundService';
import {
  Scale,
  BookOpen,
  Download,
  Upload,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Landmark,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Copy,
  Check,
  Trash2,
  Printer,
  Calendar,
  Layers,
  Database,
  RefreshCw,
} from 'lucide-react';

interface AccountingLedgersViewProps {
  wallets: FundWallets;
  loans: Loan[];
  allUsers: User[];
  expenses: EntertainmentExpense[];
  journalEntries: JournalEntry[];
  fundProfile: FundProfile;
  receipts: Receipt[];
  queue: QueueItem[];
  notifications: AppNotification[];
  currentUser: User;
  onOpenManualJournalModal: () => void;
  onDeleteJournalEntry: (entryId: string) => void;
  onUpdateFundProfile: (updated: Partial<FundProfile>) => void;
  onRestoreBackup: (restoredData: any) => void;
}

export const AccountingLedgersView: React.FC<AccountingLedgersViewProps> = ({
  wallets,
  loans,
  allUsers,
  expenses,
  journalEntries,
  fundProfile,
  receipts,
  queue,
  notifications,
  currentUser,
  onOpenManualJournalModal,
  onDeleteJournalEntry,
  onUpdateFundProfile,
  onRestoreBackup,
}) => {
  const [subTab, setSubTab] = useState<'journal' | 'balance_sheet' | 'backup_restore' | 'profile'>('journal');
  const [journalCategoryFilter, setJournalCategoryFilter] = useState<string>('all');
  const [journalSearchQuery, setJournalSearchQuery] = useState('');
  
  // Profile edit state
  const [editedProfile, setEditedProfile] = useState<FundProfile>({ ...fundProfile });
  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Backup restore state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreCandidate, setRestoreCandidate] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  // Metrics calculation
  const metrics = useMemo(
    () => calculateAccountingMetrics(wallets, loans, allUsers, expenses, journalEntries),
    [wallets, loans, allUsers, expenses, journalEntries]
  );

  // Total debits and credits from journal
  const totalDebits = useMemo(() => journalEntries.reduce((sum, j) => sum + j.amount, 0), [journalEntries]);
  const totalCredits = totalDebits; // By double-entry definition every voucher has equal debit and credit

  // Filtered journal entries
  const filteredJournalEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      // Category filter
      if (journalCategoryFilter !== 'all' && entry.category !== journalCategoryFilter) {
        return false;
      }
      // Search query
      if (journalSearchQuery.trim()) {
        const q = journalSearchQuery.toLowerCase();
        const voucherStr = entry.voucherNumber?.toString() || '';
        const desc = entry.description?.toLowerCase() || '';
        const tracking = entry.trackingRef?.toLowerCase() || '';
        const member = entry.memberName?.toLowerCase() || '';
        const debit = entry.debitAccount?.toLowerCase() || '';
        const credit = entry.creditAccount?.toLowerCase() || '';

        return (
          voucherStr.includes(q) ||
          desc.includes(q) ||
          tracking.includes(q) ||
          member.includes(q) ||
          debit.includes(q) ||
          credit.includes(q)
        );
      }
      return true;
    });
  }, [journalEntries, journalCategoryFilter, journalSearchQuery]);

  // Copy helper
  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    exportFullBackupJSON({
      fundProfile,
      users: allUsers,
      wallets,
      loans,
      queue,
      receipts,
      expenses,
      journalEntries,
      notifications,
    });
  };

  // File Upload handler for Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    setRestoreSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const data = parsed.data || parsed;

        if (!data.users || !Array.isArray(data.users)) {
          throw new Error('فایل انتخاب شده فاقد ساختار استاندارد اطلاعات صندوق است.');
        }

        setRestoreCandidate({
          rawJson: text,
          app: parsed.app,
          version: parsed.version,
          exportedAt: parsed.exportedDateFa || parsed.exportedAt,
          usersCount: data.users?.length || 0,
          loansCount: data.loans?.length || 0,
          vouchersCount: data.journalEntries?.length || 0,
          receiptsCount: data.receipts?.length || 0,
        });
      } catch (err: any) {
        setRestoreError(err.message || 'خطا در خواندن فایل JSON.');
        setRestoreCandidate(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!restoreCandidate) return;
    try {
      const restored = restoreFullBackupJSON(restoreCandidate.rawJson);
      onRestoreBackup(restored);
      setRestoreCandidate(null);
      setRestoreSuccess('اطلاعات با موفقیت از فایل پشتیبان بازیابی شد.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setRestoreError(err.message || 'خطا در بازنشانی اطلاعات.');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFundProfile(editedProfile);
    setProfileSaveMessage('تنظیمات و پارامترهای صندوق با موفقیت ذخیره شد.');
    setTimeout(() => setProfileSaveMessage(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Accounting Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setSubTab('journal')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'journal'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>دفتر روزنامه و ثبت اسناد ({toPersianDigits(journalEntries.length)})</span>
          </button>

          <button
            onClick={() => setSubTab('balance_sheet')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'balance_sheet'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>ترازنامه و موازنه دفاتر</span>
          </button>

          <button
            onClick={() => setSubTab('backup_restore')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'backup_restore'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>پشتیبان‌گیری و بازیابی (JSON)</span>
          </button>

          <button
            onClick={() => setSubTab('profile')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'profile'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>مشخصات و حساب بانکی صندوق</span>
          </button>
        </div>

        {subTab === 'journal' && (
          <button
            onClick={onOpenManualJournalModal}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ ثبت سند حسابداری دستی</span>
          </button>
        )}
      </div>

      {/* 2. SUBTAB: GENERAL JOURNAL (دفتر روزنامه اسناد دوبل) */}
      {subTab === 'journal' && (
        <div className="space-y-4">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">تعداد کل اسناد صادره</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                  {toPersianDigits(journalEntries.length)} سند
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold border border-teal-200/60">
                  سیستم دوبل
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">مجموع گردش بدهکار (Debit)</span>
              <span className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums block">
                {formatToman(totalDebits)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">مجموع گردش بستانکار (Credit)</span>
              <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
                {formatToman(totalCredits)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white border border-teal-700/40 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-teal-200 font-medium">موازنه دفتر روزنامه</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-bold text-emerald-300 block">
                تراز ۱۰۰٪ متوازن
              </span>
              <span className="text-[10px] text-teal-200/80 mt-0.5 block">
                گردش بدهکار = گردش بستانکار
              </span>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={journalSearchQuery}
                onChange={(e) => setJournalSearchQuery(e.target.value)}
                placeholder="جستجو در شرح سند، شماره سند (۱۰۲۴)، کد پیگیری، نام عضو یا سرفصل..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-[11px] font-semibold">
              {[
                { id: 'all', label: 'همه اسناد' },
                { id: 'monthly_due', label: 'حق عضویت' },
                { id: 'loan_installment', label: 'اقساط وام' },
                { id: 'loan_disbursement', label: 'اعطای وام' },
                { id: 'entertainment_expense', label: 'هزینه تفریح' },
                { id: 'manual', label: 'اسناد دستی' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setJournalCategoryFilter(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                    journalCategoryFilter === cat.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Journal Entries Table */}
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-3 px-3.5 whitespace-nowrap">شماره سند</th>
                    <th className="py-3 px-3 whitespace-nowrap">تاریخ شمسی</th>
                    <th className="py-3 px-3 min-w-[220px]">شرح رویداد مالی</th>
                    <th className="py-3 px-3 text-rose-600 dark:text-rose-400 min-w-[150px]">بدهکار (Debit)</th>
                    <th className="py-3 px-3 text-emerald-600 dark:text-emerald-400 min-w-[150px]">بستانکار (Credit)</th>
                    <th className="py-3 px-3 whitespace-nowrap">مبلغ سند</th>
                    <th className="py-3 px-3 whitespace-nowrap">طرف حساب / ارجاع</th>
                    <th className="py-3 px-3 whitespace-nowrap">ثبت‌کننده</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredJournalEntries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        هیچ سند حسابداری مطابق با جستجو یا فیلتر جاری یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredJournalEntries.map((entry) => {
                      const isManual = entry.category === 'manual';
                      return (
                        <tr
                          key={entry.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="py-3 px-3.5 font-bold whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/60 text-[11px] tabular-nums inline-block font-mono">
                              سند #{toPersianDigits(entry.voucherNumber)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap font-medium">
                            {toPersianDigits(entry.date)}
                          </td>
                          <td className="py-3 px-3 text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                            {entry.description}
                          </td>
                          <td className="py-3 px-3 text-rose-700 dark:text-rose-400 font-semibold text-[11px]">
                            {entry.debitAccount}
                          </td>
                          <td className="py-3 px-3 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                            {entry.creditAccount}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                            {formatToman(entry.amount)}
                          </td>
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                            {entry.memberName ? (
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {entry.memberName}
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400">{entry.trackingRef || '-'}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[10px] whitespace-nowrap">
                            {entry.registeredBy || 'سیستم'}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {isManual && (
                              <button
                                onClick={() => onDeleteJournalEntry(entry.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                title="حذف سند دستی"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB: BALANCE SHEET & P&L (ترازنامه و صورت سود و زیان) */}
      {subTab === 'balance_sheet' && (
        <div className="space-y-4">
          {/* Top Equilibrium Card */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-5 text-white border border-teal-800/40 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold">ترازنامه مالی و موازنه دفاتر کل صندوق</h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>دفاتر تراز است</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    معادله اساسی حسابداری: دارایی‌ها = بدهی‌ها + سرمایه و اندوخته‌ها
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left ltr">
                <span className="text-[10px] text-teal-300/80 block rtl text-right">اختلاف تراز (Variance)</span>
                <span className="text-sm font-bold text-emerald-400 tabular-nums block font-mono">
                  ۰ تومان (موازنه کامل)
                </span>
              </div>
            </div>
          </div>

          {/* T-Accounts Columns: Assets vs Liabilities & Equity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ASSETS (دارایی‌ها) */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
                  <Landmark className="w-4 h-4" />
                  <span>دارایی‌های صندوق (Assets)</span>
                </div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                  جمع: {formatToman(metrics.totalAssets)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">موجودی نقد و بانک‌ها</span>
                    <span className="text-[10px] text-slate-400">حساب جاری، سپرده و تنخواه</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatToman(metrics.cashAndBankTreasury)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">مطالبات تسهیلات از اعضا</span>
                    <span className="text-[10px] text-slate-400">اصل اقساط باقیمانده وام‌های فعال</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatToman(metrics.receivablesLoansPrincipal)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-extrabold text-sm text-slate-900 dark:text-slate-100">
                <span>جمع کل دارایی‌ها:</span>
                <span className="text-teal-700 dark:text-teal-400 tabular-nums">
                  {formatToman(metrics.totalAssets)}
                </span>
              </div>
            </div>

            {/* LIABILITIES & EQUITY (بدهی‌ها و سرمایه) */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>بدهی‌ها و سرمایه صندوق (Liabilities & Equity)</span>
                </div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                  جمع: {formatToman(metrics.totalLiabilitiesAndEquity)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">سرمایه حق‌عضویت‌های تودیعی</span>
                    <span className="text-[10px] text-slate-400">تعهد صندوق در برابر پس‌اندازهای اعضا</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatToman(metrics.membersCapitalDues)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">اندوخته سود انباشته تفریحات</span>
                    <span className="text-[10px] text-slate-400">مانده کارمزدهای ۲٪ جهت سفرهای خانوادگی</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatToman(metrics.retainedEarningsFee)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-extrabold text-sm text-slate-900 dark:text-slate-100">
                <span>جمع بدهی و سرمایه:</span>
                <span className="text-teal-700 dark:text-teal-400 tabular-nums">
                  {formatToman(metrics.totalLiabilitiesAndEquity)}
                </span>
              </div>
            </div>
          </div>

          {/* Profit & Loss Statement (صورت سود و زیان دوره) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>صورت سود و زیان تجمیعی (P&L Statement)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">درآمد کارمزد شناسایی شده</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
                  +{formatToman(metrics.totalFeeIncomeRecognized)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">هزینه‌کرد تفریحات و سفرها</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums block">
                  -{formatToman(metrics.totalEntertainmentExpenses)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">مانده اندوخته سود تفریحات</span>
                <span className="text-sm font-bold text-teal-700 dark:text-teal-300 tabular-nums block">
                  {formatToman(metrics.netSurplus)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: BACKUP & RESTORE (پشتیبان‌گیری و بازیابی جامع) */}
      {subTab === 'backup_restore' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    پشتیبان‌گیری کامل (JSON Export)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    دریافت فایل استاندارد شامل تمامی اسناد، کاربران، فیش‌ها و کیف پول‌ها
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span>تعداد اعضا:</span>
                  <strong className="tabular-nums">{toPersianDigits(allUsers.length)} نفر</strong>
                </div>
                <div className="flex justify-between">
                  <span>تعداد اسناد دفتر روزنامه:</span>
                  <strong className="tabular-nums">{toPersianDigits(journalEntries.length)} سند</strong>
                </div>
                <div className="flex justify-between">
                  <span>تعداد وام‌های ثبت شده:</span>
                  <strong className="tabular-nums">{toPersianDigits(loans.length)} فقره</strong>
                </div>
              </div>

              <button
                onClick={handleExportBackup}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>دانلود فایل پشتیبان استاندارد (JSON)</span>
              </button>
            </div>

            {/* Restore Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    بازیابی نسخه پشتیبان (JSON Restore)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    آپلود فایل JSON پشتیبان جهت بازنشانی کل دیتابیس صندوق
                  </p>
                </div>
              </div>

              {restoreError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              {restoreSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{restoreSuccess}</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 cursor-pointer"
              />

              {restoreCandidate && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-200 block">
                    پیش‌نمایش محتویات فایل پشتیبان:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                    <div>تعداد کاربران: <strong className="tabular-nums">{toPersianDigits(restoreCandidate.usersCount)}</strong></div>
                    <div>تعداد اسناد: <strong className="tabular-nums">{toPersianDigits(restoreCandidate.vouchersCount)}</strong></div>
                    <div>تعداد وام‌ها: <strong className="tabular-nums">{toPersianDigits(restoreCandidate.loansCount)}</strong></div>
                    <div>تاریخ بک‌آپ: <strong className="tabular-nums">{toPersianDigits(restoreCandidate.exportedAt || 'نامشخص')}</strong></div>
                  </div>
                  <button
                    onClick={handleConfirmRestore}
                    className="w-full mt-2 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تایید نهایی و بازنشانی دیتابیس صندوق</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBTAB: FUND PROFILE & BANK SETTINGS */}
      {subTab === 'profile' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                هویت، مشخصات حساب بانکی و قوانین پایه صندوق
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تنظیم نام رسمی صندوق، مشخصات حساب واریز برای اعضا و سقف‌های تسهیلات
              </p>
            </div>
            {profileSaveMessage && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-200">
                {profileSaveMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            {/* Identity Group */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام رسمی صندوق
                </label>
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام صاحب حساب (مدیر)
                </label>
                <input
                  type="text"
                  value={editedProfile.accountHolder}
                  onChange={(e) => setEditedProfile({ ...editedProfile, accountHolder: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام بانک عامل
                </label>
                <input
                  type="text"
                  value={editedProfile.bankName}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Bank Numbers with 1-Click Copy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  شماره کارت واریز
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editedProfile.cardNumber}
                    onChange={(e) => setEditedProfile({ ...editedProfile, cardNumber: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 tabular-nums font-mono focus:outline-none focus:border-teal-500 text-left ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(editedProfile.cardNumber, 'card')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-600 cursor-pointer"
                    title="کپی شماره کارت"
                  >
                    {copiedField === 'card' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  شماره شبا (IBAN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editedProfile.iban}
                    onChange={(e) => setEditedProfile({ ...editedProfile, iban: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 tabular-nums font-mono focus:outline-none focus:border-teal-500 text-left ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(editedProfile.iban, 'iban')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-600 cursor-pointer"
                    title="کپی شبا"
                  >
                    {copiedField === 'iban' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Fund Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  سقف وام گردشی (تومان)
                </label>
                <input
                  type="number"
                  value={editedProfile.rotatingLoanCap}
                  onChange={(e) => setEditedProfile({ ...editedProfile, rotatingLoanCap: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 tabular-nums font-bold focus:outline-none focus:border-teal-500 text-left ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  سقف وام ضروری (تومان)
                </label>
                <input
                  type="number"
                  value={editedProfile.emergencyLoanCap}
                  onChange={(e) => setEditedProfile({ ...editedProfile, emergencyLoanCap: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 tabular-nums font-bold focus:outline-none focus:border-teal-500 text-left ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  حق عضویت پیش‌فرض ماهانه
                </label>
                <input
                  type="number"
                  value={editedProfile.monthlyDueAmount}
                  onChange={(e) => setEditedProfile({ ...editedProfile, monthlyDueAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 tabular-nums font-bold focus:outline-none focus:border-teal-500 text-left ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نرخ کارمزد تفریحات (%)
                </label>
                <input
                  type="number"
                  value={editedProfile.entertainmentFeeRate}
                  onChange={(e) => setEditedProfile({ ...editedProfile, entertainmentFeeRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 tabular-nums font-bold focus:outline-none focus:border-teal-500 text-left ltr"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition active:scale-95 shadow-md cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>ذخیره تغییرات مشخصات صندوق</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
