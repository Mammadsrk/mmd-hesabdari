import {
  User,
  Loan,
  QueueItem,
  Receipt,
  FundWallets,
  EntertainmentExpense,
  AppNotification,
  JournalEntry,
  FundProfile,
} from '../types';

// Sample visual receipt generator for preview
export const generateSampleReceiptImage = (bank: string, amountStr: string, date: string, track: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520">
    <defs>
      <linearGradient id="receiptBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
    </defs>
    <rect width="400" height="520" rx="16" fill="url(#receiptBg)" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="0" y="0" width="400" height="70" rx="16" fill="#0d9488"/>
    <text x="200" y="44" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">رسید انتقال وجه بانکی</text>
    
    <circle cx="200" cy="115" r="30" fill="#ecfdf5" stroke="#10b981" stroke-width="3"/>
    <path d="M188 115 L196 123 L214 105" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
    
    <text x="200" y="170" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle" font-family="sans-serif">انتقال موفق</text>
    <text x="200" y="200" font-size="22" font-weight="900" fill="#0d9488" text-anchor="middle" font-family="sans-serif">${amountStr} تومان</text>
    
    <line x1="40" y1="225" x2="360" y2="225" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="6,6"/>
    
    <g transform="translate(40, 250)" font-family="sans-serif" font-size="14" fill="#64748b">
      <text x="320" y="20" text-anchor="end">بانک مبدأ:</text>
      <text x="0" y="20" font-weight="bold" fill="#1e293b">${bank}</text>
      
      <text x="320" y="60" text-anchor="end">به حساب:</text>
      <text x="0" y="60" font-weight="bold" fill="#1e293b">صندوق خانوادگی (پدر)</text>
      
      <text x="320" y="100" text-anchor="end">شماره پیگیری:</text>
      <text x="0" y="100" font-weight="bold" fill="#0369a1">${track}</text>
      
      <text x="320" y="140" text-anchor="end">تاریخ و ساعت:</text>
      <text x="0" y="140" font-weight="bold" fill="#1e293b">${date}</text>
      
      <text x="320" y="180" text-anchor="end">وضعیت:</text>
      <text x="0" y="180" font-weight="bold" fill="#10b981">تایید شده در شاپرک</text>
    </g>
    
    <rect x="30" y="470" width="340" height="32" rx="8" fill="#f1f5f9"/>
    <text x="200" y="491" font-size="11" fill="#94a3b8" text-anchor="middle" font-family="sans-serif">تصویر الکترونیکی بارگذاری شده در سامانه صندوق</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const initialUsers: User[] = [
  {
    id: 'user-admin',
    name: 'حاج احمد (پدر)',
    familyRelation: 'پدر خانواده و مدیر ارشد صندوق',
    phoneNumber: '۰۹۱۲۱۱۱۱۱۱۱',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '۱۴۰۱/۰۱/۰۱',
    monthlyDueAmount: 1000000,
    totalPaidDues: 36000000,
    isDelegatedAdmin: false,
  },
  {
    id: 'user-1',
    name: 'زهرا خانم (مادر)',
    familyRelation: 'مادر خانواده',
    phoneNumber: '۰۹۱۲۲۲۲۲۲۲۲',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    joinedDate: '۱۴۰۱/۰۱/۰۱',
    monthlyDueAmount: 1000000,
    totalPaidDues: 36000000,
  },
  {
    id: 'user-2',
    name: 'علی',
    familyRelation: 'پسر بزرگ خانواده',
    phoneNumber: '۰۹۱۲۳۳۳۳۳۳۳',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedDate: '۱۴۰۱/۰۱/۰۱',
    monthlyDueAmount: 1000000,
    totalPaidDues: 36000000,
    isDelegatedAdmin: true, // Has delegation from father
  },
  {
    id: 'user-3',
    name: 'سارا',
    familyRelation: 'دختر خانواده',
    phoneNumber: '۰۹۱۲۴۴۴۴۴۴۴',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedDate: '۱۴۰۱/۰۶/۱۵',
    monthlyDueAmount: 1000000,
    totalPaidDues: 30000000,
  },
  {
    id: 'user-4',
    name: 'رضا',
    familyRelation: 'پسر کوچک خانواده',
    phoneNumber: '۰۹۱۲۵۵۵۵۵۵۵',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    joinedDate: '۱۴۰۲/۰۱/۰۱',
    monthlyDueAmount: 1000000,
    totalPaidDues: 24000000,
  },
  {
    id: 'user-5',
    name: 'مریم',
    familyRelation: 'عروس خانواده',
    phoneNumber: '۰۹۱۲۶۶۶۶۶۶۶',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: '۱۴۰۲/۰۶/۰۱',
    monthlyDueAmount: 1000000,
    totalPaidDues: 18000000,
  },
];

export const initialWallets: FundWallets = {
  monthlyDuesBalance: 38500000, // ۳۸.۵ میلیون تومان موجودی جاری صندوق اعضا
  emergencyFundBalance: 12000000, // ۱۲ میلیون تومان کیف پول وام ضروری
  entertainmentFundBalance: 4200000, // ۴.۲ میلیون تومان سود حاصل از کارمزد وام‌ها برای تفریح خانوادگی
  totalDisbursedLoans: 145000000, // تا کنون ۱۴۵ میلیون تومان وام پرداخت شده
  totalAnnualDisbursedForTrips: 8500000, // تا کنون ۸.۵ میلیون تومان خرج سفرها شده
};

export const initialLoans: Loan[] = [
  {
    id: 'loan-1',
    memberId: 'user-2',
    memberName: 'علی',
    type: 'rotating',
    principalAmount: 20000000, // ۲۰ میلیون تومان
    profitOrFeeRate: 2, // ۲ درصد کارمزد صندوق تفریحات (۴۰۰ هزار تومان)
    totalPayableAmount: 20400000,
    monthlyInstallmentAmount: 2040000, // ۱۰ قسط
    totalInstallments: 10,
    paidInstallments: 4,
    grantedDate: '۱۴۰۳/۰۸/۱۰',
    dueDate: '۱۰ هر ماه',
    status: 'active',
    purposeNote: 'خرید لوازم خانگی',
  },
  {
    id: 'loan-2',
    memberId: 'user-4',
    memberName: 'رضا',
    type: 'emergency',
    principalAmount: 5000000, // ۵ میلیون تومان وام فوری ضروری
    profitOrFeeRate: 0, // بدون کارمزد
    totalPayableAmount: 5000000,
    monthlyInstallmentAmount: 2500000,
    totalInstallments: 2,
    paidInstallments: 1,
    grantedDate: '۱۴۰۳/۱۱/۲۰',
    dueDate: 'بازپرداخت سریع ۲ ماهه',
    status: 'active',
    purposeNote: 'هزینه ترخیص و تعمیر فوری خودرو',
  },
];

export const initialQueue: QueueItem[] = [
  {
    id: 'queue-1',
    memberId: 'user-3',
    memberName: 'سارا',
    order: 1,
    estimatedDate: 'فروردین ۱۴۰۴ (همین ماه)',
    status: 'in_progress',
    notes: 'در شرف دریافت وام پس از تکمیل موجودی این ماه',
  },
  {
    id: 'queue-2',
    memberId: 'user-5',
    memberName: 'مریم',
    order: 2,
    estimatedDate: 'اردیبهشت ۱۴۰۴',
    status: 'waiting',
  },
  {
    id: 'queue-3',
    memberId: 'user-1',
    memberName: 'زهرا خانم (مادر)',
    order: 3,
    estimatedDate: 'خرداد ۱۴۰۴',
    status: 'waiting',
  },
  {
    id: 'queue-4',
    memberId: 'user-4',
    memberName: 'رضا',
    order: 4,
    estimatedDate: 'تیر ۱۴۰۴',
    status: 'waiting',
  },
  {
    id: 'queue-5',
    memberId: 'user-2',
    memberName: 'علی',
    order: 5,
    estimatedDate: 'مرداد ۱۴۰۴',
    status: 'waiting',
    notes: 'نوبت دوم پس از اتمام اقساط جاری',
  },
];

export const initialReceipts: Receipt[] = [
  {
    id: 'rec-1',
    memberId: 'user-3',
    memberName: 'سارا',
    paymentType: 'monthly_due',
    amount: 1000000,
    receiptImageUrl: generateSampleReceiptImage('بانک ملی', '۱,۰۰۰,۰۰۰', '۱۴۰۳/۱۲/۲۸ - ۱۰:۱۵', 'Ref-9823410'),
    trackingCode: '9823410',
    bankName: 'بانک ملی',
    submittedDate: '۱۴۰۳/۱۲/۲۸ - ۱۰:۱۵',
    status: 'pending',
  },
  {
    id: 'rec-2',
    memberId: 'user-2',
    memberName: 'علی',
    paymentType: 'loan_installment',
    amount: 2040000,
    receiptImageUrl: generateSampleReceiptImage('بانک ملت', '۲,۰۴۰,۰۰۰', '۱۴۰۳/۱۲/۲۷ - ۱۸:۳۰', 'Ref-7741295'),
    trackingCode: '7741295',
    bankName: 'بانک ملت',
    submittedDate: '۱۴۰۳/۱۲/۲۷ - ۱۸:۳۰',
    status: 'pending',
    loanId: 'loan-1',
    installmentNumber: 5,
    profitComponentAmount: 40000, // ۴۰ هزار تومان سهم سود این قسط برای صندوق تفریحات
  },
  {
    id: 'rec-3',
    memberId: 'user-4',
    memberName: 'رضا',
    paymentType: 'monthly_due',
    amount: 1000000,
    receiptImageUrl: generateSampleReceiptImage('بانک سامان', '۱,۰۰۰,۰۰۰', '۱۴۰۳/۱۲/۲۵ - ۱۱:۰۲', 'Ref-5412093'),
    trackingCode: '5412093',
    bankName: 'بانک سامان',
    submittedDate: '۱۴۰۳/۱۲/۲۵ - ۱۱:۰۲',
    status: 'approved',
    verifiedDate: '۱۴۰۳/۱۲/۲۵ - ۱۱:۴۵',
    verifiedBy: 'حاج احمد (پدر)',
  },
  {
    id: 'rec-4',
    memberId: 'user-2',
    memberName: 'علی',
    paymentType: 'loan_installment',
    amount: 2040000,
    receiptImageUrl: generateSampleReceiptImage('بانک ملت', '۲,۰۴۰,۰۰۰', '۱۴۰۳/۱۱/۱۰ - ۰۹:۱۲', 'Ref-6321901'),
    trackingCode: '6321901',
    bankName: 'بانک ملت',
    submittedDate: '۱۴۰۳/۱۱/۱۰ - ۰۹:۱۲',
    status: 'approved',
    verifiedDate: '۱۴۰۳/۱۱/۱۰ - ۱۰:۰۰',
    verifiedBy: 'حاج احمد (پدر)',
    loanId: 'loan-1',
    installmentNumber: 4,
    profitComponentAmount: 40000,
  },
];

export const initialEntertainmentExpenses: EntertainmentExpense[] = [
  {
    id: 'ent-1',
    title: 'سفر تفریحی خانواده به ویلای رامسر',
    amount: 5500000,
    date: 'شهریور ۱۴۰۳',
    description: 'تأمین بنزین، پذیرایی و مواد غذایی سفر ۳ روزه دسته‌جمعی خانوادگی از محل سود کارمزد وام‌ها',
    registeredBy: 'حاج احمد (مدیر)',
  },
  {
    id: 'ent-2',
    title: 'شام دورهمی شب یلدا در رستوران سنتی',
    amount: 3000000,
    date: 'آذر ۱۴۰۳',
    description: 'جشن یلدای خانواده از سود کارمزدهای صندوق',
    registeredBy: 'حاج احمد (مدیر)',
  },
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    targetUserId: 'user-3',
    title: 'نوبت وام شما نزدیک است!',
    message: 'سارا عزیز، نوبت وام گردشی شما در اولویت ۱ قرار دارد. لطفاً جهت دریافت با مدیر هماهنگ شوید.',
    type: 'turn_near',
    createdAt: '۲ روز پیش',
    isRead: false,
  },
  {
    id: 'notif-2',
    targetUserId: 'user-admin',
    title: '۲ فیش واریزی در انتظار تایید',
    message: 'سارا و علی فیش‌های جدید خود را بارگذاری کرده‌اند. لطفاً کارتابل واریزی‌ها را بررسی نمایید.',
    type: 'info',
    createdAt: 'امروز',
    isRead: false,
  },
  {
    id: 'notif-3',
    targetUserId: 'user-4',
    title: 'تایید فیش حق عضویت ماه اسفند',
    message: 'فیش واریزی حق عضویت ماهانه شما به مبلغ ۱,۰۰۰,۰۰۰ تومان تایید گردید.',
    type: 'receipt_approved',
    createdAt: '۳ روز پیش',
    isRead: true,
  },
];

export const initialFundProfile: FundProfile = {
  name: 'صندوق وام و پس‌انداز خانوادگی مهر',
  accountHolder: 'حاج احمد (پدر - مدیر ارشد صندوق)',
  bankName: 'بانک ملی ایران - شعبه مرکزی',
  cardNumber: '۶۰۳۷-۹۹۷۱-۲۳۴۵-۸۸۹۰',
  iban: 'IR82-0120-0000-0000-1234-5678',
  emergencyLoanCap: 10000000,
  rotatingLoanCap: 20000000,
  entertainmentFeeRate: 2,
  monthlyDueAmount: 1000000,
  establishedDate: '۱۴۰۱/۰۱/۰۱',
  description: 'صندوق قرض‌الحسنه و پس‌انداز خانوادگی جهت اعطای وام‌های گردشی بی‌بهره و تأمین هزینه‌های تفریحات و سفرهای دورهمی خانواده',
};

export const initialJournalEntries: JournalEntry[] = [
  {
    id: 'JV-1001',
    voucherNumber: 1001,
    date: '۱۴۰۳/۰۸/۱۰',
    description: 'پرداخت وام گردشی به علی (پسر بزرگ) - دوره اول',
    debitAccount: 'مطالبات تسهیلات اعضا (علی)',
    creditAccount: 'بانک ملی - خزانه‌داری صندوق',
    amount: 20000000,
    trackingRef: 'DISB-88120',
    category: 'loan_disbursement',
    memberId: 'user-2',
    memberName: 'علی',
    loanId: 'loan-1',
    registeredBy: 'حاج احمد (پدر)',
  },
  {
    id: 'JV-1002',
    voucherNumber: 1002,
    date: '۱۴۰۳/۰۹/۱۰',
    description: 'وصول قسط ۱ از ۱۰ وام علی / تسهیم کارمزد تفریحات',
    debitAccount: 'بانک ملت صندوق',
    creditAccount: 'مطالبات تسهیلات اعضا (۲،۰۰۰،۰۰۰ ت) / درآمد کارمزد تفریحات (۴۰،۰۰۰ ت)',
    amount: 2040000,
    trackingRef: 'Ref-1192801',
    category: 'loan_installment',
    memberId: 'user-2',
    memberName: 'علی',
    loanId: 'loan-1',
    registeredBy: 'حاج احمد (پدر)',
  },
  {
    id: 'JV-1003',
    voucherNumber: 1003,
    date: '۱۴۰۳/۱۰/۱۰',
    description: 'وصول قسط ۲ از ۱۰ وام علی / تسهیم کارمزد تفریحات',
    debitAccount: 'بانک ملت صندوق',
    creditAccount: 'مطالبات تسهیلات اعضا (۲،۰۰۰،۰۰۰ ت) / درآمد کارمزد تفریحات (۴۰،۰۰۰ ت)',
    amount: 2040000,
    trackingRef: 'Ref-2239102',
    category: 'loan_installment',
    memberId: 'user-2',
    memberName: 'علی',
    loanId: 'loan-1',
    registeredBy: 'حاج احمد (پدر)',
  },
  {
    id: 'JV-1004',
    voucherNumber: 1004,
    date: '۱۴۰۳/۱۱/۱۰',
    description: 'وصول قسط ۳ از ۱۰ وام علی / تسهیم کارمزد تفریحات',
    debitAccount: 'بانک ملت صندوق',
    creditAccount: 'مطالبات تسهیلات اعضا (۲،۰۰۰،۰۰۰ ت) / درآمد کارمزد تفریحات (۴۰،۰۰۰ ت)',
    amount: 2040000,
    trackingRef: 'Ref-6321901',
    category: 'loan_installment',
    memberId: 'user-2',
    memberName: 'علی',
    loanId: 'loan-1',
    receiptId: 'rec-4',
    registeredBy: 'حاج احمد (پدر)',
  },
  {
    id: 'JV-1005',
    voucherNumber: 1005,
    date: '۱۴۰۳/۱۱/۲۰',
    description: 'پرداخت وام ضروری بدون بهره به رضا (هزینه ترخیص خودرو)',
    debitAccount: 'مطالبات وام ضروری (رضا)',
    creditAccount: 'کیف پول وام ضروری صندوق',
    amount: 5000000,
    trackingRef: 'EMG-77310',
    category: 'loan_disbursement',
    memberId: 'user-4',
    memberName: 'رضا',
    loanId: 'loan-2',
    registeredBy: 'حاج احمد (پدر)',
  },
  {
    id: 'JV-1006',
    voucherNumber: 1006,
    date: '۱۴۰۳/۱۲/۲۰',
    description: 'وصول قسط ۱ از ۲ وام ضروری رضا',
    debitAccount: 'کیف پول وام ضروری صندوق',
    creditAccount: 'مطالبات وام ضروری (رضا)',
    amount: 2500000,
    trackingRef: 'Ref-4491022',
    category: 'emergency_loan_payback',
    memberId: 'user-4',
    memberName: 'رضا',
    loanId: 'loan-2',
    registeredBy: 'حاج احمد (پدر)',
  },
  {
    id: 'JV-1007',
    voucherNumber: 1007,
    date: '۱۴۰۳/۱۲/۲۵',
    description: 'واریز حق عضویت ماهانه اسفند ۱۴۰۳ - رضا',
    debitAccount: 'بانک سامان صندوق',
    creditAccount: 'سرمایه تودیعی حق عضویت (رضا)',
    amount: 1000000,
    trackingRef: 'Ref-5412093',
    category: 'monthly_due',
    memberId: 'user-4',
    memberName: 'رضا',
    receiptId: 'rec-3',
    registeredBy: 'حاج احمد (پدر)',
  },
  {
    id: 'JV-1008',
    voucherNumber: 1008,
    date: '۱۴۰۳/۰۶/۱۵',
    description: 'برداشت هزینه سفر تفریحی خانواده به ویلای رامسر',
    debitAccount: 'هزینه‌های تفریحی و گردهمایی خانوادگی',
    creditAccount: 'موجودی اندوخته صندوق تفریحات',
    amount: 5500000,
    trackingRef: 'EXP-44109',
    category: 'entertainment_expense',
    registeredBy: 'حاج احمد (پدر)',
  },
  {
    id: 'JV-1009',
    voucherNumber: 1009,
    date: '۱۴۰۳/۰۹/۳۰',
    description: 'هزینه شام دورهمی شب یلدا در رستوران سنتی',
    debitAccount: 'هزینه‌های تفریحی و گردهمایی خانوادگی',
    creditAccount: 'موجودی اندوخته صندوق تفریحات',
    amount: 3000000,
    trackingRef: 'EXP-88301',
    category: 'entertainment_expense',
    registeredBy: 'حاج احمد (پدر)',
  },
];
