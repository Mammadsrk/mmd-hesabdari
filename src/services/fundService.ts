/**
 * Phase 2: Logic Functions & State Engine for Family Loan & Savings Fund
 * فاز ۲: کدهای لاجیک، محاسبات مالی، تایید فیش، مدیریت صف و صندوق تفریحات
 */

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
} from '../types';
import {
  initialUsers,
  initialWallets,
  initialLoans,
  initialQueue,
  initialReceipts,
  initialEntertainmentExpenses,
  initialNotifications,
  initialJournalEntries,
  initialFundProfile,
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'family_fund_users_v1',
  WALLETS: 'family_fund_wallets_v1',
  LOANS: 'family_fund_loans_v1',
  QUEUE: 'family_fund_queue_v1',
  RECEIPTS: 'family_fund_receipts_v1',
  EXPENSES: 'family_fund_expenses_v1',
  NOTIFS: 'family_fund_notifs_v1',
  JOURNAL: 'family_fund_journal_v2',
  PROFILE: 'family_fund_profile_v2',
};

// Safe LocalStorage helpers with in-memory fallback
const getStorageItem = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStorageItem = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
};

// Initial state loader
export const loadInitialFundState = () => {
  const users = getStorageItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
  const wallets = getStorageItem<FundWallets>(STORAGE_KEYS.WALLETS, initialWallets);
  const loans = getStorageItem<Loan[]>(STORAGE_KEYS.LOANS, initialLoans);
  const queue = getStorageItem<QueueItem[]>(STORAGE_KEYS.QUEUE, initialQueue);
  const receipts = getStorageItem<Receipt[]>(STORAGE_KEYS.RECEIPTS, initialReceipts);
  const expenses = getStorageItem<EntertainmentExpense[]>(STORAGE_KEYS.EXPENSES, initialEntertainmentExpenses);
  const notifications = getStorageItem<AppNotification[]>(STORAGE_KEYS.NOTIFS, initialNotifications);
  const journalEntries = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, initialJournalEntries);
  const fundProfile = getStorageItem<FundProfile>(STORAGE_KEYS.PROFILE, initialFundProfile);

  return { users, wallets, loans, queue, receipts, expenses, notifications, journalEntries, fundProfile };
};

export const persistFundState = (state: {
  users: User[];
  wallets: FundWallets;
  loans: Loan[];
  queue: QueueItem[];
  receipts: Receipt[];
  expenses: EntertainmentExpense[];
  notifications: AppNotification[];
  journalEntries?: JournalEntry[];
  fundProfile?: FundProfile;
}) => {
  setStorageItem(STORAGE_KEYS.USERS, state.users);
  setStorageItem(STORAGE_KEYS.WALLETS, state.wallets);
  setStorageItem(STORAGE_KEYS.LOANS, state.loans);
  setStorageItem(STORAGE_KEYS.QUEUE, state.queue);
  setStorageItem(STORAGE_KEYS.RECEIPTS, state.receipts);
  setStorageItem(STORAGE_KEYS.EXPENSES, state.expenses);
  setStorageItem(STORAGE_KEYS.NOTIFS, state.notifications);
  if (state.journalEntries) setStorageItem(STORAGE_KEYS.JOURNAL, state.journalEntries);
  if (state.fundProfile) setStorageItem(STORAGE_KEYS.PROFILE, state.fundProfile);
};

// Persian Numerals conversion helper (converts English and Arabic digits to clean Persian digits)
export const toPersianDigits = (input: string | number | null | undefined): string => {
  if (input === null || input === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input)
    .replace(/[0-9]/g, (w) => persianDigits[+w])
    .replace(/[\u0660-\u0669]/g, (w) => persianDigits[w.charCodeAt(0) - 1632]);
};

// Format currency in Persian Tomans with comma separator and Persian digits
export const formatToman = (amount: number): string => {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${toPersianDigits(formatted)} تومان`;
};

export const formatNumberOnly = (amount: number): string => {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return toPersianDigits(formatted);
};

// Calculate rotating loan figures (Principal, Fee to Entertainment, Monthly Installment)
export const calculateLoanFigures = (
  principal: number,
  profitRate: number = 2,
  installmentsCount: number = 10
) => {
  const totalFee = Math.round((principal * profitRate) / 100);
  const totalPayable = principal + totalFee;
  const monthlyInstallment = Math.round(totalPayable / installmentsCount);
  const monthlyProfitComponent = Math.round(totalFee / installmentsCount);

  return {
    totalFee,
    totalPayable,
    monthlyInstallment,
    monthlyProfitComponent,
  };
};

/**
 * Journal Voucher Helpers (توابع کمکی صدور سند حسابداری دوبل)
 */
export const getNextVoucherNumber = (entries: JournalEntry[]): number => {
  if (!entries || entries.length === 0) return 1010;
  const max = entries.reduce((m, e) => (e.voucherNumber && e.voucherNumber > m ? e.voucherNumber : m), 1000);
  return max + 1;
};

export const getPersianDateStr = (): string => {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date());
};

/**
 * Core Logic 1: Receipt Verification (تایید یا رد فیش بانکی)
 */
export const processReceiptVerification = (
  receiptId: string,
  action: 'approve' | 'reject',
  adminUser: User,
  reason: string,
  currentState: {
    users: User[];
    wallets: FundWallets;
    loans: Loan[];
    receipts: Receipt[];
    notifications: AppNotification[];
    journalEntries?: JournalEntry[];
  }
) => {
  const receipts = [...currentState.receipts];
  const users = [...currentState.users];
  const loans = [...currentState.loans];
  const wallets = { ...currentState.wallets };
  const notifications = [...currentState.notifications];
  const journalEntries = [...(currentState.journalEntries || [])];

  const receiptIndex = receipts.findIndex((r) => r.id === receiptId);
  if (receiptIndex === -1) {
    throw new Error('فیش مورد نظر یافت نشد');
  }

  const receipt = { ...receipts[receiptIndex] };
  const nowStr = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());
  const nowPersianDate = getPersianDateStr();

  if (action === 'reject') {
    receipt.status = 'rejected';
    receipt.verifiedDate = nowStr;
    receipt.verifiedBy = adminUser.name;
    receipt.rejectionReason = reason || 'عدم واریز وجه یا ناخوانا بودن رسید';
    receipts[receiptIndex] = receipt;

    // Dispatch rejection notification
    notifications.unshift({
      id: `notif-${Date.now()}`,
      targetUserId: receipt.memberId,
      title: 'فیش واریزی شما رد شد',
      message: `فیش ${formatToman(receipt.amount)} به علت «${receipt.rejectionReason}» رد شد. لطفاً بررسی نمایید.`,
      type: 'receipt_rejected',
      createdAt: 'همین الان',
      isRead: false,
    });

    return { receipts, users, loans, wallets, notifications, journalEntries };
  }

  // ACTION: APPROVE
  receipt.status = 'approved';
  receipt.verifiedDate = nowStr;
  receipt.verifiedBy = adminUser.name;
  receipts[receiptIndex] = receipt;

  const nextVoucherNum = getNextVoucherNumber(journalEntries);

  // 1. If Monthly Due (حق عضویت ماهانه)
  if (receipt.paymentType === 'monthly_due') {
    wallets.monthlyDuesBalance += receipt.amount;

    // Update user's cumulative contribution
    const uIndex = users.findIndex((u) => u.id === receipt.memberId);
    if (uIndex !== -1) {
      users[uIndex] = {
        ...users[uIndex],
        totalPaidDues: users[uIndex].totalPaidDues + receipt.amount,
      };
    }

    // Auto Journal Entry for Monthly Due
    journalEntries.unshift({
      id: `JV-${nextVoucherNum}`,
      voucherNumber: nextVoucherNum,
      date: nowPersianDate,
      description: `واریز حق عضویت ماهانه - ${receipt.memberName}`,
      debitAccount: `بانک و خزانه‌داری صندوق (${receipt.bankName || 'بانک ملی'})`,
      creditAccount: `سرمایه تودیعی حق عضویت (${receipt.memberName})`,
      amount: receipt.amount,
      trackingRef: receipt.trackingCode || `Ref-${Date.now().toString().slice(-6)}`,
      category: 'monthly_due',
      memberId: receipt.memberId,
      memberName: receipt.memberName,
      receiptId: receipt.id,
      registeredBy: adminUser.name,
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      targetUserId: receipt.memberId,
      title: 'فیش حق عضویت تایید شد',
      message: `مبلغ ${formatToman(receipt.amount)} با موفقیت به حساب حق عضویت صندوق منظور گردید.`,
      type: 'receipt_approved',
      createdAt: 'همین الان',
      isRead: false,
    });
  }

  // 2. If Rotating Loan Installment (قسط وام گردشی با سهم سود برای صندوق تفریحات)
  else if (receipt.paymentType === 'loan_installment') {
    // Find loan
    let targetLoanIndex = loans.findIndex((l) => l.id === receipt.loanId);
    if (targetLoanIndex === -1) {
      // Find active loan for this member
      targetLoanIndex = loans.findIndex((l) => l.memberId === receipt.memberId && l.status === 'active');
    }

    let profitPortion = receipt.profitComponentAmount || 0;

    if (targetLoanIndex !== -1) {
      const loan = { ...loans[targetLoanIndex] };
      loan.paidInstallments += 1;

      // Calculate profit portion if not already set on receipt
      if (!profitPortion && loan.profitOrFeeRate > 0) {
        const figures = calculateLoanFigures(loan.principalAmount, loan.profitOrFeeRate, loan.totalInstallments);
        profitPortion = figures.monthlyProfitComponent;
      }

      if (loan.paidInstallments >= loan.totalInstallments) {
        loan.status = 'completed';
      }
      loans[targetLoanIndex] = loan;
    }

    // Principal portion goes to monthly dues pool (to fund next rotating loans)
    const principalPortion = Math.max(0, receipt.amount - profitPortion);
    wallets.monthlyDuesBalance += principalPortion;

    // PROFIT PORTION goes straight to Entertainment Fund (صندوق تفریحات)!
    wallets.entertainmentFundBalance += profitPortion;

    // Auto Journal Entry for Rotating Loan Installment
    journalEntries.unshift({
      id: `JV-${nextVoucherNum}`,
      voucherNumber: nextVoucherNum,
      date: nowPersianDate,
      description: `وصول قسط وام گردشی ${receipt.memberName} / تسهیم کارمزد تفریحات`,
      debitAccount: `بانک و خزانه‌داری صندوق (${receipt.bankName || 'بانک ملت'})`,
      creditAccount: `مطالبات وام (${formatToman(principalPortion)}) / درآمد کارمزد تفریحات (${formatToman(profitPortion)})`,
      amount: receipt.amount,
      trackingRef: receipt.trackingCode || `Ref-${Date.now().toString().slice(-6)}`,
      category: 'loan_installment',
      memberId: receipt.memberId,
      memberName: receipt.memberName,
      loanId: receipt.loanId,
      receiptId: receipt.id,
      registeredBy: adminUser.name,
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      targetUserId: receipt.memberId,
      title: 'قسط وام با موفقیت ثبت شد',
      message: `قسط وام به مبلغ ${formatToman(receipt.amount)} تایید شد. مبلغ ${formatToman(profitPortion)} کارمزد به صندوق تفریحات خانوادگی افزوده شد.`,
      type: 'receipt_approved',
      createdAt: 'همین الان',
      isRead: false,
    });
  }

  // 3. If Emergency Loan Payback (بازپرداخت وام ضروری)
  else if (receipt.paymentType === 'emergency_loan_payback') {
    wallets.emergencyFundBalance += receipt.amount;

    const emergencyLoanIndex = loans.findIndex(
      (l) => l.memberId === receipt.memberId && l.type === 'emergency' && l.status === 'active'
    );
    if (emergencyLoanIndex !== -1) {
      const loan = { ...loans[emergencyLoanIndex] };
      loan.paidInstallments += 1;
      if (loan.paidInstallments >= loan.totalInstallments) {
        loan.status = 'completed';
      }
      loans[emergencyLoanIndex] = loan;
    }

    // Auto Journal Entry for Emergency Loan Payback
    journalEntries.unshift({
      id: `JV-${nextVoucherNum}`,
      voucherNumber: nextVoucherNum,
      date: nowPersianDate,
      description: `بازپرداخت قسط وام ضروری - ${receipt.memberName}`,
      debitAccount: `صندوق وام‌های ضروری (${receipt.bankName || 'بانک ملی'})`,
      creditAccount: `مطالبات وام ضروری (${receipt.memberName})`,
      amount: receipt.amount,
      trackingRef: receipt.trackingCode || `Ref-${Date.now().toString().slice(-6)}`,
      category: 'emergency_loan_payback',
      memberId: receipt.memberId,
      memberName: receipt.memberName,
      receiptId: receipt.id,
      registeredBy: adminUser.name,
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      targetUserId: receipt.memberId,
      title: 'بازپرداخت وام ضروری ثبت شد',
      message: `مبلغ ${formatToman(receipt.amount)} به کیف پول وام‌های ضروری بازگردانده شد.`,
      type: 'receipt_approved',
      createdAt: 'همین الان',
      isRead: false,
    });
  }

  return { receipts, users, loans, wallets, notifications, journalEntries };
};

/**
 * Core Logic 2: Granting a New Loan (اعطای وام گردشی یا ضروری)
 */
export const disburseLoan = (
  memberId: string,
  type: LoanType,
  principalAmount: number,
  profitRate: number,
  totalInstallments: number,
  dueDateDesc: string,
  purposeNote: string,
  currentState: {
    users: User[];
    wallets: FundWallets;
    loans: Loan[];
    queue: QueueItem[];
    notifications: AppNotification[];
    journalEntries?: JournalEntry[];
  }
) => {
  const users = [...currentState.users];
  const wallets = { ...currentState.wallets };
  const loans = [...currentState.loans];
  const queue = [...currentState.queue];
  const notifications = [...currentState.notifications];
  const journalEntries = [...(currentState.journalEntries || [])];

  const user = users.find((u) => u.id === memberId);
  if (!user) throw new Error('کاربر یافت نشد');

  // Verify wallet sufficiency
  if (type === 'rotating') {
    if (wallets.monthlyDuesBalance < principalAmount) {
      throw new Error(`موجودی صندوق حق عضویت‌ها (${formatToman(wallets.monthlyDuesBalance)}) برای پرداخت این وام کافی نیست.`);
    }
    wallets.monthlyDuesBalance -= principalAmount;
  } else {
    if (wallets.emergencyFundBalance < principalAmount) {
      throw new Error(`موجودی صندوق ضروری (${formatToman(wallets.emergencyFundBalance)}) برای این وام کافی نیست.`);
    }
    wallets.emergencyFundBalance -= principalAmount;
  }

  wallets.totalDisbursedLoans += principalAmount;

  const figures = calculateLoanFigures(principalAmount, profitRate, totalInstallments);
  const nowStr = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date());
  const nowPersianDate = getPersianDateStr();

  const newLoan: Loan = {
    id: `loan-${Date.now()}`,
    memberId: user.id,
    memberName: user.name,
    type,
    principalAmount,
    profitOrFeeRate: profitRate,
    totalPayableAmount: figures.totalPayable,
    monthlyInstallmentAmount: figures.monthlyInstallment,
    totalInstallments,
    paidInstallments: 0,
    grantedDate: nowStr,
    dueDate: dueDateDesc || (type === 'rotating' ? '۱۰ هر ماه' : 'تسویه در ۲ ماه'),
    status: 'active',
    purposeNote,
  };

  loans.unshift(newLoan);

  // Auto Journal Entry for Disbursing Loan
  const nextVoucherNum = getNextVoucherNumber(journalEntries);
  journalEntries.unshift({
    id: `JV-${nextVoucherNum}`,
    voucherNumber: nextVoucherNum,
    date: nowPersianDate,
    description: `پرداخت اصل وام ${type === 'rotating' ? 'گردشی' : 'ضروری'} به ${user.name} (${user.familyRelation})`,
    debitAccount: `مطالبات تسهیلات اعضا (${user.name})`,
    creditAccount: type === 'rotating' ? 'بانک و خزانه‌داری صندوق (حق عضویت)' : 'کیف پول صندوق ضروری',
    amount: principalAmount,
    trackingRef: `DISB-${Date.now().toString().slice(-5)}`,
    category: 'loan_disbursement',
    memberId: user.id,
    memberName: user.name,
    loanId: newLoan.id,
    registeredBy: 'حاج احمد (پدر)',
  });

  // If rotating loan, rotate queue position
  if (type === 'rotating') {
    const qIndex = queue.findIndex((q) => q.memberId === memberId);
    if (qIndex !== -1) {
      // Remove from current spot and place at bottom
      const [receivedItem] = queue.splice(qIndex, 1);
      receivedItem.status = 'waiting';
      receivedItem.notes = `وام دریافت شد در ${nowStr}`;
      queue.push(receivedItem);

      // Re-index orders
      queue.forEach((item, idx) => {
        item.order = idx + 1;
        if (idx === 0) item.status = 'in_progress';
      });
    }
  }

  // Dispatch alert to user
  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetUserId: memberId,
    title: `وام ${type === 'rotating' ? 'گردشی' : 'ضروری'} به حساب شما واریز شد`,
    message: `مبلغ ${formatToman(principalAmount)} با موفقیت اعطا شد. تعداد اقساط: ${totalInstallments} ماهه.`,
    type: 'loan_granted',
    createdAt: 'همین الان',
    isRead: false,
  });

  return { wallets, loans, queue, notifications, journalEntries };
};

/**
 * Core Logic 3: Entertainment Fund Disbursement (برداشت از صندوق تفریحات برای سفر یا دورهمی)
 */
export const disburseEntertainmentExpense = (
  title: string,
  amount: number,
  description: string,
  adminUser: User,
  currentState: {
    wallets: FundWallets;
    expenses: EntertainmentExpense[];
    notifications: AppNotification[];
    journalEntries?: JournalEntry[];
  }
) => {
  const wallets = { ...currentState.wallets };
  const expenses = [...currentState.expenses];
  const notifications = [...currentState.notifications];
  const journalEntries = [...(currentState.journalEntries || [])];

  if (wallets.entertainmentFundBalance < amount) {
    throw new Error(`موجودی صندوق تفریحات (${formatToman(wallets.entertainmentFundBalance)}) کمتر از مبلغ درخواستی است.`);
  }

  wallets.entertainmentFundBalance -= amount;
  wallets.totalAnnualDisbursedForTrips += amount;

  const nowMonthStr = new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).format(new Date());
  const nowPersianDate = getPersianDateStr();

  const newExpense: EntertainmentExpense = {
    id: `ent-${Date.now()}`,
    title,
    amount,
    date: nowMonthStr,
    description,
    registeredBy: adminUser.name,
  };

  expenses.unshift(newExpense);

  // Auto Journal Entry for Entertainment Expense
  const nextVoucherNum = getNextVoucherNumber(journalEntries);
  journalEntries.unshift({
    id: `JV-${nextVoucherNum}`,
    voucherNumber: nextVoucherNum,
    date: nowPersianDate,
    description: `برداشت هزینه تفریحات خانوادگی: ${title} (${description || 'سفر و دورهمی'})`,
    debitAccount: 'هزینه‌های تفریح و گردهمایی خانوادگی',
    creditAccount: 'موجودی اندوخته سود تفریحات',
    amount,
    trackingRef: `EXP-${Date.now().toString().slice(-5)}`,
    category: 'entertainment_expense',
    registeredBy: adminUser.name,
  });

  // Broadcast notification to whole family!
  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetUserId: 'all',
    title: 'برنامه تفریح و دورهمی خانوادگی تصویب شد 🎉',
    message: `مبلغ ${formatToman(amount)} از محل صندوق سود تفریحات برای «${title}» تخصیص یافت.`,
    type: 'info',
    createdAt: 'همین الان',
    isRead: false,
  });

  return { wallets, expenses, notifications, journalEntries };
};

/**
 * Core Logic 3.1: Delete Entertainment Expense (حذف هزینه تفریح و بازگشت مبلغ به صندوق)
 */
export const deleteEntertainmentExpense = (
  expenseId: string,
  currentState: {
    wallets: FundWallets;
    expenses: EntertainmentExpense[];
    notifications: AppNotification[];
  }
) => {
  const wallets = { ...currentState.wallets };
  const expenses = [...currentState.expenses];
  const notifications = [...currentState.notifications];

  const index = expenses.findIndex((e) => e.id === expenseId);
  if (index === -1) {
    throw new Error('مورد هزینه تفریح یافت نشد');
  }

  const [removed] = expenses.splice(index, 1);
  wallets.entertainmentFundBalance += removed.amount;
  wallets.totalAnnualDisbursedForTrips = Math.max(0, wallets.totalAnnualDisbursedForTrips - removed.amount);

  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetUserId: 'all',
    title: 'برنامه تفریح لغو و مبلغ مسترد شد',
    message: `مبلغ ${formatToman(removed.amount)} بابت «${removed.title}» به صندوق تفریحات بازگردانده شد.`,
    type: 'info',
    createdAt: 'همین الان',
    isRead: false,
  });

  return { wallets, expenses, notifications };
};

/**
 * Core Logic 3.2: Manual Installment Payment by Father (ثبت دستی اقساط توسط مدیر)
 */
export const recordManualInstallmentPayment = (
  loanId: string,
  installmentsCount: number,
  paymentMethod: 'cash' | 'card_to_card' | 'bank_transfer',
  notes: string,
  adminUser: User,
  customAmount: number | undefined,
  currentState: {
    loans: Loan[];
    wallets: FundWallets;
    users: User[];
    notifications: AppNotification[];
    journalEntries?: JournalEntry[];
  }
) => {
  const loans = [...currentState.loans];
  const wallets = { ...currentState.wallets };
  const users = [...currentState.users];
  const notifications = [...currentState.notifications];
  const journalEntries = [...(currentState.journalEntries || [])];

  const loanIndex = loans.findIndex((l) => l.id === loanId);
  if (loanIndex === -1) {
    throw new Error('وام مورد نظر یافت نشد');
  }

  const loan = { ...loans[loanIndex] };
  const member = users.find((u) => u.id === loan.memberId);
  const nowStr = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());
  const nowPersianDate = getPersianDateStr();

  const amountToPay = customAmount || loan.monthlyInstallmentAmount * installmentsCount;

  // Split fee for rotating loans
  let feeToEntertainment = 0;
  if (loan.type === 'rotating') {
    const singleFee = Math.round((loan.principalAmount * (loan.profitOrFeeRate / 100)) / loan.totalInstallments);
    feeToEntertainment = singleFee * installmentsCount;
    wallets.entertainmentFundBalance += feeToEntertainment;
    wallets.monthlyDuesBalance += Math.max(0, amountToPay - feeToEntertainment);
  } else {
    wallets.emergencyFundBalance += amountToPay;
  }

  loan.paidInstallments = Math.min(loan.totalInstallments, loan.paidInstallments + installmentsCount);
  if (loan.paidInstallments >= loan.totalInstallments) {
    loan.status = 'completed';
  }

  const manualLog = {
    id: `man-${Date.now()}`,
    date: nowStr,
    installmentsCount,
    amount: amountToPay,
    paymentMethod,
    notes: notes || 'ثبت پرداخت دستی توسط مدیر صندوق',
    registeredBy: adminUser.name,
  };

  loan.manualPaymentLogs = [manualLog, ...(loan.manualPaymentLogs || [])];
  loans[loanIndex] = loan;

  // Auto Journal Entry for Manual Installment
  const nextVoucherNum = getNextVoucherNumber(journalEntries);
  const methodLabel = paymentMethod === 'cash' ? 'صندوق نقد' : paymentMethod === 'card_to_card' ? 'کارت به کارت' : 'واریز بانکی';
  journalEntries.unshift({
    id: `JV-${nextVoucherNum}`,
    voucherNumber: nextVoucherNum,
    date: nowPersianDate,
    description: `ثبت پرداخت دستی ${installmentsCount} قسط وام ${loan.memberName} (${methodLabel})`,
    debitAccount: paymentMethod === 'cash' ? 'صندوق نقد و اسکناس' : 'بانک و خزانه‌داری صندوق',
    creditAccount:
      loan.type === 'rotating'
        ? `مطالبات تسهیلات (${formatToman(amountToPay - feeToEntertainment)}) / درآمد کارمزد تفریحات (${formatToman(feeToEntertainment)})`
        : `مطالبات وام ضروری (${loan.memberName})`,
    amount: amountToPay,
    trackingRef: `MAN-${Date.now().toString().slice(-5)}`,
    category: 'loan_installment',
    memberId: loan.memberId,
    memberName: loan.memberName,
    loanId: loan.id,
    registeredBy: adminUser.name,
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetUserId: loan.memberId,
    title: 'پرداخت دستی قسط ثبت شد',
    message: `${installmentsCount} قسط به مبلغ ${formatToman(amountToPay)} توسط مدیر صندوق ثبت و از مانده بدهی کسر گردید.`,
    type: 'receipt_approved',
    createdAt: 'همین الان',
    isRead: false,
  });

  return { loans, wallets, notifications, journalEntries };
};

/**
 * Core Logic 3.3: Add Member (افزودن عضو جدید توسط پدر)
 */
export const addMember = (
  newMember: {
    name: string;
    familyRelation: string;
    phoneNumber: string;
    monthlyDueAmount: number;
    initialDebt?: number;
    initialInstallmentsLeft?: number;
    notes?: string;
  },
  currentState: {
    users: User[];
    queue: QueueItem[];
    loans: Loan[];
    notifications: AppNotification[];
  }
) => {
  const users = [...currentState.users];
  const queue = [...currentState.queue];
  const loans = [...currentState.loans];
  const notifications = [...currentState.notifications];

  const newId = `user_${Date.now()}`;
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&h=200&q=80',
  ];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  const nowStr = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date());

  const createdUser: User = {
    id: newId,
    name: newMember.name,
    familyRelation: newMember.familyRelation,
    phoneNumber: newMember.phoneNumber,
    role: 'member',
    avatarUrl: randomAvatar,
    joinedDate: nowStr,
    monthlyDueAmount: newMember.monthlyDueAmount || 500000,
    totalPaidDues: 0,
    initialDebt: newMember.initialDebt || 0,
    notes: newMember.notes,
  };

  users.push(createdUser);

  // Add to loan queue at the end
  queue.push({
    id: `queue_${newId}`,
    memberId: newId,
    memberName: createdUser.name,
    order: queue.length + 1,
    estimatedDate: 'نوبت جدید',
    status: 'waiting',
    notes: 'عضو تازه افزوده شده',
  });

  // If initial debt/loan specified, create initial loan record
  if (newMember.initialDebt && newMember.initialDebt > 0) {
    const totalInst = newMember.initialInstallmentsLeft || 10;
    const monthlyInst = Math.round(newMember.initialDebt / totalInst);
    loans.push({
      id: `loan_init_${newId}`,
      memberId: newId,
      memberName: createdUser.name,
      type: 'rotating',
      principalAmount: newMember.initialDebt,
      profitOrFeeRate: 0,
      totalPayableAmount: newMember.initialDebt,
      monthlyInstallmentAmount: monthlyInst,
      totalInstallments: totalInst,
      paidInstallments: 0,
      grantedDate: nowStr,
      dueDate: 'دهم هر ماه',
      status: 'active',
      purposeNote: 'بدهی و مانده تسهیلات گذشته (ثبت دستی)',
    });
  }

  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetUserId: 'all',
    title: 'عضو جدید به صندوق خانواده پیوست',
    message: `${createdUser.name} (${createdUser.familyRelation}) به عنوان عضو رسمی ثبت شد.`,
    type: 'info',
    createdAt: 'همین الان',
    isRead: false,
  });

  return { users, queue, loans, notifications };
};

/**
 * Core Logic 3.4: Delete Member (حذف عضو توسط پدر)
 */
export const deleteMember = (
  memberId: string,
  currentState: {
    users: User[];
    queue: QueueItem[];
    loans: Loan[];
    notifications: AppNotification[];
  }
) => {
  let users = [...currentState.users];
  let queue = [...currentState.queue];
  const loans = [...currentState.loans];
  const notifications = [...currentState.notifications];

  const target = users.find((u) => u.id === memberId);
  if (!target) throw new Error('کاربر یافت نشد');
  if (target.role === 'admin' || target.id === 'user_father') {
    throw new Error('حذف مدیر اصلی (پدر) امکان‌پذیر نیست.');
  }

  users = users.filter((u) => u.id !== memberId);
  queue = queue.filter((q) => q.memberId !== memberId).map((q, idx) => ({
    ...q,
    order: idx + 1,
  }));

  // Complete/archive active loans
  loans.forEach((l) => {
    if (l.memberId === memberId && l.status === 'active') {
      l.status = 'completed';
      l.purposeNote = (l.purposeNote || '') + ' [تسویه یا مختومه به دلیل خروج عضو]';
    }
  });

  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetUserId: 'all',
    title: 'عضویت خاتمه یافت',
    message: `پرونده عضویت ${target.name} (${target.familyRelation}) از صندوق بسته شد.`,
    type: 'info',
    createdAt: 'همین الان',
    isRead: false,
  });

  return { users, queue, loans, notifications };
};

/**
 * Core Logic 3.5: Direct Loan Installment Adjustment (تنظیم دستی اقساط یا بدهی)
 */
export const adjustLoanInstallments = (
  loanId: string,
  totalInstallments: number,
  paidInstallments: number,
  purposeNote: string,
  currentState: {
    loans: Loan[];
  }
) => {
  const loans = [...currentState.loans];
  const index = loans.findIndex((l) => l.id === loanId);
  if (index === -1) throw new Error('وام یافت نشد');

  const loan = { ...loans[index] };
  loan.totalInstallments = totalInstallments;
  loan.paidInstallments = Math.min(totalInstallments, paidInstallments);
  if (loan.paidInstallments >= loan.totalInstallments) {
    loan.status = 'completed';
  } else {
    loan.status = 'active';
  }
  if (purposeNote) {
    loan.purposeNote = purposeNote;
  }
  loans[index] = loan;

  return { loans };
};

/**
 * Core Logic 4: Reordering Rotating Loan Queue (جابجایی نوبت وام‌ها)
 */
export const reorderQueue = (queue: QueueItem[], id: string, direction: 'up' | 'down'): QueueItem[] => {
  const index = queue.findIndex((q) => q.id === id);
  if (index === -1) return queue;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= queue.length) return queue;

  const newQueue = [...queue];
  const temp = newQueue[index];
  newQueue[index] = newQueue[targetIndex];
  newQueue[targetIndex] = temp;

  // Re-assign 1-based order
  return newQueue.map((item, idx) => ({
    ...item,
    order: idx + 1,
    status: idx === 0 ? 'in_progress' : 'waiting',
  }));
};

/**
 * Core Logic 5: Financial Export to CSV / Excel Backup
 */
export const exportFinancialRecordsToCSV = (
  users: User[],
  wallets: FundWallets,
  loans: Loan[],
  receipts: Receipt[],
  expenses: EntertainmentExpense[]
) => {
  let csv = '\uFEFF'; // UTF-8 BOM for Excel Persian encoding

  csv += '=== خلاصه وضعیت صندوق وام و پس‌انداز خانوادگی ===\r\n';
  csv += `تاریخ گزارش:,${new Date().toLocaleDateString('fa-IR')}\r\n`;
  csv += `موجودی حق عضویت‌ها (وام گردشی):,${wallets.monthlyDuesBalance} تومان\r\n`;
  csv += `موجودی صندوق وام ضروری:,${wallets.emergencyFundBalance} تومان\r\n`;
  csv += `موجودی صندوق تفریحات (سود و کارمزد):,${wallets.entertainmentFundBalance} تومان\r\n`;
  csv += `مجموع وام‌های اعطا شده:,${wallets.totalDisbursedLoans} تومان\r\n`;
  csv += `مجموع هزینه‌کرد تفریحات خانوادگی:,${wallets.totalAnnualDisbursedForTrips} تومان\r\n\r\n`;

  csv += '=== فهرست اعضای صندوق ===\r\n';
  csv += 'نام,نسبت خانوادگی,نقش,مبلغ حق ماهانه,کل پرداختی‌ها,شماره تماس\r\n';
  users.forEach((u) => {
    csv += `"${u.name}","${u.familyRelation}","${u.role === 'admin' ? 'مدیر' : 'عضو'}","${u.monthlyDueAmount}","${u.totalPaidDues}","${u.phoneNumber}"\r\n`;
  });
  csv += '\r\n';

  csv += '=== فهرست وام‌ها ===\r\n';
  csv += 'نام وام‌گیرنده,نوع وام,اصل وام,کارمزد(%),کل بازپرداخت,قسط ماهانه,اقساط پرداخت شده,کل اقساط,وضعیت\r\n';
  loans.forEach((l) => {
    csv += `"${l.memberName}","${l.type === 'rotating' ? 'گردشی' : 'ضروری'}","${l.principalAmount}","${l.profitOrFeeRate}%","${l.totalPayableAmount}","${l.monthlyInstallmentAmount}","${l.paidInstallments}","${l.totalInstallments}","${l.status === 'active' ? 'فعال' : 'تسویه شده'}"\r\n`;
  });
  csv += '\r\n';

  csv += '=== سوابق فیش‌های واریزی ===\r\n';
  csv += 'ردیف,نام عضو,نوع واریز,مبلغ (تومان),کد پیگیری,بانک,تاریخ ثبت,وضعیت,بررسی‌کننده,سهم صندوق تفریحات\r\n';
  receipts.forEach((r, idx) => {
    const typeTitle =
      r.paymentType === 'monthly_due'
        ? 'حق عضویت ماهانه'
        : r.paymentType === 'loan_installment'
        ? 'قسط وام گردشی'
        : 'بازپرداخت وام ضروری';
    const statusTitle = r.status === 'approved' ? 'تایید شده' : r.status === 'pending' ? 'در انتظار' : 'رد شده';
    csv += `"${idx + 1}","${r.memberName}","${typeTitle}","${r.amount}","${r.trackingCode}","${r.bankName}","${r.submittedDate}","${statusTitle}","${r.verifiedBy || '-'}","${r.profitComponentAmount || 0}"\r\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `گزارش_صندوق_خانوادگی_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Core Logic 6: Micro-Accounting & Ledger System Functions
 */

export interface AccountingMetrics {
  // Assets (دارایی‌ها)
  cashAndBankTreasury: number; // موجودی نقد و بانک‌ها
  receivablesLoansPrincipal: number; // مطالبات جاری اصل وام‌ها از اعضا
  totalAssets: number; // جمع کل دارایی‌ها

  // Liabilities & Equity (بدهی‌ها و سرمایه)
  membersCapitalDues: number; // مجموع سرمایه حق‌عضویت‌های تودیعی اعضا
  retainedEarningsFee: number; // اندوخته سود انباشته تفریحات
  totalLiabilitiesAndEquity: number; // جمع کل بدهی‌ها و حقوق صاحبان سرمایه

  // Equilibrium / Variance
  variance: number; // اختلاف تراز (دارایی - بدهی/سرمایه)
  isBalanced: boolean; // آیا دفاتر تراز هستند؟

  // Profit & Loss (صورت سود و زیان)
  totalFeeIncomeRecognized: number; // کل درآمدهای کارمزد شناسایی شده
  totalEntertainmentExpenses: number; // کل هزینه‌های تفریحات
  netSurplus: number; // مازاد یا سود خالص دوره
}

export const calculateAccountingMetrics = (
  wallets: FundWallets,
  loans: Loan[],
  users: User[],
  expenses: EntertainmentExpense[],
  journalEntries: JournalEntry[] = []
): AccountingMetrics => {
  // Cash and bank treasury (نقد و بانک)
  const cashAndBankTreasury =
    (wallets.monthlyDuesBalance || 0) +
    (wallets.emergencyFundBalance || 0) +
    (wallets.entertainmentFundBalance || 0);

  // Outstanding loan principal (مطالبات اصل وام‌ها از اعضا)
  let receivablesLoansPrincipal = 0;
  loans.forEach((loan) => {
    if (loan.status === 'active') {
      const installmentsLeft = Math.max(0, loan.totalInstallments - loan.paidInstallments);
      const remainingRatio = installmentsLeft / (loan.totalInstallments || 1);
      receivablesLoansPrincipal += Math.round(loan.principalAmount * remainingRatio);
    }
  });

  const totalAssets = cashAndBankTreasury + receivablesLoansPrincipal;

  // Members capital (حق عضویت‌های تودیعی اعضا)
  const membersCapitalDues = users.reduce((sum, u) => sum + (u.totalPaidDues || 0), 0);

  // Profit and Loss
  const totalEntertainmentExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalFeeIncomeRecognized = (wallets.entertainmentFundBalance || 0) + totalEntertainmentExpenses;
  const netSurplus = totalFeeIncomeRecognized - totalEntertainmentExpenses;

  // Retained earnings
  const retainedEarningsFee = wallets.entertainmentFundBalance || 0;

  // Liabilities & Equity
  const totalLiabilitiesAndEquity = membersCapitalDues + retainedEarningsFee;

  const variance = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const isBalanced = variance < 50000; // tolerance within rounding

  return {
    cashAndBankTreasury,
    receivablesLoansPrincipal,
    totalAssets,
    membersCapitalDues,
    retainedEarningsFee,
    totalLiabilitiesAndEquity,
    variance,
    isBalanced,
    totalFeeIncomeRecognized,
    totalEntertainmentExpenses,
    netSurplus,
  };
};

export const addManualJournalEntry = (
  entry: {
    description: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    trackingRef?: string;
    category?: any;
    memberId?: string;
    memberName?: string;
    date?: string;
  },
  adminUser: User,
  currentState: {
    journalEntries: JournalEntry[];
    notifications: AppNotification[];
  }
) => {
  const journalEntries = [...currentState.journalEntries];
  const notifications = [...currentState.notifications];
  const nextVoucherNum = getNextVoucherNumber(journalEntries);
  const nowPersianDate = entry.date || getPersianDateStr();

  const newEntry: JournalEntry = {
    id: `JV-${nextVoucherNum}`,
    voucherNumber: nextVoucherNum,
    date: nowPersianDate,
    description: entry.description,
    debitAccount: entry.debitAccount,
    creditAccount: entry.creditAccount,
    amount: entry.amount,
    trackingRef: entry.trackingRef || `MAN-${Date.now().toString().slice(-5)}`,
    category: entry.category || 'manual',
    memberId: entry.memberId,
    memberName: entry.memberName,
    registeredBy: adminUser.name,
  };

  journalEntries.unshift(newEntry);

  notifications.unshift({
    id: `notif-${Date.now()}`,
    targetUserId: 'user-admin',
    title: `سند حسابداری شماره ${nextVoucherNum} ثبت شد`,
    message: `سند دستی به مبلغ ${formatToman(entry.amount)} با شرح «${entry.description}» در دفتر روزنامه ثبت گردید.`,
    type: 'info',
    createdAt: 'همین الان',
    isRead: false,
  });

  return { journalEntries, notifications, newEntry };
};

export const deleteJournalEntry = (
  entryId: string,
  currentState: { journalEntries: JournalEntry[] }
) => {
  const journalEntries = currentState.journalEntries.filter((e) => e.id !== entryId);
  return { journalEntries };
};

export const updateFundProfile = (
  updated: Partial<FundProfile>,
  currentProfile: FundProfile
): FundProfile => {
  return {
    ...currentProfile,
    ...updated,
  };
};

export const exportFullBackupJSON = (state: {
  fundProfile: FundProfile;
  users: User[];
  wallets: FundWallets;
  loans: Loan[];
  queue: QueueItem[];
  receipts: Receipt[];
  expenses: EntertainmentExpense[];
  journalEntries: JournalEntry[];
  notifications: AppNotification[];
}) => {
  const backupObject = {
    app: 'family-loan-fund-micro-accounting',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    exportedDateFa: getPersianDateStr(),
    data: {
      fundProfile: state.fundProfile,
      users: state.users,
      wallets: state.wallets,
      loans: state.loans,
      queue: state.queue,
      receipts: state.receipts,
      expenses: state.expenses,
      journalEntries: state.journalEntries,
      notifications: state.notifications,
    },
  };

  const jsonStr = JSON.stringify(backupObject, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeDate = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `family-fund-ledger-backup-${safeDate}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return jsonStr;
};

export const restoreFullBackupJSON = (jsonString: string) => {
  const parsed = JSON.parse(jsonString);
  const data = parsed.data || parsed;

  if (!data.users || !Array.isArray(data.users)) {
    throw new Error('فایل پشتیبان معتبر نیست: ساختار اعضا یافت نشد.');
  }
  if (!data.wallets) {
    throw new Error('فایل پشتیبان معتبر نیست: اطلاعات کیف پول‌ها یافت نشد.');
  }

  // Persist directly to localStorage
  setStorageItem(STORAGE_KEYS.USERS, data.users);
  setStorageItem(STORAGE_KEYS.WALLETS, data.wallets);
  if (data.loans) setStorageItem(STORAGE_KEYS.LOANS, data.loans);
  if (data.queue) setStorageItem(STORAGE_KEYS.QUEUE, data.queue);
  if (data.receipts) setStorageItem(STORAGE_KEYS.RECEIPTS, data.receipts);
  if (data.expenses) setStorageItem(STORAGE_KEYS.EXPENSES, data.expenses);
  if (data.notifications) setStorageItem(STORAGE_KEYS.NOTIFS, data.notifications);
  if (data.journalEntries) setStorageItem(STORAGE_KEYS.JOURNAL, data.journalEntries);
  if (data.fundProfile) setStorageItem(STORAGE_KEYS.PROFILE, data.fundProfile);

  return {
    users: data.users as User[],
    wallets: data.wallets as FundWallets,
    loans: (data.loans || []) as Loan[],
    queue: (data.queue || []) as QueueItem[],
    receipts: (data.receipts || []) as Receipt[],
    expenses: (data.expenses || []) as EntertainmentExpense[],
    notifications: (data.notifications || []) as AppNotification[],
    journalEntries: (data.journalEntries || []) as JournalEntry[],
    fundProfile: (data.fundProfile || initialFundProfile) as FundProfile,
  };
};
