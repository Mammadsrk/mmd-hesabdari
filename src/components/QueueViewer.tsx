import React from 'react';
import { QueueItem, User } from '../types';
import { Users, Sparkles, Calendar } from 'lucide-react';
import { toPersianDigits } from '../services/fundService';

interface QueueViewerProps {
  queue: QueueItem[];
  allUsers: User[];
  currentUserId: string;
  onSelectMember?: (userId: string) => void;
}

export const QueueViewer: React.FC<QueueViewerProps> = ({
  queue,
  allUsers,
  currentUserId,
}) => {
  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-1 sm:px-0 text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-950/95 via-slate-900/90 to-indigo-950/95 p-4.5 sm:p-5 text-white shadow-lg shadow-slate-950/20 backdrop-blur-xl relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 shrink-0 backdrop-blur-xs border border-white/15">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-normal">صف نوبت‌بندی وام گردشی خانوادگی</h2>
            <p className="text-[11px] text-teal-300/80 mt-0.5">
              ترتیب اولویت پرداخت وام‌ها به اعضای خانواده
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Info Pill Box */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0 mt-0.5 text-amber-500">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">قانون نوبت‌بندی:</strong> هر ماه با تجمیع حق عضویت‌ها، مبلغ وام مصوب (۲۰,۰۰۰,۰۰۰ تومان) به نفر اول صف پرداخت شده و ایشان به انتهای صف منتقل می‌شود.
          </p>
        </div>
      </div>

      {/* Vertical Timeline Queue Cards */}
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">ترتیب اولویت نوبت‌ها</span>
          <span className="text-[10px] text-slate-400 font-medium tabular-nums">{toPersianDigits(queue.length)} عضو در صف</span>
        </div>

        <div className="divide-y divide-slate-100/80 dark:divide-slate-800/80 mt-1">
          {queue.map((item, index) => {
            const user = allUsers.find((u) => u.id === item.memberId);
            const isMe = item.memberId === currentUserId;
            const isFirst = index === 0;

            return (
              <div
                key={item.id}
                className={`py-3 px-2.5 rounded-xl transition-all my-1 flex items-center justify-between gap-2.5 ${
                  isMe
                    ? 'bg-teal-50/80 dark:bg-teal-950/50 border border-teal-300/80 dark:border-teal-800 shadow-2xs'
                    : isFirst
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800 shadow-2xs'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Order Rank Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 tabular-nums ${
                      isFirst
                        ? 'bg-amber-500 text-white shadow-xs'
                        : isMe
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {toPersianDigits(item.order)}
                  </div>

                  {/* Avatar */}
                  {user?.avatarUrl && (
                    <img
                      src={user.avatarUrl}
                      alt={item.memberName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                    />
                  )}

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{item.memberName}</span>
                      {user && (
                        <span className="text-[10px] text-slate-400">({user.familyRelation})</span>
                      )}
                      {isMe && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-semibold">
                          شما
                        </span>
                      )}
                      {isFirst && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-semibold border border-amber-300 dark:border-amber-800">
                          دریافت‌کننده بعدی
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 tabular-nums">
                      <Calendar className="w-3 h-3" />
                      <span>{toPersianDigits(item.estimatedDate)}</span>
                      {item.notes && <span>• {item.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block tabular-nums">
                    ۲۰,۰۰۰,۰۰۰ تومان
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
