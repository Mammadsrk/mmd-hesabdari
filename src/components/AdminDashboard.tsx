import React, { useState } from 'react';
import {
  User,
  FundWallets,
  Loan,
  QueueItem,
  Receipt,
  EntertainmentExpense,
  JournalEntry,
  FundProfile,
  AppNotification,
} from '../types';
import { formatToman, toPersianDigits } from '../services/fundService';
import { initialFundProfile } from '../data/initialData';
import {
  Landmark,
  Scale,
  Wallet,
  CreditCard,
  Users,
  FileText,
  Clock,
  SlidersHorizontal,
  Plus,
  Download,
  Check,
  X,
  Eye,
  Shield,
  Trash2,
  Edit3,
  ChevronUp,
  ChevronDown,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  UserCheck,
  AlertCircle,
  FileCheck2,
  BookOpen,
} from 'lucide-react';
import { BalanceSheetView } from './admin/BalanceSheetView';
import { TreasuryCashFlowView } from './admin/TreasuryCashFlowView';
import { LoansPortfolioView } from './admin/LoansPortfolioView';
import { BankingSettingsView } from './admin/BankingSettingsView';
import { AccountingLedgersView } from './admin/AccountingLedgersView';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  wallets: FundWallets;
  loans: Loan[];
  queue: QueueItem[];
  receipts: Receipt[];
  entertainmentExpenses: EntertainmentExpense[];
  journalEntries?: JournalEntry[];
  fundProfile?: FundProfile;
  notifications?: AppNotification[];
  onApproveReceipt: (receiptId: string) => void;
  onRejectReceipt: (receiptId: string, reason: string) => void;
  onMoveQueue: (queueId: string, direction: 'up' | 'down') => void;
  onOpenNewLoanModal: (type: 'rotating' | 'emergency', preselectedUserId?: string) => void;
  onOpenEntertainmentDisburseModal: () => void;
  onToggleDelegation: (userId: string) => void;
  onExportCSV: () => void;
  onViewReceiptDetail: (receipt: Receipt) => void;
  onOpenAddMemberModal: () => void;
  onOpenManualInstallmentModal: (preselectedLoanId?: string) => void;
  onOpenEditLoanModal: (loan: Loan) => void;
  onDeleteMember: (memberId: string) => void;
  onSwitchToMember?: () => void;
  onOpenManualJournalModal?: () => void;
  onDeleteJournalEntry?: (entryId: string) => void;
  onUpdateFundProfile?: (updated: Partial<FundProfile>) => void;
  onRestoreBackup?: (restoredData: any) => void;
  onOpenMemberLedger?: (member: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  allUsers,
  wallets,
  loans,
  queue,
  receipts,
  entertainmentExpenses,
  journalEntries = [],
  fundProfile,
  notifications = [],
  onApproveReceipt,
  onRejectReceipt,
  onMoveQueue,
  onOpenNewLoanModal,
  onOpenEntertainmentDisburseModal,
  onToggleDelegation,
  onExportCSV,
  onViewReceiptDetail,
  onOpenAddMemberModal,
  onOpenManualInstallmentModal,
  onOpenEditLoanModal,
  onDeleteMember,
  onSwitchToMember,
  onOpenManualJournalModal,
  onDeleteJournalEntry,
  onUpdateFundProfile,
  onRestoreBackup,
  onOpenMemberLedger,
}) => {
  const [adminTab, setAdminTab] = useState<
    'treasury' | 'general_ledger' | 'loans' | 'members' | 'receipts' | 'queue' | 'settings'
  >('treasury');
  const [receiptFilter, setReceiptFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');
  const [rejectModalReceiptId, setRejectModalReceiptId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  // Financial summary metrics
  const totalCashPool = wallets.monthlyDuesBalance + wallets.emergencyFundBalance + wallets.entertainmentFundBalance;
  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalOutstandingLoanAmount = activeLoans.reduce((acc, l) => {
    const remainingInst = l.totalInstallments - l.paidInstallments;
    return acc + remainingInst * l.monthlyInstallmentAmount;
  }, 0);

  // Pending receipts count
  const pendingReceipts = receipts.filter((r) => r.status === 'pending');
  const filteredReceipts = receipts.filter((r) => {
    if (receiptFilter === 'all') return true;
    return r.status === receiptFilter;
  });

  // Filtered members for ledger
  const filteredMembers = allUsers.filter((u) => {
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.familyRelation.toLowerCase().includes(q) ||
      u.phoneNumber.includes(q)
    );
  });

  const handleConfirmReject = () => {
    if (!rejectModalReceiptId) return;
    onRejectReceipt(rejectModalReceiptId, rejectionReasonInput || 'عدم نشست وجه در حساب یا مغایرت فیش');
    setRejectModalReceiptId(null);
    setRejectionReasonInput('');
  };

  const handleExecuteDeleteMember = () => {
    if (!confirmDeleteUser) return;
    onDeleteMember(confirmDeleteUser.id);
    setConfirmDeleteUser(null);
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-1 sm:px-2 text-slate-900 dark:text-slate-100">
      {/* 1. Header Cockpit for Father */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-4 sm:p-5 text-white shadow-xl border border-teal-600/30 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0 shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  میز مدیریت مالی و بانکداری صندوق (پدر)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-400/30">
                  مدیر کل ارشد
                </span>
              </div>
              <p className="text-[11px] text-teal-200/80 mt-0.5">
                سیستم جامع حسابداری، خزانه‌داری دوطرفه، پرونده‌های تسهیلات و نظارت بر گردش مالی اعضا
              </p>
            </div>
          </div>

          {onSwitchToMember && (
            <button
              onClick={onSwitchToMember}
              className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>مشاهده کارت و پس‌انداز شخصی من</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Actions Row */}
        <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={onOpenAddMemberModal}
            className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>عضو جدید</span>
          </button>

          <button
            onClick={() => onOpenManualInstallmentModal()}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 border border-white/15 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-teal-300" />
            <span>ثبت قسط دستی</span>
          </button>

          <button
            onClick={() => onOpenNewLoanModal('rotating')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 border border-white/15 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-300" />
            <span>اعطای وام</span>
          </button>

          <button
            onClick={onExportCSV}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 border border-white/15 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-300" />
            <span>خروجی اکسل</span>
          </button>
        </div>
      </div>

      {/* Settings Flash Notice */}
      {settingsNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{settingsNotice}</span>
        </div>
      )}

      {/* 2. Sub-Tabs Navigation (Scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          onClick={() => setAdminTab('treasury')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'treasury'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>خزانه‌داری و نقدینگی</span>
        </button>

        <button
          onClick={() => setAdminTab('general_ledger')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'general_ledger'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>اسناد و دفاتر کل ({toPersianDigits(journalEntries.length)})</span>
        </button>

        <button
          onClick={() => setAdminTab('loans')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer tabular-nums ${
            adminTab === 'loans'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>پرتفوی وام‌ها ({toPersianDigits(loans.length)})</span>
        </button>

        <button
          onClick={() => setAdminTab('members')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer tabular-nums ${
            adminTab === 'members'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>دفتر معین اعضا ({toPersianDigits(allUsers.length)})</span>
        </button>

        <button
          onClick={() => setAdminTab('receipts')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer tabular-nums ${
            adminTab === 'receipts'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>کارتابل فیش‌ها</span>
          {pendingReceipts.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold tabular-nums">
              {toPersianDigits(pendingReceipts.length)}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('queue')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer tabular-nums ${
            adminTab === 'queue'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>نوبت‌بندی ({toPersianDigits(queue.length)})</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'settings'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>پارامترهای بانکی</span>
        </button>
      </div>

      {/* 3. Sub-Tab Content Views */}

      {/* TAB 1: TREASURY & 3-MONTH CASH FLOW */}
      {adminTab === 'treasury' && (
        <TreasuryCashFlowView
          wallets={wallets}
          allUsers={allUsers}
          loans={loans}
          expenses={entertainmentExpenses}
          onOpenEntertainmentModal={onOpenEntertainmentDisburseModal}
        />
      )}

      {/* TAB 2: COMPREHENSIVE ACCOUNTING & GENERAL LEDGERS */}
      {adminTab === 'general_ledger' && (
        <AccountingLedgersView
          wallets={wallets}
          loans={loans}
          allUsers={allUsers}
          expenses={entertainmentExpenses}
          journalEntries={journalEntries}
          fundProfile={fundProfile || initialFundProfile}
          receipts={receipts}
          queue={queue}
          notifications={notifications}
          currentUser={currentUser}
          onOpenManualJournalModal={onOpenManualJournalModal || (() => {})}
          onDeleteJournalEntry={onDeleteJournalEntry || (() => {})}
          onUpdateFundProfile={onUpdateFundProfile || (() => {})}
          onRestoreBackup={onRestoreBackup || (() => {})}
        />
      )}

      {/* TAB 3: LOANS PORTFOLIO DESK */}
      {adminTab === 'loans' && (
        <LoansPortfolioView
          loans={loans}
          allUsers={allUsers}
          onOpenManualInstallmentModal={onOpenManualInstallmentModal}
          onOpenEditLoanModal={onOpenEditLoanModal}
          onOpenNewLoanModal={onOpenNewLoanModal}
        />
      )}

      {/* TAB 4: SUBSIDIARY LEDGER PER MEMBER (دفتر معین تفصیلی اعضا) */}
      {adminTab === 'members' && (
        <div className="space-y-3">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="جستجوی نام، نسبت خانوادگی یا شماره تماس عضو..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>

            <button
              onClick={onOpenAddMemberModal}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن عضو جدید به صندوق</span>
            </button>
          </div>

          {/* Members Cards List */}
          <div className="grid grid-cols-1 gap-3">
            {filteredMembers.map((member, index) => {
              const activeMemberLoan = loans.find(
                (l) => l.memberId === member.id && l.status === 'active'
              );
              const remainingInstallments = activeMemberLoan
                ? activeMemberLoan.totalInstallments - activeMemberLoan.paidInstallments
                : (member.initialInstallmentsLeft || 0);

              const remainingDebt = activeMemberLoan
                ? remainingInstallments * activeMemberLoan.monthlyInstallmentAmount
                : (member.initialDebt || 0);

              const isFather = member.id === 'user_father';

              // Credit Score logic (simulated high reliability)
              const creditRating = remainingInstallments <= 3 ? 'A+' : remainingInstallments <= 7 ? 'A' : 'B+';

              return (
                <div
                  key={member.id}
                  className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 p-4 sm:p-4.5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-3 transition-all hover:border-teal-300/60 dark:hover:border-teal-700/60"
                >
                  {/* Member Profile Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                            {member.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {member.familyRelation}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                            معین #{String(index + 1).padStart(2, '0')}
                          </span>
                          {member.isDelegatedAdmin && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold border border-amber-300 dark:border-amber-800">
                              جانشین مدیر
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span dir="ltr">{member.phoneNumber}</span>
                          <span>•</span>
                          <span>رتبه اعتباری: {creditRating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Member Controls (Delete / Delegate) */}
                    <div className="flex items-center gap-1">
                      {!isFather && (
                        <button
                          onClick={() => onToggleDelegation(member.id)}
                          title="تفویض دسترسی مدیریت به این عضو"
                          className={`p-1.5 rounded-xl border text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                            member.isDelegatedAdmin
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200 dark:border-amber-800'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!isFather && (
                        <button
                          onClick={() => setConfirmDeleteUser(member)}
                          title="حذف عضو از صندوق"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financial Metrics Strip for Member */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-50/75 dark:bg-slate-800/45 backdrop-blur-xs border border-slate-100/90 dark:border-slate-800/60 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">سرمایه تودیعی (حق‌عضویت)</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                        {formatToman(member.totalPaidDues || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">اقساط باقیمانده</span>
                      <span className={`font-bold block mt-0.5 ${remainingInstallments > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                        {remainingInstallments > 0 ? `${remainingInstallments} قسط` : 'بدون وام فعال'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">مانده کل بدهی</span>
                      <span className={`font-bold block mt-0.5 ${remainingDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {remainingDebt > 0 ? formatToman(remainingDebt) : 'تسویه کامل'}
                      </span>
                    </div>
                  </div>

                  {/* Active Loan Details & Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100/90 dark:border-slate-800/70">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      {activeMemberLoan ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>
                            وام {activeMemberLoan.type === 'rotating' ? 'گردشی ۲٪' : 'ضروری'}:{' '}
                            {activeMemberLoan.paidInstallments} از {activeMemberLoan.totalInstallments} قسط پرداخت شده
                          </span>
                        </>
                      ) : (
                        <span>وام فعالی ثبت نشده است</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onOpenMemberLedger && (
                        <button
                          onClick={() => onOpenMemberLedger(member)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 active:scale-95 transition cursor-pointer"
                          title="مشاهده و چاپ صورتحساب معین تفصیلی"
                        >
                          <FileText className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          <span>معین حساب</span>
                        </button>
                      )}

                      {activeMemberLoan ? (
                        <>
                          <button
                            onClick={() => onOpenManualInstallmentModal(activeMemberLoan.id)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 hover:bg-emerald-100 flex items-center gap-1 active:scale-95 transition cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>ثبت قسط دستی</span>
                          </button>

                          <button
                            onClick={() => onOpenEditLoanModal(activeMemberLoan)}
                            className="px-2.5 py-1.5 text-[11px] font-medium rounded-xl text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 active:scale-95 transition cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>تنظیم اقساط</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onOpenNewLoanModal('rotating', member.id)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 flex items-center gap-1 active:scale-95 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>اعطای وام به {member.name}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: RECEIPTS / VOUCHERS INBOX (کارتابل اسناد و فیش‌ها) */}
      {adminTab === 'receipts' && (
        <div className="space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {(
              [
                { id: 'pending', label: 'در انتظار تایید', count: pendingReceipts.length },
                { id: 'all', label: 'همه فیش‌ها', count: receipts.length },
                {
                  id: 'approved',
                  label: 'تایید شده',
                  count: receipts.filter((r) => r.status === 'approved').length,
                },
                {
                  id: 'rejected',
                  label: 'رد شده',
                  count: receipts.filter((r) => r.status === 'rejected').length,
                },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setReceiptFilter(filter.id)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer tabular-nums ${
                  receiptFilter === filter.id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300'
                }`}
              >
                {filter.label} ({toPersianDigits(filter.count)})
              </button>
            ))}
          </div>

          {/* Receipts List */}
          {filteredReceipts.length === 0 ? (
            <div className="p-8 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/70 dark:border-slate-800/80 text-slate-400 text-xs shadow-xs">
              هیچ فیشی در این دسته‌بندی یافت نشد.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredReceipts.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onViewReceiptDetail(rec)}
                      className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 relative group shadow-2xs cursor-pointer"
                    >
                      <img
                        src={rec.receiptImageUrl}
                        alt="فیش"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </button>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          {rec.memberName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            rec.paymentType === 'monthly_due'
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              : rec.paymentType === 'loan_installment'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {rec.paymentType === 'monthly_due'
                            ? 'حق عضویت'
                            : rec.paymentType === 'loan_installment'
                            ? 'قسط وام'
                            : 'بازپرداخت ضروری'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{rec.submittedDate}</span>
                        <span>•</span>
                        <span>کد رهگیری: {rec.trackingCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-left">
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 block">
                        {formatToman(rec.amount)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          rec.status === 'approved'
                            ? 'text-emerald-600'
                            : rec.status === 'rejected'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {rec.status === 'approved'
                          ? 'تایید شده'
                          : rec.status === 'rejected'
                          ? 'رد شده'
                          : 'در انتظار'}
                      </span>
                    </div>

                    {rec.status === 'pending' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onApproveReceipt(rec.id)}
                          title="تایید و نشست وجه در حساب"
                          className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors active:scale-95 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRejectModalReceiptId(rec.id)}
                          title="رد فیش"
                          className="w-8 h-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors active:scale-95 shadow-xs cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: QUEUE PRIORITY REORDERING */}
      {adminTab === 'queue' && (
        <div className="space-y-2.5">
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl text-xs text-amber-900 dark:text-amber-300 backdrop-blur-xs">
            مدیر صندوق (پدر) می‌تواند با دکمه‌های بالا و پایین، ترتیب اولویت دریافت وام اعضا را تنظیم نماید.
          </div>

          <div className="space-y-2">
            {queue.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    {item.order}
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 block">
                      {item.memberName}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {item.estimatedDate} {item.notes ? `• ${item.notes}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={index === 0}
                    onClick={() => onMoveQueue(item.id, 'up')}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === queue.length - 1}
                    onClick={() => onMoveQueue(item.id, 'down')}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: BANKING CORE SETTINGS */}
      {adminTab === 'settings' && (
        <BankingSettingsView
          onSaveNotice={(msg) => {
            setSettingsNotice(msg);
            setTimeout(() => setSettingsNotice(null), 4000);
          }}
        />
      )}

      {/* Delete Member Confirmation Modal */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-3 text-right">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 text-center">
              آیا از حذف عضو «{confirmDeleteUser.name}» اطمینان دارید؟
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
              با حذف این عضو، نوبت وام ایشان از صف نوبت‌ها برداشته شده و دسترسی وی بسته خواهد شد.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteUser(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleExecuteDeleteMember}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                بله، حذف عضو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalReceiptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-3 text-right">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              دلیل رد فیش بانکی
            </h3>
            <input
              type="text"
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="مثال: فیش ناخوانا، عدم واریز به حساب..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRejectModalReceiptId(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white cursor-pointer"
              >
                تایید رد فیش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
