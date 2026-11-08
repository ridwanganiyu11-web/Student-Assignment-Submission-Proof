import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  Search, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  GraduationCap, 
  Lock,
  Layers,
  Award
} from 'lucide-react';
import { getLocalSubmissions, getLocalAssignments } from '../utils/storage';
import { formatProofId, formatDateTime, formatHash, formatAddress } from '../utils/crypto';
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_CURRENCY, BOTCHAIN_TOTAL_SUPPLY } from '../config/chain';

export function Home({ setActiveTab, onSelectProof }) {
  const [searchQuery, setSearchQuery] = useState('');
  const submissions = getLocalSubmissions();
  const assignments = getLocalAssignments();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveTab('verify');
    if (onSelectProof) {
      onSelectProof(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-16 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <div className="relative text-center space-y-6 pt-6 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-900/40 border border-blue-700/60 text-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Powered by Botchain Testnet (Chain ID {BOTCHAIN_CHAIN_ID})</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Submit with Proof. <br className="hidden sm:block" />
          <span className="custom-gradient-text">Verify with Confidence.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Cryptographically timestamp and register digital fingerprints of your university assignments 
          on the Botchain blockchain. Your file never leaves your browser — only the tamper-proof proof is recorded.
        </p>

        {/* Quick Verification Search Box */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-2">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Verify Proof ID (e.g. SP-000125) or SHA-256 fingerprint..."
              className="w-full pl-12 pr-28 py-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-xl"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Verify Now
            </button>
          </div>
        </form>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('submit')}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95"
          >
            <FileCheck2 className="w-5 h-5" />
            Submit Assignment Proof
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <button
            onClick={() => setActiveTab('lecturer')}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <GraduationCap className="w-5 h-5 text-blue-400" />
            Lecturer Portal
          </button>
        </div>
      </div>

      {/* Dashboard Metrics (from example interface in requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Submissions</p>
          <p className="text-3xl font-extrabold text-white mt-2">18</p>
          <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All cryptographically verified
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered Proofs</p>
          <p className="text-3xl font-extrabold text-white mt-2">18</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Zero file exposure
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Courses</p>
          <p className="text-3xl font-extrabold text-white mt-2">{assignments.length}</p>
          <p className="text-xs text-slate-400 mt-1">CS-101, CS-304, CS-480...</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Network Token</p>
          <p className="text-3xl font-extrabold text-white mt-2">{BOTCHAIN_CURRENCY}</p>
          <p className="text-xs text-slate-400 mt-1">Supply: {BOTCHAIN_TOTAL_SUPPLY}</p>
        </div>
      </div>

      {/* 4-Step Interactive Process */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white">How SubmitProof Works</h2>
          <p className="text-sm text-slate-400 mt-1">
            Four simple steps to absolute academic submission certainty
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl relative border-t-2 border-t-blue-500">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <h3 className="font-semibold text-white text-base">Select or Enter Details</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Choose an official lecturer assignment or register an open submission with your course code and title.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl relative border-t-2 border-t-indigo-500">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <h3 className="font-semibold text-white text-base">Client-Side Hashing</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your browser calculates the unique SHA-256 digital fingerprint in milliseconds. Your document is never uploaded.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl relative border-t-2 border-t-blue-400">
            <div className="w-8 h-8 rounded-lg bg-blue-400/20 text-blue-300 font-bold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <h3 className="font-semibold text-white text-base">Botchain Timestamp</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Approve with MetaMask on Botchain Testnet (Chain ID 968). The smart contract writes the fingerprint and block timestamp.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl relative border-t-2 border-t-emerald-500">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-3">
              4
            </div>
            <h3 className="font-semibold text-white text-base">Instant Verification</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Download your verified PDF receipt with QR code. Lecturers verify without paying any gas or connecting a wallet.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Submissions Feed (matching the prompt's illustrative interface) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Verified Submissions</h2>
            <p className="text-xs text-slate-400">Public academic proofs recorded on Botchain Testnet</p>
          </div>
          <button
            onClick={() => setActiveTab('my-submissions')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.slice(0, 4).map((sub) => (
            <div 
              key={sub.id}
              onClick={() => {
                if (onSelectProof) onSelectProof(sub.id);
                setActiveTab('verify');
              }}
              className="glass-card p-5 rounded-2xl cursor-pointer hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Registered Proof
                  </span>
                  <h4 className="font-bold text-white text-lg mt-2">{sub.title}</h4>
                  <p className="text-xs text-slate-400">
                    {sub.courseCode} · {sub.fileType || 'PDF'} · v{sub.version || 1}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-1 rounded-lg border border-blue-900">
                    {formatProofId(sub.id)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDateTime(sub.timestamp)}</span>
                </div>
                <span className="text-blue-400 hover:underline">Verify File →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Option C Architecture Explainer */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-blue-900/30">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 mb-3">
            <Layers className="w-3.5 h-3.5" /> Option C: Dual Submission System
          </div>
          <h3 className="text-xl font-bold text-white">Open Submissions & Lecturer-Created Assignments</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            SubmitProof supports independent student registrations for any project or term paper, as well 
            as lecturer-published assignments with cryptographic hard deadlines and automatic late-submission detection.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h5 className="font-bold text-white text-sm">Mode 1: Open Submissions</h5>
              <p className="text-xs text-slate-400 mt-1">
                Any student can stamp any document with optional self-reported deadline and revision chains.
              </p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h5 className="font-bold text-white text-sm">Mode 2: Lecturer Assignments</h5>
              <p className="text-xs text-slate-400 mt-1">
                Lecturers publish assignments on-chain; students submit against the ID with automated deadline verification.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

