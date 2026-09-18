import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide or show small badge
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>اپلیکیشن نصب شده</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95"
      >
        <Download className="w-4 h-4" />
        <span>نصب اپلیکیشن</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-teal-50 border border-teal-300 text-teal-800 hover:bg-teal-100 px-3 py-1.5 text-xs font-semibold transition"
        >
          <Smartphone className="w-4 h-4 text-teal-700" />
          <span>نصب در آیفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-800 text-right">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-900">نصب اپلیکیشن روی آیفون / آیپد</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                برای استفاده تمام‌صفحه و سریع همانند برنامه بومی موبایل:
              </p>
              <ol className="space-y-2.5 text-xs text-slate-700 list-decimal list-inside pr-1">
                <li>
                  در نوار ابزار مرورگر سافاری، روی دکمه <strong>اشتراک‌گذاری (Share)</strong> ضربه بزنید.
                </li>
                <li>
                  صفحه را کمی به پایین اسکرول کرده و گزینه <strong>Add to Home Screen</strong> را انتخاب کنید.
                </li>
                <li>
                  در بالای صفحه دکمه <strong>Add</strong> را لمس کنید تا آیکون صندوق به صفحه اصلی گوشی اضافه شود.
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-sm font-bold transition shadow-sm"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button for Android / PWA browsers if prompt hasn't fired yet
  return (
    <button
      id="pwa-install-fallback-btn"
      onClick={() => {
        alert('برای نصب این برنامه، کافیست از منوی ۳ نقطه مرورگر گوشی خود گزینه "Add to Home Screen" یا "نصب برنامه" را انتخاب کنید.');
      }}
      className="hidden sm:flex items-center gap-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 px-3 py-1.5 text-xs font-medium transition"
    >
      <Download className="w-3.5 h-3.5 text-teal-600" />
      <span>نصب PWA</span>
    </button>
  );
};
