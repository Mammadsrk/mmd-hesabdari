import React, { useState } from 'react';
import { formatToman } from '../services/fundService';
import { X, Check, Palmtree, Sparkles, AlertCircle } from 'lucide-react';

interface EntertainmentDisbursementModalProps {
  isOpen: boolean;
  entertainmentBalance: number;
  onClose: () => void;
  onSubmit: (title: string, amount: number, description: string) => void;
}

export const EntertainmentDisbursementModal: React.FC<EntertainmentDisbursementModalProps> = ({
  isOpen,
  entertainmentBalance,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(3000000);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const isBalanceSufficient = entertainmentBalance >= amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('لطفاً عنوان برنامه تفریحی را وارد نمایید');
      return;
    }
    if (!amount || amount <= 0) {
      alert('لطفاً مبلغ برداشت را وارد کنید');
      return;
    }
    if (!isBalanceSufficient) {
      alert('موجودی صندوق تفریحات کافی نیست');
      return;
    }
    onSubmit(title, amount, description);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-right max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Palmtree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">برداشت از صندوق تفریحات</h3>
              <p className="text-[10px] text-slate-500">
                موجودی سودها: <strong className="text-emerald-700">{formatToman(entertainmentBalance)}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs flex-1 overflow-y-auto pr-0.5">
          <div>
            <label className="font-black text-slate-700 block mb-1">عنوان برنامه تفریحی یا خانوادگی:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: سفر شمال تابستان، دورهمی یلدا، شام دسته‌جمعی..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">مبلغ هزینه تفریح (تومان):</label>
              <span className="text-emerald-700 font-black">{formatToman(amount)}</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              step={500000}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">شرح هزینه‌کرد و اقلام:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: هزینه اجاره اقامتگاه، پذیرایی و مواد غذایی برای تمامی اعضای خانواده..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {!isBalanceSufficient && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>مبلغ بیشتر از موجودی صندوق تفریحات است.</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 safe-bottom">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!isBalanceSufficient}
              className={`flex-1 py-2.5 rounded-xl font-black text-white transition shadow-sm flex items-center justify-center gap-1.5 ${
                isBalanceSufficient
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>ثبت و کسر از سود</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
