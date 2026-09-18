/**
 * Family Loan & Savings Fund Web App (PWA)
 * سامانه مدیریت صندوق وام و پس‌انداز خانوادگی
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Loan,
  QueueItem,
  Receipt,
  FundWallets,
  EntertainmentExpense,
  AppNotification,
  PaymentType,
  LoanType,
  JournalEntry,
  FundProfile,
} from './types';
import {
  loadInitialFundState,
  persistFundState,
  processReceiptVerification,
  disburseLoan,
  disburseEntertainmentExpense,
  reorderQueue,
  exportFinancialRecordsToCSV,
  addMember,
  deleteMember,
  recordManualInstallmentPayment,
  adjustLoanInstallments,
  deleteEntertainmentExpense,
  addManualJournalEntry,
  deleteJournalEntry,
  updateFundProfile,
} from './services/fundService';
import { initialFundProfile } from './data/initialData';
import { Header } from './components/Header';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { QueueViewer } from './components/QueueViewer';
import { DatabaseSchemaViewer } from './components/DatabaseSchemaViewer';
import { EntertainmentView } from './components/EntertainmentView';
import { MobileBottomNav, MainNavTab } from './components/MobileBottomNav';
import { UserSwitcherSheet } from './components/UserSwitcherSheet';
import { ReceiptModal } from './components/ReceiptModal';
import { NewLoanModal } from './components/NewLoanModal';
import { EntertainmentDisbursementModal } from './components/EntertainmentDisbursementModal';
import { ReceiptDetailModal } from './components/ReceiptDetailModal';
import { NotificationsModal } from './components/NotificationsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AddMemberModal } from './components/AddMemberModal';
import { ManualInstallmentModal } from './components/ManualInstallmentModal';
import { EditMemberDebtModal } from './components/EditMemberDebtModal';
import { MemberLedgerModal } from './components/modals/MemberLedgerModal';
import { ManualJournalEntryModal } from './components/modals/ManualJournalEntryModal';

export default function App() {
  // Load persistent state
  const [appState, setAppState] = useState(() => loadInitialFundState());
  const {
    users,
    wallets,
    loans,
    queue,
    receipts,
    expenses,
    notifications,
    journalEntries = [],
    fundProfile = initialFundProfile,
  } = appState;

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Active current user (default: Admin - father)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return users.find((u) => u.role === 'admin') || users[0];
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<MainNavTab>('dashboard');

  // Modal & Sheet States
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptPrefillType, setReceiptPrefillType] = useState<PaymentType>('monthly_due');
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [loanModalType, setLoanModalType] = useState<LoanType>('rotating');
  const [loanModalPreselectedUser, setLoanModalPreselectedUser] = useState<string | undefined>();
  const [isEntertainmentModalOpen, setIsEntertainmentModalOpen] = useState(false);
  const [isNotifsModalOpen, setIsNotifsModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  // New Management Modals (Added for user request)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isManualPaymentModalOpen, setIsManualPaymentModalOpen] = useState(false);
  const [manualPaymentPreselectedLoanId, setManualPaymentPreselectedLoanId] = useState<string | undefined>();
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Accounting & Subsidiary Ledger Modals
  const [selectedLedgerMember, setSelectedLedgerMember] = useState<User | null>(null);
  const [isManualJournalModalOpen, setIsManualJournalModalOpen] = useState(false);

  // Sync state changes to storage
  useEffect(() => {
    persistFundState(appState);
  }, [appState]);

  // Keep currentUser reference updated if users change
  useEffect(() => {
    const updated = users.find((u) => u.id === currentUser.id);
    if (updated) setCurrentUser(updated);
  }, [users, currentUser.id]);

  const isAdmin = currentUser.role === 'admin' || currentUser.isDelegatedAdmin;

  // Count unread notifications
  const unreadNotifsCount = notifications.filter(
    (n) => (n.targetUserId === currentUser.id || n.targetUserId === 'all') && !n.isRead
  ).length;

  const pendingReceiptsCount = receipts.filter((r) => r.status === 'pending').length;

  // ===================== ACTIONS ===================== //

  // 1. Submit a receipt
  const handleSubmitNewReceipt = (newReceiptData: Omit<Receipt, 'id' | 'status' | 'submittedDate'>) => {
    const newReceipt: Receipt = {
      ...newReceiptData,
      id: `rec_${Date.now()}`,
      status: 'pending',
      submittedDate: new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date()),
    };

    const adminNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'فیش واریزی جدید دریافت شد',
      message: `${newReceipt.memberName} یک فیش به مبلغ ${new Intl.NumberFormat('fa-IR').format(
        newReceipt.amount
      )} تومان ثبت کرد.`,
      type: 'info',
      createdAt: 'لحظاتی پیش',
      isRead: false,
      targetUserId: 'user_father',
    };

    setAppState((prev) => ({
      ...prev,
      receipts: [newReceipt, ...prev.receipts],
      notifications: [adminNotif, ...prev.notifications],
    }));
  };

  // 2. Approve a receipt (Admin)
  const handleApproveReceipt = (receiptId: string) => {
    try {
      const result = processReceiptVerification(receiptId, 'approve', currentUser, '', appState);
      setAppState((prev) => ({
        ...prev,
        ...result,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در تایید فیش');
    }
  };

  // 3. Reject a receipt (Admin)
  const handleRejectReceipt = (receiptId: string, reason: string) => {
    try {
      const result = processReceiptVerification(receiptId, 'reject', currentUser, reason, appState);
      setAppState((prev) => ({
        ...prev,
        ...result,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در رد فیش');
    }
  };

  // 4. Grant a loan (Admin)
  const handleGrantLoan = (
    memberId: string,
    type: LoanType,
    principalAmount: number,
    profitRate: number,
    totalInstallments: number,
    dueDateDesc: string,
    purposeNote: string
  ) => {
    try {
      const result = disburseLoan(
        memberId,
        type,
        principalAmount,
        profitRate,
        totalInstallments,
        dueDateDesc,
        purposeNote,
        appState
      );
      setAppState((prev) => ({
        ...prev,
        ...result,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در اعطای وام');
    }
  };

  // 5. Disburse from Entertainment Fund (Admin)
  const handleDisburseEntertainment = (title: string, amount: number, description: string) => {
    try {
      const result = disburseEntertainmentExpense(
        title,
        amount,
        description,
        currentUser,
        appState
      );
      setAppState((prev) => ({
        ...prev,
        ...result,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در برداشت از صندوق تفریحات');
    }
  };

  // 6. Delete Entertainment Expense (Admin)
  const handleDeleteEntertainmentExpense = (expenseId: string) => {
    try {
      const result = deleteEntertainmentExpense(expenseId, appState);
      setAppState((prev) => ({
        ...prev,
        ...result,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در حذف هزینه');
    }
  };

  // 7. Add Member (Admin)
  const handleAddMember = (memberData: {
    name: string;
    familyRelation: string;
    phoneNumber: string;
    monthlyDueAmount: number;
    initialDebt?: number;
    initialInstallmentsLeft?: number;
    notes?: string;
  }) => {
    try {
      const result = addMember(memberData, appState);
      setAppState((prev) => ({
        ...prev,
        ...result,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در افزودن عضو');
    }
  };

  // 8. Delete Member (Admin)
  const handleDeleteMember = (memberId: string) => {
    try {
      const result = deleteMember(memberId, appState);
      setAppState((prev) => ({
        ...prev,
        ...result,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در حذف عضو');
    }
  };

  // 9. Manual Installment Payment (Admin)
  const handleRecordManualPayment = (
    loanId: string,
    installmentsCount: number,
    paymentMethod: 'cash' | 'card_to_card' | 'bank_transfer',
    notes: string,
    customAmount?: number
  ) => {
    try {
      const result = recordManualInstallmentPayment(
        loanId,
        installmentsCount,
        paymentMethod,
        notes,
        currentUser,
        customAmount,
        appState
      );
      setAppState((prev) => ({
        ...prev,
        ...result,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در ثبت دستی قسط');
    }
  };

  // 10. Adjust Loan Installments / Debt (Admin)
  const handleAdjustLoan = (
    loanId: string,
    totalInstallments: number,
    paidInstallments: number,
    purposeNote: string
  ) => {
    try {
      const result = adjustLoanInstallments(loanId, totalInstallments, paidInstallments, purposeNote, appState);
      setAppState((prev) => ({
        ...prev,
        ...result,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در ویرایش اقساط وام');
    }
  };

  // 11. Move Queue Order (Admin)
  const handleMoveQueue = (itemId: string, direction: 'up' | 'down') => {
    const nextQueue = reorderQueue(queue, itemId, direction);
    setAppState((prev) => ({ ...prev, queue: nextQueue }));
  };

  // 12. Toggle delegation of admin role to a family member (Father only)
  const handleToggleDelegation = (targetUserId: string) => {
    if (currentUser.id !== 'user_father') {
      alert('فقط پدر (مدیر ارشد) مجاز به واگذاری موقت پنل مدیریت است.');
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === targetUserId) {
        return { ...u, isDelegatedAdmin: !u.isDelegatedAdmin };
      }
      return u;
    });

    setAppState((prev) => ({ ...prev, users: updatedUsers }));
  };

  // 13. Mark all notifs as read
  const handleMarkAllNotifsAsRead = () => {
    const updated = notifications.map((n) => {
      if (n.targetUserId === currentUser.id || n.targetUserId === 'all') {
        return { ...n, isRead: true };
      }
      return n;
    });
    setAppState((prev) => ({ ...prev, notifications: updated }));
  };

  // 14. Export Financial Data
  const handleExportCSV = () => {
    exportFinancialRecordsToCSV(users, wallets, loans, receipts, expenses);
  };

  // 15. Add Manual Journal Entry (Double-Entry Ledger Log)
  const handleAddManualJournalEntry = (
    newEntryData: {
      description: string;
      debitAccount: string;
      creditAccount: string;
      amount: number;
      trackingRef?: string;
      category?: any;
      memberId?: string;
      memberName?: string;
      date?: string;
    }
  ) => {
    try {
      const result = addManualJournalEntry(newEntryData, currentUser, {
        journalEntries,
        notifications,
      });
      setAppState((prev) => ({
        ...prev,
        journalEntries: result.journalEntries,
        notifications: result.notifications,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در ثبت سند حسابداری دستی');
    }
  };

  // 16. Delete Journal Entry
  const handleDeleteJournalEntry = (entryId: string) => {
    try {
      const result = deleteJournalEntry(entryId, { journalEntries });
      setAppState((prev) => ({
        ...prev,
        journalEntries: result.journalEntries,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در حذف سند');
    }
  };

  // 17. Update Fund Profile & Parameters
  const handleUpdateFundProfile = (updated: Partial<FundProfile>) => {
    try {
      const next = updateFundProfile(updated, fundProfile);
      setAppState((prev) => ({
        ...prev,
        fundProfile: next,
      }));
    } catch (e: any) {
      alert(e.message || 'خطا در ذخیره مشخصات صندوق');
    }
  };

  // 18. Restore Full Backup
  const handleRestoreBackup = (restoredData: any) => {
    setAppState(restoredData);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col pb-20 md:pb-0 transition-colors relative overflow-x-hidden">
      {/* Soft Ambient Background Glows for Glassmorphism Depth */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 left-10 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top App Header */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotifsModalOpen(true)}
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl md:max-w-4xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5">
        {/* Tab 1: Member Dashboard */}
        {activeTab === 'dashboard' && (
          <MemberDashboard
            currentUser={currentUser}
            loans={loans}
            queue={queue}
            receipts={receipts}
            onOpenNewReceiptModal={(prefill) => {
              setReceiptPrefillType(prefill || 'monthly_due');
              setIsReceiptModalOpen(true);
            }}
            onViewQueue={() => setActiveTab('queue')}
            onViewReceiptDetail={(rec) => setViewingReceipt(rec)}
            isAdmin={isAdmin}
            onSwitchToAdmin={() => setActiveTab('admin')}
            onOpenMyLedger={() => setSelectedLedgerMember(currentUser)}
          />
        )}

        {/* Tab: Admin View directly accessible */}
        {activeTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            allUsers={users}
            wallets={wallets}
            loans={loans}
            queue={queue}
            receipts={receipts}
            entertainmentExpenses={expenses}
            journalEntries={journalEntries}
            fundProfile={fundProfile}
            notifications={notifications}
            onApproveReceipt={handleApproveReceipt}
            onRejectReceipt={handleRejectReceipt}
            onMoveQueue={handleMoveQueue}
            onOpenNewLoanModal={(type, userId) => {
              setLoanModalType(type);
              setLoanModalPreselectedUser(userId);
              setIsNewLoanModalOpen(true);
            }}
            onOpenEntertainmentDisburseModal={() => setIsEntertainmentModalOpen(true)}
            onToggleDelegation={handleToggleDelegation}
            onExportCSV={handleExportCSV}
            onViewReceiptDetail={(rec) => setViewingReceipt(rec)}
            onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
            onOpenManualInstallmentModal={(loanId) => {
              setManualPaymentPreselectedLoanId(loanId);
              setIsManualPaymentModalOpen(true);
            }}
            onOpenEditLoanModal={(loan) => setEditingLoan(loan)}
            onDeleteMember={handleDeleteMember}
            onSwitchToMember={() => setActiveTab('dashboard')}
            onOpenManualJournalModal={() => setIsManualJournalModalOpen(true)}
            onDeleteJournalEntry={handleDeleteJournalEntry}
            onUpdateFundProfile={handleUpdateFundProfile}
            onRestoreBackup={handleRestoreBackup}
            onOpenMemberLedger={(member) => setSelectedLedgerMember(member)}
          />
        )}

        {/* Tab: Transparent Queue Viewer */}
        {activeTab === 'queue' && (
          <QueueViewer
            queue={queue}
            allUsers={users}
            currentUserId={currentUser.id}
          />
        )}

        {/* Tab: Entertainment Fund View */}
        {activeTab === 'entertainment' && (
          <EntertainmentView
            wallets={wallets}
            expenses={expenses}
            currentUser={currentUser}
            onOpenDisburseModal={() => setIsEntertainmentModalOpen(true)}
            onDeleteExpense={handleDeleteEntertainmentExpense}
          />
        )}

        {/* Tab: Phase 1 Database Schema Viewer */}
        {activeTab === 'schema' && <DatabaseSchemaViewer />}
      </main>

      {/* Floating Offline Network Indicator */}
      <OfflineIndicator />

      {/* Mobile Bottom Navigation Bar (PWA Phone Experience) */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        onOpenNewReceiptModal={() => {
          setReceiptPrefillType('monthly_due');
          setIsReceiptModalOpen(true);
        }}
        currentUser={currentUser}
        pendingReceiptsCount={pendingReceiptsCount}
      />

      {/* Mobile-Friendly User Switcher Bottom Sheet */}
      <UserSwitcherSheet
        isOpen={isUserSwitcherOpen}
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          setIsUserSwitcherOpen(false);
        }}
        onClose={() => setIsUserSwitcherOpen(false)}
      />

      {/* MODAL 1: Submit Receipt (Bottom Sheet) */}
      <ReceiptModal
        currentUser={currentUser}
        isOpen={isReceiptModalOpen}
        prefillType={receiptPrefillType}
        onClose={() => setIsReceiptModalOpen(false)}
        onSubmitReceipt={handleSubmitNewReceipt}
      />

      {/* MODAL 2: Grant New Loan (Admin) */}
      <NewLoanModal
        isOpen={isNewLoanModalOpen}
        type={loanModalType}
        allUsers={users}
        wallets={wallets}
        preselectedUserId={loanModalPreselectedUser}
        onClose={() => setIsNewLoanModalOpen(false)}
        onSubmit={handleGrantLoan}
      />

      {/* MODAL 3: Entertainment Disbursement (Admin) */}
      <EntertainmentDisbursementModal
        isOpen={isEntertainmentModalOpen}
        entertainmentBalance={wallets.entertainmentFundBalance}
        onClose={() => setIsEntertainmentModalOpen(false)}
        onSubmit={handleDisburseEntertainment}
      />

      {/* MODAL 4: Receipt Full Details & Viewer */}
      <ReceiptDetailModal
        receipt={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        onApprove={handleApproveReceipt}
        canApprove={isAdmin}
      />

      {/* MODAL 5: Notifications Modal */}
      <NotificationsModal
        isOpen={isNotifsModalOpen}
        notifications={notifications}
        currentUserId={currentUser.id}
        onClose={() => setIsNotifsModalOpen(false)}
        onMarkAllAsRead={handleMarkAllNotifsAsRead}
      />

      {/* MODAL 6: Add Member Modal (Father / Admin) */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
      />

      {/* MODAL 7: Manual Installment Payment Modal (Father / Admin) */}
      <ManualInstallmentModal
        isOpen={isManualPaymentModalOpen}
        loans={loans}
        users={users}
        preselectedLoanId={manualPaymentPreselectedLoanId}
        onClose={() => setIsManualPaymentModalOpen(false)}
        onSubmit={handleRecordManualPayment}
      />

      {/* MODAL 8: Edit Loan / Debt Modal (Father / Admin) */}
      <EditMemberDebtModal
        isOpen={!!editingLoan}
        loan={editingLoan}
        onClose={() => setEditingLoan(null)}
        onSubmit={handleAdjustLoan}
      />

      {/* MODAL 9: Detailed Subsidiary Ledger Modal (Member Statement) */}
      <MemberLedgerModal
        isOpen={!!selectedLedgerMember}
        member={selectedLedgerMember}
        allLoans={loans}
        allReceipts={receipts}
        allJournalEntries={journalEntries}
        fundProfile={fundProfile}
        onClose={() => setSelectedLedgerMember(null)}
      />

      {/* MODAL 10: Manual Accounting Journal Entry Voucher Modal (Double-Entry) */}
      <ManualJournalEntryModal
        isOpen={isManualJournalModalOpen}
        allUsers={users}
        onClose={() => setIsManualJournalModalOpen(false)}
        onSave={handleAddManualJournalEntry}
      />
    </div>
  );
}
