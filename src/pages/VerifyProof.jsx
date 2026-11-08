import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileCheck2, 
  Upload, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Download,
  FileText,
  User,
  Hash,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { calculateFileHash, formatProofId, formatDateTime, formatAddress, compareDeadline } from '../utils/crypto';
import { findSubmissionById, findSubmissionByHash, getLocalSubmissions } from '../utils/storage';
import { generateProofPDF } from '../utils/pdfGenerator';
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL } from '../config/chain';

export function VerifyProof({ initialProofId }) {
  const [searchQuery, setSearchQuery] = useState(initialProofId ? String(initialProofId) : '');
  const [currentSubmission, setCurrentSubmission] = useState(null);

  // File verification state
  const [verificationFile, setVerificationFile] = useState(null);
  const [calculatedHash, setCalculatedHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [hashResult, setHashResult] = useState(null); // 'match' | 'mismatch' | null

  // Quick lookup helper
  useEffect(() => {
    if (initialProofId) {
      loadSubmission(initialProofId);
    } else {
      // Default load sample SP-000125 if no ID provided
      loadSubmission('125');
    }
  }, [initialProofId]);

  const loadSubmission = (query) => {
    if (!query) return;
    const cleanId = String(query).trim();
    // Try by ID first
    let found = findSubmissionById(cleanId);
    // If not found, try by Hash
    if (!found) {
      found = findSubmissionByHash(cleanId);
    }
    setCurrentSubmission(found || null);
    // Reset file match status on query change
    setVerificationFile(null);
    setCalculatedHash('');
    setHashResult(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadSubmission(searchQuery);
  };

  // Drag & drop or select file to verify against current submission
  const handleVerifyFile = async (file) => {
    if (!file) return;
    setVerificationFile(file);
    setIsHashing(true);
    setHashResult(null);

    try {
      const res = await calculateFileHash(file);
      setCalculatedHash(res.bytes32Hash);

      if (currentSubmission) {
        const expected = (currentSubmission.fileHash || '').toLowerCase();
        const computed = res.bytes32Hash.toLowerCase();
        if (expected === computed) {
          setHashResult('match');
        } else {
          setHashResult('mismatch');
        }
      } else {
        // If no submission loaded yet, see if this file matches ANY registered submission!
        const found = findSubmissionByHash(res.bytes32Hash);
        if (found) {
          setCurrentSubmission(found);
          setHashResult('match');
        } else {
          setHashResult('not_found');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsHashing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Public Assignment Verification
        </div>
        <h1 className="text-3xl font-extrabold text-white">Verify Submission Proof</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Lecturers and evaluators can verify exact file authenticity without gas, wallet connection, or document exposure.
        </p>
      </div>

      {/* Proof Search Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Proof ID (e.g. SP-000125 or 125) or Hash..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-xl"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Find Proof
          </button>
        </div>
      </form>

      {currentSubmission ? (
        <div className="space-y-6">
          
          {/* File Verification Drop Zone (Check received file against registered proof) */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-400" />
                  Drop Received Assignment File to Verify
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your browser will compute the file's SHA-256 fingerprint and compare it to the blockchain record.
                </p>
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleVerifyFile(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-all"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = (e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleVerifyFile(e.target.files[0]);
                  }
                };
                input.click();
              }}
            >
              <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="font-semibold text-white text-sm">
                {verificationFile ? verificationFile.name : 'Click to select or drop student file here to compare'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Any modification of even a single character will alter the fingerprint.
              </p>
            </div>

            {/* Verification Result Banner */}
            {isHashing && (
              <div className="p-4 bg-slate-900 rounded-xl text-center text-xs text-slate-300 animate-pulse">
                Computing SHA-256 fingerprint for comparison...
              </div>
            )}

            {hashResult === 'match' && (
              <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 glow-green space-y-2">
                <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <span>Assignment Verification: Exact Match</span>
                </div>
                <p className="text-xs text-emerald-200 pl-8 leading-relaxed">
                  <strong>File fingerprint matches!</strong> The uploaded file has the exact same SHA-256 digital fingerprint as the one registered on Botchain Testnet. The document has not been altered since timestamping.
                </p>
                <div className="pl-8 pt-1 font-mono text-[11px] text-emerald-300 break-all">
                  SHA-256: {calculatedHash}
                </div>
              </div>
            )}

            {hashResult === 'mismatch' && (
              <div className="p-5 rounded-2xl bg-red-950/60 border border-red-500/50 space-y-2">
                <div className="flex items-center gap-2.5 text-red-400 font-bold text-base">
                  <XCircle className="w-6 h-6 shrink-0" />
                  <span>Assignment Verification: Fingerprint Mismatch</span>
                </div>
                <p className="text-xs text-red-200 pl-8 leading-relaxed">
                  <strong>Verification failed.</strong> The file you uploaded does NOT have the same digital fingerprint as the registered submission. It has been edited, saved differently, or is a different document.
                </p>
                <div className="pl-8 pt-1 text-[11px] text-red-300 space-y-1">
                  <div className="font-mono break-all">Uploaded: {calculatedHash}</div>
                  <div className="font-mono break-all text-slate-400">Registered: {currentSubmission.fileHash}</div>
                </div>
              </div>
            )}
          </div>

          {/* Registered Blockchain Submission Card (Matching prompt interface) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-900">
                    {formatProofId(currentSubmission.id)}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                    Registered Proof
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">{currentSubmission.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentSubmission.courseCode} · {currentSubmission.fileType || 'PDF'} · Version {currentSubmission.version || 1}
                </p>
              </div>

              {/* Deadline Comparison Badge */}
              <div>
                {(() => {
                  const check = compareDeadline(currentSubmission.timestamp, currentSubmission.statedDeadline);
                  if (!check.hasDeadline) {
                    return (
                      <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                        Open Submission (No Deadline)
                      </span>
                    );
                  }
                  return check.isLate ? (
                    <div className="flex items-center gap-1.5 text-xs text-red-300 bg-red-950/80 px-3 py-2 rounded-xl border border-red-800">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <div>
                        <div className="font-bold">Late Submission</div>
                        <div className="text-[10px] text-red-400">{check.diffText}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold">Submitted On-Time</div>
                        <div className="text-[10px] text-emerald-400">{check.diffText}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Student Wallet Address</span>
                <span className="font-mono text-white font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  {currentSubmission.student}
                </span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Blockchain Registration Date</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {formatDateTime(currentSubmission.timestamp)}
                </span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Target Network</span>
                <span className="text-white font-medium">
                  Botchain Testnet (Chain ID {BOTCHAIN_CHAIN_ID})
                </span>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Transaction Hash</span>
                <a
                  href={`${BOTCHAIN_EXPLORER_URL}/tx/${currentSubmission.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  {formatAddress(currentSubmission.txHash, 8)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="sm:col-span-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-xs text-slate-400 block">Registered File SHA-256 Fingerprint:</span>
                <span className="font-mono text-xs text-blue-300 break-all bg-slate-950 p-2.5 rounded-lg block border border-slate-800">
                  {currentSubmission.fileHash}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => generateProofPDF(currentSubmission)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                Download Verifiable PDF Certificate
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Verification link copied to clipboard!');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Copy Public Verification URL
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Not found banner */
        <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Registered Proof Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We couldn't locate a submission matching "{searchQuery}". Please check the Proof ID or upload the assignment document above.
          </p>
        </div>
      )}

    </div>
  );
}

