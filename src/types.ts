/**
 * Types and Data Contracts for Family Loan & Savings Fund
 * صندوق وام و پس‌انداز خانوادگی
 */

export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  familyRelation: string; // e.g. "پدر (مدیر اصلی)", "مادر", "پسر بزرگ", "دختر"
  phoneNumber: string;
  role: UserRole;
  avatarUrl: string;
  joinedDate: string;
  monthlyDueAmount: number; // e.g. 500,000 Tomans
  totalPaidDues: number;
  isDelegatedAdmin?: boolean; // Delegation permission
  initialDebt?: number; // بدهی قبلی یا مانده سنتی
  initialInstallmentsLeft?: number; // تعداد اقساط قبلی باقیمانده
  notes?: string;
}

export type LoanType = 'rotating' | 'emergency';
export type LoanStatus = 'active' | 'completed' | 'pending';

export interface ManualPaymentLog {
  id: string;
  date: string;
  installmentsCount: number;
  amount: number;
  paymentMethod: 'cash' | 'card_to_card' | 'bank_transfer';
  notes?: string;
  registeredBy: string;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  type: LoanType;
  principalAmount: number; // اصل مبلغ وام (تومان)
  profitOrFeeRate: number; // درصد کارمزد/سود وام گردشی (مثلاً 2% یا 3%)
  totalPayableAmount: number; // کل مبلغ قابل بازپرداخت (اصل + کارمزد)
  monthlyInstallmentAmount: number; // مبلغ هر قسط
  totalInstallments: number; // تعداد کل اقساط (مثلاً ۱۰ ماه)
  paidInstallments: number; // اقساط پرداخت شده
  grantedDate: string;
  dueDate: string;
  status: LoanStatus;
  purposeNote?: string;
  manualPaymentLogs?: ManualPaymentLog[];
}

export interface QueueItem {
  id: string;
  memberId: string;
  memberName: string;
  order: number; // 1, 2, 3...
  estimatedDate: string; // تاریخ تقریبی نوبت
  status: 'waiting' | 'in_progress' | 'received' | 'deferred';
  notes?: string;
}

export type PaymentType = 'monthly_due' | 'loan_installment' | 'emergency_loan_payback';
export type ReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface Receipt {
  id: string;
  memberId: string;
  memberName: string;
  paymentType: PaymentType;
  amount: number; // تومان
  receiptImageUrl: string; // Base64 data URL or external URL
  trackingCode: string; // شماره پیگیری / ارجاع بانکی
  bankName: string; // نام بانک مبدا یا مقصد
  submittedDate: string;
  status: ReceiptStatus;
  verifiedDate?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  loanId?: string;
  installmentNumber?: number;
  profitComponentAmount?: number; // سهم کارمزدی که به صندوق تفریحات واریز می‌شود
}

export interface FundWallets {
  monthlyDuesBalance: number; // موجودی حق عضویت‌ها (تامین‌کننده وام‌های گردشی)
  emergencyFundBalance: number; // موجودی کیف پول وام ضروری
  entertainmentFundBalance: number; // صندوق تفریحات (سود و کارمزد تجمیع شده)
  totalDisbursedLoans: number; // کل مبالغ وام‌های اعطا شده در طول زمان
  totalAnnualDisbursedForTrips: number; // کل مبالغ مصرف شده برای تفریحات خانوادگی
}

export interface EntertainmentExpense {
  id: string;
  title: string; // عنوان تفریح (مثلاً "سفر شمال تابستانه", "شام خانوادگی سال نو")
  amount: number;
  date: string;
  description: string;
  registeredBy: string;
}

export interface AppNotification {
  id: string;
  targetUserId: string | 'all';
  title: string;
  message: string;
  type: 'receipt_approved' | 'receipt_rejected' | 'turn_near' | 'loan_granted' | 'info';
  createdAt: string;
  isRead: boolean;
  linkAction?: string;
}

export interface DatabaseSchemaDefinition {
  collectionName: string;
  description: string;
  fields: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
}

export type JournalCategory =
  | 'monthly_due'
  | 'loan_installment'
  | 'loan_disbursement'
  | 'emergency_loan_payback'
  | 'entertainment_expense'
  | 'capital_injection'
  | 'manual';

export interface JournalEntry {
  id: string; // e.g. "JV-1024"
  voucherNumber: number; // e.g. 1024
  date: string; // Persian date, e.g. "۱۴۰۳/۱۲/۲۸"
  description: string; // شرح سند
  debitAccount: string; // حساب بدهکار (مثلاً: بانک ملی / صندوق نقد)
  creditAccount: string; // حساب بستانکار (مثلاً: درآمد کارمزد / سرمایه تودیعی اعضا)
  amount: number; // مبلغ به تومان
  trackingRef: string; // شماره پیگیری بانکی یا ارجاع
  category: JournalCategory;
  memberId?: string;
  memberName?: string;
  loanId?: string;
  receiptId?: string;
  registeredBy: string;
}

export interface FundProfile {
  name: string; // نام صندوق
  accountHolder: string; // نام صاحب حساب / مدیر
  bankName: string; // نام بانک
  cardNumber: string; // شماره کارت
  iban: string; // شماره شبا
  emergencyLoanCap: number; // سقف وام ضروری (تومان)
  rotatingLoanCap: number; // سقف وام گردشی (تومان)
  entertainmentFeeRate: number; // درصد کارمزد صندوق تفریحات
  monthlyDueAmount: number; // مبلغ پیش‌فرض حق‌عضویت ماهانه
  establishedDate?: string; // تاریخ تاسیس
  description?: string; // یادداشت یا اساسنامه صندوق
}
