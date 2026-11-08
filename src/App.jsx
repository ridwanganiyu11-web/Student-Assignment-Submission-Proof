import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { SubmitAssignment } from './pages/SubmitAssignment';
import { VerifyProof } from './pages/VerifyProof';
import { LecturerPortal } from './pages/LecturerPortal';
import { MySubmissions } from './pages/MySubmissions';
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL, BOTCHAIN_RPC_URL, BOTCHAIN_TOTAL_SUPPLY } from './config/chain';
import { ShieldCheck, ExternalLink, GraduationCap, Github } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProofId, setSelectedProofId] = useState(null);

  const handleSelectProof = (proofId) => {
    setSelectedProofId(proofId);
    setActiveTab('verify');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navigation Bar with Reown AppKit */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <Home setActiveTab={setActiveTab} onSelectProof={handleSelectProof} />
        )}
        {activeTab === 'submit' && (
          <SubmitAssignment setActiveTab={setActiveTab} onSelectProof={handleSelectProof} />
        )}
        {activeTab === 'verify' && (
          <VerifyProof initialProofId={selectedProofId} />
        )}
        {activeTab === 'lecturer' && (
          <LecturerPortal setActiveTab={setActiveTab} onSelectProof={handleSelectProof} />
        )}
        {activeTab === 'my-submissions' && (
          <MySubmissions setActiveTab={setActiveTab} onSelectProof={handleSelectProof} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-10 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base">SubmitProof</span>
                <p className="text-[11px] text-slate-400">Submit with Proof. Verify with Confidence.</p>
              </div>
            </div>

            {/* Network Specs Badge */}
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                Network: <strong className="text-white">Botchain Testnet</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                Chain ID: <strong className="text-blue-400">{BOTCHAIN_CHAIN_ID}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                Token: <strong className="text-emerald-400">BOT</strong> ({BOTCHAIN_TOTAL_SUPPLY})
              </span>
              <a
                href={BOTCHAIN_EXPLORER_URL}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 flex items-center gap-1 transition-colors"
              >
                Explorer: scan.bohr.life <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="border-t border-slate-900/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <p>
              Privacy Notice: SubmitProof calculates cryptographic SHA-256 fingerprints in the browser. 
              The original document is never uploaded to any blockchain or centralized server.
            </p>
            <div className="flex items-center gap-4">
              <span>Smart Contract: AssignmentSubmissionRegistry.sol</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;

