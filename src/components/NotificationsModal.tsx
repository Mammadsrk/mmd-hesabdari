import React from 'react';
import { AppNotification } from '../types';
import { X, Bell, CheckCircle2, AlertTriangle, Info, Sparkles } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  notifications: AppNotification[];
  currentUserId: string;
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  notifications,
  currentUserId,
  onClose,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const myNotifs = notifications.filter(
    (n) => n.targetUserId === currentUserId || n.targetUserId === 'all'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-right max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">اعلان‌ها و هشدارهای صندوق</h3>
              <span className="text-[10px] text-slate-500">{myNotifs.length} پیام</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-500 text-[11px]">پیام‌های شما و خانواده</span>
          <button
            onClick={onMarkAllAsRead}
            className="text-teal-700 hover:text-teal-950 font-black text-[11px]"
          >
            خوانده شدن همه
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {myNotifs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              پیام جدیدی در صندوق وجود ندارد.
            </div>
          ) : (
            myNotifs.map((n) => {
              const isApproved = n.type === 'receipt_approved';
              const isRejected = n.type === 'receipt_rejected';
              const isTurnNear = n.type === 'turn_near';

              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border text-xs transition ${
                    !n.isRead
                      ? 'bg-teal-50/70 border-teal-300 shadow-xs ring-1 ring-teal-500/10'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isApproved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : isRejected ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : isTurnNear ? (
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-xs">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 mt-2 safe-bottom">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
