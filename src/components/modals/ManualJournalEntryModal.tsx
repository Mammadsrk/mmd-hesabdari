import React, { useState } from 'react';
import { User, JournalCategory } from '../../types';
import { formatToman, toPersianDigits, getPersianDateStr } from '../../services/fundService';
import {
  X,
  FilePlus,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertCircle,
  Building,
  User as UserIcon,
} from 'lucide-react';

interface ManualJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  onSave: (entry: {
    description: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    trackingRef?: string;
    category?: JournalCategory;
    memberId?: string;
    memberName?: string;
    date?: string;
  }) => void;
}

const COMMON_DEBIT_ACCOUNTS = [
  'صندوق نقد و اسکناس',
  'بانک و خزانه‌داری صندوق (ملی/ملت)',
  'مطالبات وام‌های پرداختی به اعضا',
  'هزینه‌های تفریح و گردهمایی خانوادگی',
  'حساب جاری اعضا (بدهکار)',
  'سایر هزینه‌های اداری و بانکی',
];

const COMMON_CREDIT_ACCOUNTS = [
  'بانک و خزانه‌داری صندوق (ملی/ملت)',
  'صندوق نقد و اسکناس',
  'سرمایه حق‌عضویت‌های تودیعی اعضا',
  'درآمد کارمزد ۲٪ تفریحات',
  'مطالبات وام‌های پرداختی (تسویه قسط)',
  'اندوخته سود انباشته تفریحات',
  'درآمد متفرقه / سود سپرده بانکی',
];

export const ManualJournalEntryModal: React.FC<ManualJournalEntryModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  onSave,
}) => {
  const [description, setDescription] = useState('');
  const [debitAccount, setDebitAccount] = useState('بانک و خزانه‌داری صندوق (ملی/ملت)');
  const [creditAccount, setCreditAccount] = useState('درآمد کارمزد ۲٪ تفریحات');
  const [customDebit, setCustomDebit] = useState('');
  const [customCredit, setCustomCredit] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [trackingRef, setTrackingRef] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [entryDate, setEntryDate] = useState(getPersianDateStr());
  const [category, setCategory] = useState<JournalCategory>('manual');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim()) {
      setErrorMessage('لطفاً شرح سند حسابداری را وارد کنید.');
      return;
    }

    if (numAmount <= 0) {
      setErrorMessage('مبلغ سند باید بزرگتر از صفر باشد.');
      return;
    }

    const finalDebit = debitAccount === '__custom__' ? customDebit.trim() : debitAccount;
    const finalCredit = creditAccount === '__custom__' ? customCredit.trim() : creditAccount;

    if (!finalDebit) {
      setErrorMessage('لطفاً حساب بدهکار را مشخص نمایید.');
      return;
    }

    if (!finalCredit) {
      setErrorMessage('لطفاً حساب بستانکار را مشخص نمایید.');
      return;
    }

    if (finalDebit === finalCredit) {
      setErrorMessage('حساب بدهکار و بستانکار نمی‌تواند یکسان باشد (نقض قاعده موازنه دوبل).');
      return;
    }

    const selectedMember = allUsers.find((u) => u.id === selectedMemberId);

    onSave({
      description: description.trim(),
      debitAccount: finalDebit,
      creditAccount: finalCredit,
      amount: numAmount,
      trackingRef: trackingRef.trim() || undefined,
      category,
      memberId: selectedMember ? selectedMember.id : undefined,
      memberName: selectedMember ? selectedMember.name : undefined,
      date: entryDate.trim() || getPersianDateStr(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-slate-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-200 border border-white/20">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">ثبت سند حسابداری جدید (دفتر روزنامه)</h2>
              <p className="text-xs text-teal-100/80 mt-0.5">
                ثبت رویداد مالی به صورت استاندارد دوبل (بدهکار / بستانکار)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              شرح رویداد مالی / شرح سند <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: واریز تنخواه سفر دورهمی / پرداخت کارمزد بانکی / انتقال وجه بین حساب‌ها"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Double Entry Rows: Debit vs Credit */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>طرفین حساب (سرفصل‌های دوبل)</span>
            </div>

            {/* Debit Account */}
            <div>
              <label className="block text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                سرفصل بدهکار (Debit) <span className="text-slate-400 text-[10px]">(گیرنده وجه / افزایش دارایی یا هزینه)</span>
              </label>
              <select
                value={debitAccount}
                onChange={(e) => setDebitAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 mb-1.5"
              >
                {COMMON_DEBIT_ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
                <option value="__custom__">سرفصل دلخواه...</option>
              </select>
              {debitAccount === '__custom__' && (
                <input
                  type="text"
                  value={customDebit}
                  onChange={(e) => setCustomDebit(e.target.value)}
                  placeholder="نام سرفصل بدهکار را بنویسید..."
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              )}
            </div>

            {/* Credit Account */}
            <div>
              <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                سرفصل بستانکار (Credit) <span className="text-slate-400 text-[10px]">(دهنده وجه / افزایش درآمد یا تعهد)</span>
              </label>
              <select
                value={creditAccount}
                onChange={(e) => setCreditAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500 mb-1.5"
              >
                {COMMON_CREDIT_ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
                <option value="__custom__">سرفصل دلخواه...</option>
              </select>
              {creditAccount === '__custom__' && (
                <input
                  type="text"
                  value={customCredit}
                  onChange={(e) => setCustomCredit(e.target.value)}
                  placeholder="نام سرفصل بستانکار را بنویسید..."
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                مبلغ سند (تومان) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={amount ? Number(amount.replace(/[^0-9]/g, '')).toLocaleString('en-US') : ''}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="مثلاً: ۵۰۰,۰۰۰"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 font-bold tabular-nums focus:outline-none focus:border-teal-500 text-left ltr"
              />
              {numAmount > 0 && (
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1 block">
                  {formatToman(numAmount)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                تاریخ سند (شمسی)
              </label>
              <input
                type="text"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                placeholder="۱۴۰۳/۰۶/۲۵"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 tabular-nums focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Member (Optional) & Tracking Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                طرف حساب معین (اختیاری)
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="">بدون انتساب به شخص (عمومی)</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.familyRelation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                کد پیگیری / شماره ارجاع
              </label>
              <input
                type="text"
                value={trackingRef}
                onChange={(e) => setTrackingRef(e.target.value)}
                placeholder="مثال: REF-987654 یا شماره فیش"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ثبت قطعی در دفتر روزنامه</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
