/**
 * Phase 1: Complete Database Schema Design (Firestore Collections & Supabase PostgreSQL)
 * فاز ۱: طراحی جامع شمای دیتابیس برای صندوق وام و پس‌انداز خانوادگی
 */

export interface SchemaDoc {
  collectionName: string;
  sqlTableName: string;
  description: string;
  fields: {
    name: string;
    type: string;
    description: string;
    required: boolean;
    example: string;
  }[];
  indexes: string[];
  securityRulesSummary: string;
}

export const databaseSchemaDocumentation: SchemaDoc[] = [
  {
    collectionName: 'users',
    sqlTableName: 'users',
    description: 'مشخصات اعضای خانواده، نقش‌ها، میزان حق عضویت ماهانه و وضعیت تفویض مدیریت',
    fields: [
      { name: 'id', type: 'string (UUID)', description: 'شناسه اختصاصی کاربر', required: true, example: 'user-admin' },
      { name: 'name', type: 'string', description: 'نام و نام خانوادگی عضو خانواده', required: true, example: 'حاج احمد' },
      { name: 'familyRelation', type: 'string', description: 'نسبت خانوادگی', required: true, example: 'پدر (مدیر ارشد)' },
      { name: 'phoneNumber', type: 'string', description: 'شماره تلفن همراه جهت پیامک یا احراز هویت', required: true, example: '09121111111' },
      { name: 'role', type: "'admin' | 'member'", description: 'نقش کاربر در سیستم (مدیر ارشد یا عضو عادی)', required: true, example: 'admin' },
      { name: 'isDelegatedAdmin', type: 'boolean', description: 'آیا پدر به او دسترسی مدیریت تفویض کرده است؟', required: false, example: 'true' },
      { name: 'monthlyDueAmount', type: 'number', description: 'مبلغ مصوب حق عضویت ماهانه این عضو (تومان)', required: true, example: '1000000' },
      { name: 'totalPaidDues', type: 'number', description: 'مجموع پرداختی‌های حق عضویت تا به امروز', required: true, example: '36000000' },
      { name: 'avatarUrl', type: 'string', description: 'آدرس تصویر پروفایل', required: false, example: 'https://...' },
      { name: 'joinedDate', type: 'string / timestamp', description: 'تاریخ عضویت در صندوق', required: true, example: '1401/01/01' },
    ],
    indexes: ['role ASC', 'joinedDate DESC'],
    securityRulesSummary: 'اعضا فقط پروفایل خود را می‌خوانند؛ مدیر (و تفویض‌شده‌ها) به همه کاربران دسترسی خواندن و تغییر دارند.',
  },
  {
    collectionName: 'fund_wallets',
    sqlTableName: 'fund_wallets',
    description: 'کیف پول‌ها و حساب‌های سه‌گانه صندوق (حق عضویت‌ها، صندوق ضروری، صندوق تفریحات)',
    fields: [
      { name: 'monthlyDuesBalance', type: 'number', description: 'موجودی جاری حق عضویت‌ها (محل تجمیع برای وام گردشی)', required: true, example: '38500000' },
      { name: 'emergencyFundBalance', type: 'number', description: 'موجودی کیف پول وام‌های ضروری و اورژانسی', required: true, example: '12000000' },
      { name: 'entertainmentFundBalance', type: 'number', description: 'موجودی صندوق تفریحات (تغذیه شده از سود و کارمزد وام‌ها)', required: true, example: '4200000' },
      { name: 'totalDisbursedLoans', type: 'number', description: 'کل مبلغ وام‌های اعطا شده از ابتدا تاکنون', required: true, example: '145000000' },
      { name: 'totalAnnualDisbursedForTrips', type: 'number', description: 'کل هزینه‌های صرف شده برای تفریح و سفرهای خانوادگی', required: true, example: '8500000' },
      { name: 'lastUpdated', type: 'timestamp', description: 'زمان آخرین به‌روزرسانی موجودی‌ها', required: true, example: '2026-03-20T10:00:00Z' },
    ],
    indexes: ['single singleton document: system_wallets'],
    securityRulesSummary: 'خواندن برای همه اعضا مجاز است (شفافیت مالی)؛ فقط ادمین مجاز به اصلاح مستقیم بالانس‌ها است.',
  },
  {
    collectionName: 'loans',
    sqlTableName: 'loans',
    description: 'قراردادهای وام فعال و خاتمه‌یافته (وام‌های گردشی و وام‌های ضروری)',
    fields: [
      { name: 'id', type: 'string (UUID)', description: 'شناسه اختصاصی وام', required: true, example: 'loan-1' },
      { name: 'memberId', type: 'string (Ref)', description: 'شناسه عضو دریافت‌کننده وام', required: true, example: 'user-2' },
      { name: 'memberName', type: 'string', description: 'نام دریافت‌کننده وام', required: true, example: 'علی' },
      { name: 'type', type: "'rotating' | 'emergency'", description: 'نوع وام (گردشی نوبتی یا ضروری فوری)', required: true, example: 'rotating' },
      { name: 'principalAmount', type: 'number', description: 'اصل مبلغ وام پرداختی (تومان)', required: true, example: '20000000' },
      { name: 'profitOrFeeRate', type: 'number', description: 'درصد کارمزد وام گردشی (سود سهم صندوق تفریحات)', required: true, example: '2' },
      { name: 'totalPayableAmount', type: 'number', description: 'کل مبلغ بازپرداخت (اصل وام + کارمزد)', required: true, example: '20400000' },
      { name: 'monthlyInstallmentAmount', type: 'number', description: 'مبلغ هر قسط ماهانه', required: true, example: '2040000' },
      { name: 'totalInstallments', type: 'number', description: 'تعداد کل اقساط وام', required: true, example: '10' },
      { name: 'paidInstallments', type: 'number', description: 'تعداد اقساط تسویه شده تاکنون', required: true, example: '4' },
      { name: 'grantedDate', type: 'string / date', description: 'تاریخ پرداخت وام به متقاضی', required: true, example: '1403/08/10' },
      { name: 'dueDate', type: 'string', description: 'موعد پرداخت هر قسط یا مهلت سررسید وام ضروری', required: true, example: '۱۰ هر ماه' },
      { name: 'status', type: "'active' | 'completed' | 'pending'", description: 'وضعیت وام', required: true, example: 'active' },
      { name: 'purposeNote', type: 'string', description: 'توضیحات و علت دریافت وام', required: false, example: 'هزینه تعمیر خودرو' },
    ],
    indexes: ['memberId ASC, status ASC', 'type ASC, status ASC'],
    securityRulesSummary: 'عضو فقط وام‌های خودش را می‌بیند؛ ادمین تمام وام‌ها را مدیریت و اعطا می‌کند.',
  },
  {
    collectionName: 'queue_items',
    sqlTableName: 'queue_items',
    description: 'صف شفاف و نوبت‌بندی اعضا برای دریافت وام‌های گردشی بر اساس تجمیع مبالغ',
    fields: [
      { name: 'id', type: 'string (UUID)', description: 'شناسه نوبت', required: true, example: 'queue-1' },
      { name: 'memberId', type: 'string (Ref)', description: 'شناسه عضو در نوبت', required: true, example: 'user-3' },
      { name: 'memberName', type: 'string', description: 'نام عضو', required: true, example: 'سارا' },
      { name: 'order', type: 'number', description: 'ترتیب اولویت نوبت (1, 2, 3...) با امکان جابجایی توسط ادمین', required: true, example: '1' },
      { name: 'estimatedDate', type: 'string', description: 'تاریخ تخمینی رسیدن نوبت وام', required: true, example: 'فروردین ۱۴۰۴' },
      { name: 'status', type: "'waiting' | 'in_progress' | 'received' | 'deferred'", description: 'وضعیت نوبت', required: true, example: 'in_progress' },
      { name: 'notes', type: 'string', description: 'یادداشت یا تغییر نوبت با توافق خانواده', required: false, example: 'جابجایی با رضایت برادر' },
    ],
    indexes: ['order ASC'],
    securityRulesSummary: 'سیستم صف کاملاً شفاف: همه اعضا خواندن دارند؛ فقط ادمین اجازه تغییر ترتیب (order) را دارد.',
  },
  {
    collectionName: 'receipts',
    sqlTableName: 'receipts',
    description: 'فیش‌های واریزی واریزکنندگان به همراه تصویر فیش، کد پیگیری و فرآیند تایید توسط مدیر',
    fields: [
      { name: 'id', type: 'string (UUID)', description: 'شناسه رهگیری رسید', required: true, example: 'rec-1' },
      { name: 'memberId', type: 'string (Ref)', description: 'عضو واریزکننده', required: true, example: 'user-3' },
      { name: 'memberName', type: 'string', description: 'نام عضو', required: true, example: 'سارا' },
      { name: 'paymentType', type: "'monthly_due' | 'loan_installment' | 'emergency_loan_payback'", description: 'نوع واریزی', required: true, example: 'monthly_due' },
      { name: 'amount', type: 'number', description: 'مبلغ واریز شده بر اساس فیش (تومان)', required: true, example: '1000000' },
      { name: 'receiptImageUrl', type: 'string (URL/Storage)', description: 'آدرس ذخیره تصویر فیش واریز', required: true, example: 'https://storage...' },
      { name: 'trackingCode', type: 'string', description: 'کد پیگیری یا شماره ارجاع شاپرک', required: true, example: '9823410' },
      { name: 'bankName', type: 'string', description: 'نام بانک انتقال‌دهنده', required: true, example: 'بانک ملی' },
      { name: 'status', type: "'pending' | 'approved' | 'rejected'", description: 'وضعیت بررسی فیش', required: true, example: 'pending' },
      { name: 'submittedDate', type: 'string / timestamp', description: 'تاریخ و زمان بارگذاری فیش توسط کاربر', required: true, example: '۱۴۰۳/۱۲/۲۸ - ۱۰:۱۵' },
      { name: 'verifiedDate', type: 'string / timestamp', description: 'تاریخ و زمان تایید یا رد فیش توسط مدیر', required: false, example: '۱۴۰۳/۱۲/۲۸ - ۱۱:۰۰' },
      { name: 'verifiedBy', type: 'string', description: 'نام مدیری که فیش را بررسی کرده است', required: false, example: 'حاج احمد (پدر)' },
      { name: 'rejectionReason', type: 'string', description: 'علت رد فیش در صورت عدم واریز یا تکراری بودن', required: false, example: 'مبلغ به حساب ننشسته است' },
      { name: 'loanId', type: 'string (Optional)', description: 'در صورتی که پرداخت قسط وام باشد، شناسه وام مربوطه', required: false, example: 'loan-1' },
      { name: 'installmentNumber', type: 'number (Optional)', description: 'شماره قسط واریز شده', required: false, example: '5' },
      { name: 'profitComponentAmount', type: 'number', description: 'سهم سود/کارمزد این پرداخت که باید به صندوق تفریحات واریز شود', required: false, example: '40000' },
    ],
    indexes: ['status ASC, submittedDate DESC', 'memberId ASC, submittedDate DESC'],
    securityRulesSummary: 'عضو فقط می‌تواند فیش‌های خودش را ایجاد و مشاهده کند؛ مدیر مجاز به تایید/رد و ثبت وضعیت نهایی است.',
  },
  {
    collectionName: 'entertainment_expenses',
    sqlTableName: 'entertainment_expenses',
    description: 'هزینه‌کرد و مصارف صندوق تفریحات (سفرهای گروهی، شام خانوادگی سالانه از محل سودها)',
    fields: [
      { name: 'id', type: 'string (UUID)', description: 'شناسه هزینه تفریح', required: true, example: 'ent-1' },
      { name: 'title', type: 'string', description: 'عنوان برنامه تفریحی خانوادگی', required: true, example: 'سفر تفریحی خانواده به رامسر' },
      { name: 'amount', type: 'number', description: 'مبلغ برداشت شده از صندوق تفریحات (تومان)', required: true, example: '5500000' },
      { name: 'date', type: 'string', description: 'تاریخ اجرای برنامه تفریحی', required: true, example: 'شهریور ۱۴۰۳' },
      { name: 'description', type: 'string', description: 'توضیحات و هزینه‌های سفر', required: true, example: 'اقامتگاه و پذیرایی دورهمی' },
      { name: 'registeredBy', type: 'string', description: 'مدیر ثبت‌کننده هزینه', required: true, example: 'حاج احمد (مدیر)' },
    ],
    indexes: ['date DESC'],
    securityRulesSummary: 'همه اعضا قابلیت مشاهده گزارش‌های تفریحات را دارند؛ ثبت برداشت منحصراً توسط ادمین صورت می‌پذیرد.',
  },
  {
    collectionName: 'notifications',
    sqlTableName: 'notifications',
    description: 'هشدارهای داخلی و اعلانات PWA برای تایید فیش‌ها، نزدیک شدن نوبت و وضعیت وام‌ها',
    fields: [
      { name: 'id', type: 'string (UUID)', description: 'شناسه نوتیفیکیشن', required: true, example: 'notif-1' },
      { name: 'targetUserId', type: 'string', description: 'شناسه کاربر دریافت‌کننده یا all برای همگانی', required: true, example: 'user-3' },
      { name: 'title', type: 'string', description: 'تیتر اعلان', required: true, example: 'نوبت وام شما نزدیک است!' },
      { name: 'message', type: 'string', description: 'متن مشروح پیام یا هشدار', required: true, example: 'سارا عزیز نوبت وام گردشی شما فرا رسید.' },
      { name: 'type', type: "'receipt_approved' | 'receipt_rejected' | 'turn_near' | 'loan_granted' | 'info'", description: 'دسته‌بندی اعلان', required: true, example: 'turn_near' },
      { name: 'createdAt', type: 'string', description: 'زمان صدور پیام', required: true, example: '۱۴۰۳/۱۲/۲۸' },
      { name: 'isRead', type: 'boolean', description: 'آیا توسط کاربر خوانده شده است؟', required: true, example: 'false' },
    ],
    indexes: ['targetUserId ASC, isRead ASC, createdAt DESC'],
    securityRulesSummary: 'هر کاربر فقط به اعلان‌های مربوط به شناسه خود یا پیام‌های عمومی دسترسی دارد.',
  },
];
