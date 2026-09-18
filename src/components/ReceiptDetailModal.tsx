import React from 'react';
import { Receipt } from '../types';
import { formatToman } from '../services/fundService';
import { X, CheckCircle2, AlertCircle, Clock, ShieldCheck, Download, Check } from 'lucide-react';

interface ReceiptDetailModalProps {
  receipt: Receipt | null;
  onClose: () => void;
  onApprove?: (receiptId: string) => void;
  canApprove?: boolean;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  receipt,
  onClose,
  onApprove,
  canApprove,
}) => {
  if (!receipt) return null;

  const isApproved = receipt.status === 'approved';
  const isPending = receipt.status === 'pending';
  const isRejected = receipt.status === 'rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-right max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">جزئیات فیش بانکی</h3>
            <span
              className={`inline-block mt-0.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                isApproved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isPending
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isApproved ? '✓ تایید شده' : isPending ? '⏳ در انتظار تایید مدیر' : '✕ رد شده'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
          {/* Image Display */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center p-2 shadow-inner">
            <img
              src={receipt.receiptImageUrl}
              alt="تصویر فیش بانکی"
              className="max-h-56 w-auto object-contain rounded-xl shadow-xs"
            />
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">واریزکننده:</span>
              <strong className="text-slate-900">{receipt.memberName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">مبلغ واریز:</span>
              <strong className="text-teal-800 text-sm font-black">{formatToman(receipt.amount)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">بابت:</span>
              <strong className="text-slate-800">
                {receipt.paymentType === 'monthly_due'
                  ? 'حق عضویت ماهانه'
                  : receipt.paymentType === 'loan_installment'
                  ? `قسط وام گردشی (${receipt.installmentNumber || 'جاری'})`
                  : 'بازپرداخت وام ضروری'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">کد پیگیری / ارجاع:</span>
              <strong className="text-slate-900 font-mono">{receipt.trackingCode}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">بانک مقصد:</span>
              <strong className="text-slate-800">{receipt.bankName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">تاریخ ارسال:</span>
              <span className="text-slate-700">{receipt.submittedDate}</span>
            </div>
            {receipt.verifiedDate && (
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">بررسی توسط:</span>
                <strong className="text-emerald-700">
                  {receipt.verifiedBy} در {receipt.verifiedDate}
                </strong>
              </div>
            )}
            {receipt.rejectionReason && (
              <div className="flex justify-between pt-2 border-t border-slate-200 text-rose-700">
                <span>علت رد:</span>
                <strong>{receipt.rejectionReason}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 safe-bottom mt-2">
          <a
            href={receipt.receiptImageUrl}
            download={`فیش_واریز_${receipt.trackingCode}.svg`}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود فیش</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              بستن
            </button>
            {canApprove && isPending && onApprove && (
              <button
                onClick={() => {
                  onApprove(receipt.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>تایید فوری واریزی</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
