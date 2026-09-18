import React, { useState } from 'react';
import { UserPlus, X, Phone, DollarSign, UserCheck, HeartHandshake, FileText, Sparkles } from 'lucide-react';
import { formatToman } from '../services/fundService';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: {
    name: string;
    familyRelation: string;
    phoneNumber: string;
    monthlyDueAmount: number;
    initialDebt?: number;
    initialInstallmentsLeft?: number;
    notes?: string;
  }) => void;
}

const COMMON_RELATIONS = [
  'پدر',
  'مادر',
  'فرزند',
  'برادر',
  'خواهر',
  'همسر',
  'داماد',
  'عروس',
  'عمو',
  'عمه',
  'دایی',
  'خاله',
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [familyRelation, setFamilyRelation] = useState(COMMON_RELATIONS[2]);
  const [customRelation, setCustomRelation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [monthlyDueAmount, setMonthlyDueAmount] = useState('500000');
  const [hasInitialDebt, setHasInitialDebt] = useState(false);
  const [initialDebt, setInitialDebt] = useState('');
  const [initialInstallmentsLeft, setInitialInstallmentsLeft] = useState('10');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('لطفاً نام و نام خانوادگی عضو را وارد نمایید.');
      return;
    }

    const relation = customRelation.trim() || familyRelation;
    const dueAmt = parseInt(monthlyDueAmount.replace(/,/g, ''), 10) || 500000;
    const debtAmt = hasInitialDebt ? parseInt(initialDebt.replace(/,/g, ''), 10) || 0 : 0;
    const instLeft = hasInitialDebt ? parseInt(initialInstallmentsLeft, 10) || 10 : 0;

    onSubmit({
      name: name.trim(),
      familyRelation: relation,
      phoneNumber: phoneNumber.trim() || '۰۹۱۲۰۰۰۰۰۰۰',
      monthlyDueAmount: dueAmt,
      initialDebt: debtAmt,
      initialInstallmentsLeft: instLeft,
      notes: notes.trim(),
    });

    // Reset & close
    setName('');
    setCustomRelation('');
    setPhoneNumber('');
    setInitialDebt('');
    setHasInitialDebt(false);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 text-right max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Mobile Pull Bar */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <UserPlus className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                افزودن عضو جدید به صندوق
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ثبت پرونده مالی فرد بدون نیاز به نصب نرم‌افزار توسط ایشان
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-3 flex-1">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                نام و نام خانوادگی *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: علیرضا محمدی"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                شماره تماس (اختیاری)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="۰۹۱۲..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-right"
                />
              </div>
            </div>
          </div>

          {/* Relation Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              نسبت خانوادگی
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_RELATIONS.map((rel) => (
                <button
                  type="button"
                  key={rel}
                  onClick={() => {
                    setFamilyRelation(rel);
                    setCustomRelation('');
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    familyRelation === rel && !customRelation
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Due Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              مبلغ حق عضویت ماهانه (تومان)
            </label>
            <div className="relative">
              <input
                type="text"
                value={monthlyDueAmount}
                onChange={(e) => setMonthlyDueAmount(e.target.value)}
                placeholder="500,000"
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">تومان</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              معادل: {formatToman(parseInt(monthlyDueAmount.replace(/,/g, ''), 10) || 0)}
            </p>
          </div>

          {/* Previous/Initial Debt Toggle */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  این عضو از قبل وام سنتی یا بدهی مانده دارد؟
                </span>
              </div>
              <input
                type="checkbox"
                checked={hasInitialDebt}
                onChange={(e) => setHasInitialDebt(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
            </label>

            {hasInitialDebt && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/50 dark:border-amber-900/40">
                <div>
                  <label className="block text-[11px] font-medium text-amber-900 dark:text-amber-300 mb-1">
                    کل مانده بدهی قبلی (تومان)
                  </label>
                  <input
                    type="number"
                    value={initialDebt}
                    onChange={(e) => setInitialDebt(e.target.value)}
                    placeholder="مثلاً ۱۰۰۰۰۰۰۰"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-amber-900 dark:text-amber-300 mb-1">
                    تعداد اقساط باقیمانده
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={initialInstallmentsLeft}
                    onChange={(e) => setInitialInstallmentsLeft(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              یادداشت مدیر (اختیاری)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: هماهنگ شده توسط پدر به صورت حضوری"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>ثبت قطعی عضو جدید</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
