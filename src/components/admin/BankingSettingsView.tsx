import React, { useState } from 'react';
import { formatToman } from '../../services/fundService';
import {
  SlidersHorizontal,
  Landmark,
  Save,
  CheckCircle2,
  Percent,
  CreditCard,
  Phone,
  Shield,
  Coins,
} from 'lucide-react';

interface BankingSettingsViewProps {
  onSaveNotice?: (msg: string) => void;
}

export const BankingSettingsView: React.FC<BankingSettingsViewProps> = ({ onSaveNotice }) => {
  const [rotatingLoanCap, setRotatingLoanCap] = useState(20000000);
  const [feeRate, setFeeRate] = useState(2);
  const [installmentsCount, setInstallmentsCount] = useState(10);
  const [monthlyDue, setMonthlyDue] = useState(500000);
  const [emergencyCap, setEmergencyCap] = useState(10000000);
  const [cardNumber, setCardNumber] = useState('6037-9971-2345-8890');
  const [iban, setIban] = useState('IR82-0120-0000-0000-1234-5678');
  const [bankName, setBankName] = useState('بانک ملی ایران - شعبه مرکزی');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onSaveNotice) onSaveNotice('تنظیمات و پارامترهای بانکی صندوق با موفقیت ذخیره شد.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                پارامترها و قوانین هسته بانکداری صندوق
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                تنظیمات اختصاصی مصوب مدیر ارشد صندوق (پدر)
              </span>
            </div>
          </div>

          {isSaved && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>ذخیره شد</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* 1. Rotating Loan Cap */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-teal-500" />
                <span>مبلغ مصوب هر وام گردشی (تومان)</span>
              </label>
              <input
                type="number"
                value={rotatingLoanCap}
                onChange={(e) => setRotatingLoanCap(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 font-bold"
              />
              <span className="text-[10px] text-slate-400 block">
                معادل: {formatToman(rotatingLoanCap)}
              </span>
            </div>

            {/* 2. Fee Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-amber-500" />
                <span>درصد کارمزد وام گردشی (سهم تفریحات)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={feeRate}
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 font-bold"
                />
                <span className="text-xs font-bold text-slate-500">درصد</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                سهم تفریحات از هر وام: {formatToman((rotatingLoanCap * feeRate) / 100)}
              </span>
            </div>

            {/* 3. Installments Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                تعداد اقساط پیش‌فرض وام‌ها (ماه)
              </label>
              <input
                type="number"
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 font-bold"
              />
              <span className="text-[10px] text-slate-400 block">
                مبلغ هر قسط ماهانه: {formatToman(((rotatingLoanCap * (1 + feeRate / 100)) / installmentsCount))}
              </span>
            </div>

            {/* 4. Monthly Dues */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                مبلغ پیش‌فرض حق عضویت ماهانه هر عضو (تومان)
              </label>
              <input
                type="number"
                value={monthlyDue}
                onChange={(e) => setMonthlyDue(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 font-bold"
              />
              <span className="text-[10px] text-slate-400 block">
                معادل: {formatToman(monthlyDue)}
              </span>
            </div>

            {/* 5. Emergency Loan Cap */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                سقف اعتبار وام اضطراری فوری (بدون کارمزد)
              </label>
              <input
                type="number"
                value={emergencyCap}
                onChange={(e) => setEmergencyCap(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 font-bold"
              />
              <span className="text-[10px] text-slate-400 block">
                معادل: {formatToman(emergencyCap)}
              </span>
            </div>

            {/* 6. Bank Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                نام بانک و شعبه حساب رسمی صندوق
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>

            {/* 7. Card Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                شماره کارت رسمی صندوق جهت واریز اعضا
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            {/* 8. IBAN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                شماره شبا رسمی صندوق (IBAN)
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition active:scale-95 flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره و به‌روزرسانی پارامترهای صندوق</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
