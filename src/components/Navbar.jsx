import React from 'react';
import { ShieldCheck, FileCheck2, GraduationCap, Clock, ExternalLink } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL } from '../config/chain';
import { formatAddress } from '../utils/crypto';

export function Navbar({ activeTab, setActiveTab }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SubmitProof</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                  Botchain 968
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden md:block">
                Submit with Proof. Verify with Confidence.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'submit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Submit Proof
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'verify'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Verify File
            </button>
            <button
              onClick={() => setActiveTab('lecturer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'lecturer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Lecturer Portal
            </button>
            <button
              onClick={() => setActiveTab('my-submissions')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'my-submissions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              My History
            </button>
          </nav>

          {/* Wallet / Network Actions */}
          <div className="flex items-center gap-3">
            <a
              href={BOTCHAIN_EXPLORER_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800"
              title="View BohrScan Explorer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              BOT Chain (968)
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            {isConnected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => open()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-950/70 border border-blue-700/50 hover:border-blue-500 rounded-xl text-xs font-mono text-blue-200 transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  {formatAddress(address)}
                </button>
                <button
                  onClick={() => disconnect()}
                  className="text-xs text-slate-400 hover:text-red-400 px-2 py-1.5 transition-colors"
                  title="Disconnect"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => open()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-1 px-2 ${activeTab === 'home' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`py-1 px-2 ${activeTab === 'submit' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            Submit
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`py-1 px-2 ${activeTab === 'verify' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            Verify
          </button>
          <button
            onClick={() => setActiveTab('lecturer')}
            className={`py-1 px-2 ${activeTab === 'lecturer' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            Lecturer
          </button>
          <button
            onClick={() => setActiveTab('my-submissions')}
            className={`py-1 px-2 ${activeTab === 'my-submissions' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            History
          </button>
        </div>
      </div>
    </header>
  );
}

