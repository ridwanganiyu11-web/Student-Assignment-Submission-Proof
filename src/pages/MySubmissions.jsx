import React from 'react';
import { 
  FileCheck2, 
  Clock, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  Plus, 
  RefreshCw,
  Award
} from 'lucide-react';
import { getLocalSubmissions } from '../utils/storage';
import { formatProofId, formatDateTime, formatAddress, formatHash, compareDeadline } from '../utils/crypto';
import { generateProofPDF } from '../utils/pdfGenerator';
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL } from '../config/chain';

export function MySubmissions({ setActiveTab, onSelectProof }) {
  const submissions = getLocalSubmissions();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Student Submission History</h1>
          <p className="text-sm text-slate-400">
            All assignment fingerprints registered under your wallet on Botchain Testnet (Chain ID {BOTCHAIN_CHAIN_ID}).
          </p>
        </div>

        <button
          onClick={() => setActiveTab('submit')}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Submit New Proof
        </button>
      </div>

      {/* Metrics Banner from the specification */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total submissions</p>
          <p className="text-3xl font-extrabold text-white mt-2">18</p>
          <p className="text-xs text-blue-400 mt-1">Lifetime total</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered proofs</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">18</p>
          <p className="text-xs text-emerald-500 mt-1">100% on-chain confirmed</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Courses</p>
          <p className="text-3xl font-extrabold text-white mt-2">5</p>
          <p className="text-xs text-slate-400 mt-1">CS-101, CS-304, CS-480...</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This semester</p>
          <p className="text-3xl font-extrabold text-white mt-2">12</p>
          <p className="text-xs text-slate-400 mt-1">Fall / Winter 2026</p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Registered Academic Proof Records</h2>

        <div className="space-y-3">
          {submissions.map((sub) => {
            const deadlineComp = compareDeadline(sub.timestamp, sub.statedDeadline);

            return (
              <div
                key={sub.id}
                className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded-md border border-blue-900">
                      {formatProofId(sub.id)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                      Registered
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {sub.courseCode} · {sub.fileType || 'PDF'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-800 font-semibold">
                      v{sub.version || 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{sub.title}</h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Submitted: {formatDateTime(sub.timestamp)}
                    </span>
                    {sub.statedDeadline > 0 && (
                      <span className={deadlineComp.isLate ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
                        {deadlineComp.diffText}
                      </span>
                    )}
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] font-mono text-slate-400 break-all bg-slate-900/90 px-2 py-1 rounded border border-slate-800 block sm:inline-block">
                      SHA-256: {formatHash(sub.fileHash, 14, 14)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 self-end md:self-center">
                  <button
                    onClick={() => generateProofPDF(sub)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-semibold border border-blue-500/30 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF Receipt
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectProof) onSelectProof(sub.id);
                      setActiveTab('verify');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verify
                  </button>

                  <a
                    href={`${BOTCHAIN_EXPLORER_URL}/tx/${sub.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-400 bg-slate-900 rounded-xl border border-slate-800 transition-colors"
                    title="View on BohrScan Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

