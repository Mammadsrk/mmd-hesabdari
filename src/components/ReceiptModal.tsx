import React, { useState } from 'react';
import { User, PaymentType, Receipt } from '../types';
import { generateSampleReceiptImage } from '../data/initialData';
import { formatToman } from '../services/fundService';
import { X, Upload, Camera, Check, Sparkles, Info, ArrowLeft } from 'lucide-react';

interface ReceiptModalProps {
  currentUser: User;
  isOpen: boolean;
  prefillType?: PaymentType;
  onClose: () => void;
  onSubmitReceipt: (newReceipt: Omit<Receipt, 'id' | 'status' | 'submittedDate'>) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  currentUser,
  isOpen,
  prefillType = 'monthly_due',
  onClose,
  onSubmitReceipt,
}) => {
  const [paymentType, setPaymentType] = useState<PaymentType>(prefillType);
  const [amount, setAmount] = useState<number>(
    prefillType === 'monthly_due' ? currentUser.monthlyDueAmount : 2040000
  );
  const [bankName, setBankName] = useState('بانک ملی');
  const [trackingCode, setTrackingCode] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Generate a realistic demo receipt instantly
  const handleGenerateSampleReceipt = () => {
    const randomTrack = Math.floor(1000000 + Math.random() * 9000000).toString();
    const nowStr = new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date());

    setTrackingCode(randomTrack);
    const sampleImg = generateSampleReceiptImage(
      bankName,
      new Intl.NumberFormat('fa-IR').format(amount),
      nowStr,
      `Ref-${randomTrack}`
    );
    setReceiptImage(sampleImg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      alert('لطفاً مبلغ واریز را مشخص نمایید');
      return;
    }

    if (!trackingCode.trim()) {
      alert('لطفاً شماره پیگیری یا ارجاع بانکی را وارد نمایید');
      return;
    }

    const finalImage =
      receiptImage ||
      generateSampleReceiptImage(
        bankName,
        new Intl.NumberFormat('fa-IR').format(amount),
        new Date().toLocaleDateString('fa-IR'),
        trackingCode
      );

    const profitComponent = paymentType === 'loan_installment' ? Math.round(amount * 0.02) : 0;

    onSubmitReceipt({
      memberId: currentUser.id,
      memberName: currentUser.name,
      paymentType,
      amount,
      receiptImageUrl: finalImage,
      trackingCode,
      bankName,
      profitComponentAmount: profitComponent,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      {/* Mobile Bottom Sheet Container */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-right max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Pull handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">
              ثبت فیش واریز جدید
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              واریزکننده: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.familyRelation})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs flex-1 overflow-y-auto pr-0.5">
          {/* 1. Payment Type Selection */}
          <div>
            <label className="font-black text-slate-700 block mb-1.5">انتخاب بابت واریز:</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentType('monthly_due');
                  setAmount(currentUser.monthlyDueAmount);
                }}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  paymentType === 'monthly_due'
                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-black ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">حق عضویت</div>
                <div className="text-[9px] text-teal-700 mt-0.5">ماهانه صندوق</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentType('loan_installment');
                  setAmount(2040000);
                }}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  paymentType === 'loan_installment'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">قسط وام</div>
                <div className="text-[9px] text-indigo-700 mt-0.5">گردشی نوبتی</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentType('emergency_loan_payback');
                  setAmount(2500000);
                }}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  paymentType === 'emergency_loan_payback'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-black ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">وام ضروری</div>
                <div className="text-[9px] text-amber-700 mt-0.5">بازپرداخت فوری</div>
              </button>
            </div>
          </div>

          {/* 2. Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">مبلغ واریز شده (تومان):</label>
              <span className="text-teal-800 font-black text-xs">{formatToman(amount)}</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              step={50000}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-black text-slate-900 text-sm"
              placeholder="مبلغ به تومان"
              required
            />
          </div>

          {/* 3. Bank & Tracking Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">بانک واریزکننده:</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold text-slate-800 text-xs"
              >
                <option value="بانک ملی">بانک ملی</option>
                <option value="بانک ملت">بانک ملت</option>
                <option value="بانک سامان">بانک سامان</option>
                <option value="بانک صادرات">بانک صادرات</option>
                <option value="بانک تجارت">بانک تجارت</option>
                <option value="بانک سپه">بانک سپه</option>
                <option value="بانک قرض‌الحسنه رسالت">بانک قرض‌الحسنه رسالت</option>
                <option value="بلو بانک / نئوبانک">بلو بانک / نئوبانک</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">کد پیگیری / شماره ارجاع:</label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="مثلاً 7824109"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono font-bold text-slate-800 text-xs"
                required
              />
            </div>
          </div>

          {/* 4. Receipt Image or Camera */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">تصویر فیش واریز:</label>
              <button
                type="button"
                onClick={handleGenerateSampleReceipt}
                className="text-[10px] text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 cursor-pointer bg-teal-50 px-2 py-1 rounded-lg border border-teal-200"
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>ساخت خودکار فیش نمونه</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/40 cursor-pointer transition active:scale-95">
                <Upload className="w-5 h-5 text-teal-600" />
                <span className="font-bold text-slate-800 text-xs">گالری عکس</span>
                <span className="text-[9px] text-slate-400">فایل از گوشی</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <label className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/40 cursor-pointer transition active:scale-95">
                <Camera className="w-5 h-5 text-teal-600" />
                <span className="font-bold text-slate-800 text-xs">عکس با دوربین</span>
                <span className="text-[9px] text-slate-400">دوربین موبایل</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {receiptImage && (
              <div className="mt-2.5 p-2 bg-teal-50/80 rounded-2xl border border-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-14 rounded-xl overflow-hidden border border-teal-300 bg-white shrink-0 shadow-xs">
                    <img src={receiptImage} alt="پیش‌نمایش" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-black text-teal-950 text-xs block">تصویر فیش پیوست شد ✓</span>
                    <span className="text-[10px] text-teal-700">آماده تایید توسط پدر (مدیر)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptImage('')}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg bg-rose-50"
                >
                  حذف
                </button>
              </div>
            )}
          </div>

          {/* Info banner */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-slate-600 flex items-start gap-2 text-[11px] leading-relaxed">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              پس از ثبت، واریزی در کارتابل پدر ثبت شده و پس از بررسی حساب، تایید و به کیف پول شما اضافه می‌شود.
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 safe-bottom">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>ارسال نهایی فیش واریز</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
