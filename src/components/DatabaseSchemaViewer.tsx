import React, { useState } from 'react';
import { databaseSchemaDocumentation } from '../data/databaseSchema';
import { Database, ShieldCheck, Server, Table, Copy, Check } from 'lucide-react';

export const DatabaseSchemaViewer: React.FC = () => {
  const [activeCollection, setActiveCollection] = useState<string>('receipts');
  const [copied, setCopied] = useState(false);

  const currentDoc = databaseSchemaDocumentation.find((d) => d.collectionName === activeCollection) || databaseSchemaDocumentation[0];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(databaseSchemaDocumentation, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24 text-right max-w-xl mx-auto px-1 sm:px-0">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-xl relative overflow-hidden ring-1 ring-white/10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black">
                  معماری پایگاه داده صندوق
                </h2>
                <span className="text-[10px] text-indigo-300">
                  Firebase Firestore & Supabase
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-xs transition active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کپی شد' : 'کپی JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collection Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {databaseSchemaDocumentation.map((doc) => (
          <button
            key={doc.collectionName}
            onClick={() => setActiveCollection(doc.collectionName)}
            className={`px-3 py-2 rounded-xl font-black text-xs whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeCollection === doc.collectionName
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{doc.collectionName}</span>
          </button>
        ))}
      </div>

      {/* Active Collection Details Card */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-black text-slate-900">
              کالکشن: <span className="text-indigo-700 font-mono">{currentDoc.collectionName}</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-mono">
              جدول SQL: {currentDoc.sqlTableName}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{currentDoc.description}</p>
        </div>

        {/* Fields list for mobile */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-800 block">فیلدهای این کالکشن:</span>
          <div className="space-y-2">
            {currentDoc.fields.map((f) => (
              <div key={f.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-black text-slate-900">{f.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {f.type}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                        f.required
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-200/60 text-slate-600'
                      }`}
                    >
                      {f.required ? 'اجباری' : 'اختیاری'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">{f.description}</p>
                <div className="text-[10px] text-slate-500 mt-1 font-mono bg-white p-1.5 rounded-lg border border-slate-200/60">
                  نمونه: {f.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Rules & Indexing */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <div className="flex items-center gap-1.5 mb-1 text-indigo-950 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>قوانین امنیتی دسترسی (Security Rules):</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {currentDoc.securityRulesSummary}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <div className="flex items-center gap-1.5 mb-1 text-indigo-950 font-bold text-xs">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>ایندکس‌های ضروری (Indexes):</span>
            </div>
            <ul className="text-[10px] text-slate-600 space-y-1 font-mono list-disc list-inside">
              {currentDoc.indexes.map((idx, i) => (
                <li key={i}>{idx}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
