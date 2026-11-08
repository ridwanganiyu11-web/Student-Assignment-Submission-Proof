import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCheck,
  FileText,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  Download,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { calculateFileHash, formatProofId, formatHash, formatAddress, formatDateTime } from '../utils/crypto';
import { getLocalAssignments, getLocalSubmissions } from '../utils/storage';
import { generateProofPDF } from '../utils/pdfGenerator';
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL } from '../config/chain';
import { useSubmitProofContract } from '../hooks/useSubmitProofContract';

export function SubmitAssignment({ setActiveTab, onSelectProof }) {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { registerOpenSubmission, registerAssignmentSubmission, isLiveContractReady } = useSubmitProofContract();

  const assignments = getLocalAssignments();
  const existingSubmissions = getLocalSubmissions();

  // Form states
  const [mode, setMode] = useState('lecturer'); // 'lecturer' or 'open'
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || 1);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [statedDeadline, setStatedDeadline] = useState('');
  const [isRevision, setIsRevision] = useState(false);
  const [previousVersionId, setPreviousVersionId] = useState('');

  // File states
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [bytes32Hash, setBytes32Hash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [hashProgress, setHashProgress] = useState(0);

  // Submission process states
  const [submitting, setSubmitting] = useState(false);
  const [submittedProof, setSubmittedProof] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  // File change handler
  const handleFileChange = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setIsHashing(true);
    setHashProgress(10);
    setErrorMsg('');

    try {
      const res = await calculateFileHash(file, (p) => setHashProgress(p));
      setFileHash(res.hexHash);
      setBytes32Hash(res.bytes32Hash);
      // Auto fill title if empty
      if (!title && mode === 'open') {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(nameWithoutExt);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to calculate file fingerprint: ' + err.message);
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedFile || !fileHash) {
      setErrorMsg('Please select a file to calculate its fingerprint.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      let subTitle = title;
      let subCourse = courseCode;
      let subDeadline = statedDeadline ? Math.floor(new Date(statedDeadline).getTime() / 1000) : 0;
      let assId = 0;

      if (mode === 'lecturer') {
        const target = assignments.find(a => Number(a.id) === Number(selectedAssignmentId));
        if (!target) throw new Error('Selected assignment not found');
        subTitle = target.title;
        subCourse = target.courseCode;
        subDeadline = target.deadline;
        assId = target.id;
      }

      // Check revision
      const prevId = isRevision && previousVersionId ? Number(previousVersionId) : 0;

      // Extract file extension
      const fileExt = selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE';

      let newSubmission;
      if (mode === 'lecturer') {
        newSubmission = await registerAssignmentSubmission({
          assignmentId: assId,
          fileHash: bytes32Hash || ('0x' + fileHash),
          previousVersionId: prevId,
          fileType: fileExt,
          fileName: selectedFile.name,
          title: subTitle,
          courseCode: subCourse,
          statedDeadline: subDeadline,
        });
      } else {
        newSubmission = await registerOpenSubmission({
          title: subTitle,
          courseCode: subCourse,
          fileHash: bytes32Hash || ('0x' + fileHash),
          statedDeadline: subDeadline,
          previousVersionId: prevId,
          fileType: fileExt,
          fileName: selectedFile.name,
        });
      }

      setSubmittedProof(newSubmission);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error registering submission proof');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Title Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Register Assignment Proof</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Calculate the SHA-256 fingerprint of your assignment and timestamp it permanently on the Botchain blockchain.
        </p>
      </div>

      {submittedProof ? (
        /* Success Confirmation Card */
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 glow-green space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Proof Registered On-Chain</span>
              <h2 className="text-2xl font-bold text-white mt-0.5">Submission Confirmed!</h2>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Proof Reference</span>
              <span className="font-mono font-bold text-blue-400">{formatProofId(submittedProof.id)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Assignment Title</span>
              <span className="font-semibold text-white">{submittedProof.title}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Course Code</span>
              <span className="text-white">{submittedProof.courseCode}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Version</span>
              <span className="text-blue-300 font-semibold">v{submittedProof.version}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Block Timestamp</span>
              <span className="text-white">{formatDateTime(submittedProof.timestamp)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">SHA-256 File Fingerprint:</span>
              <span className="font-mono text-xs text-slate-300 break-all bg-slate-950 p-2 rounded-lg block border border-slate-800">
                {submittedProof.fileHash}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => generateProofPDF(submittedProof)}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Download Official PDF Receipt
            </button>
            <button
              onClick={() => {
                if (onSelectProof) onSelectProof(submittedProof.id);
                setActiveTab('verify');
              }}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all text-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Open Public Verification
            </button>
            <button
              onClick={() => {
                setSubmittedProof(null);
                setSelectedFile(null);
                setFileHash('');
              }}
              className="px-4 py-3 text-slate-400 hover:text-white text-sm"
            >
              Register Another File
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmitProof} className="space-y-6">

          {/* Submission Mode Selector (Option C) */}
          <div className="glass-panel p-2 rounded-2xl flex border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('lecturer')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'lecturer'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Layers className="w-4 h-4" />
              Lecturer-Published Assignment
            </button>
            <button
              type="button"
              onClick={() => setMode('open')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'open'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <FileText className="w-4 h-4" />
              Open / Independent Submission
            </button>
          </div>

          {/* Mode Details Section */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            {mode === 'lecturer' ? (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-white">
                  Select Lecturer Assignment:
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {assignments.map((ass) => (
                    <label
                      key={ass.id}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${Number(selectedAssignmentId) === Number(ass.id)
                          ? 'bg-blue-950/40 border-blue-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="assignmentSelect"
                          value={ass.id}
                          checked={Number(selectedAssignmentId) === Number(ass.id)}
                          onChange={() => setSelectedAssignmentId(ass.id)}
                          className="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{ass.title}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-800 font-mono">
                              {ass.courseCode}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{ass.description}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span>Deadline: {formatDateTime(ass.deadline)}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-500">ID: #{ass.id}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Introduction to Computer Science — Final Term Paper"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Course Code / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS-101"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Official Deadline (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={statedDeadline}
                    onChange={(e) => setStatedDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Version Revision Toggle */}
            <div className="pt-3 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={isRevision}
                  onChange={(e) => setIsRevision(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>This is a corrected/revised version of a previous submission</span>
              </label>

              {isRevision && (
                <div className="mt-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-xs text-slate-400">
                    Select previous submission to link revision:
                  </label>
                  <select
                    value={previousVersionId}
                    onChange={(e) => setPreviousVersionId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select previous submission --</option>
                    {existingSubmissions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {formatProofId(s.id)} — {s.title} (v{s.version || 1})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Drag & Drop File Upload Section */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Upload Assignment Document</h3>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${selectedFile
                  ? 'border-blue-500 bg-blue-950/20'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/60'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready for blockchain timestamping
                    </p>
                  </div>
                  <span className="inline-block text-xs text-blue-400 hover:underline">
                    Click to choose a different file
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Click to upload or drag & drop your assignment file
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports PDF, DOCX, ZIP, or code files. Document contents never leave your device.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Cryptographic SHA-256 Fingerprint Display */}
            {isHashing && (
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Calculating client-side SHA-256 fingerprint...</span>
                  <span>{hashProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${hashProgress}%` }}></div>
                </div>
              </div>
            )}

            {fileHash && !isHashing && (
              <div className="p-4 bg-slate-900/80 rounded-xl border border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SHA-256 Fingerprint Generated (Client-Side)
                  </span>
                  <span className="text-[10px] text-slate-400">Zero Server Exposure</span>
                </div>
                <p className="font-mono text-xs text-slate-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {bytes32Hash || ('0x' + fileHash)}
                </p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action button */}
          <div className="flex items-center justify-between pt-2">
            {!isConnected && (
              <p className="text-xs text-slate-400">
                Wallet not connected? Demo simulation will create a local verifiable proof.
              </p>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={!selectedFile || isHashing || submitting}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all ${!selectedFile || isHashing || submitting
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 transform active:scale-95'
                  }`}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Recording on Botchain (968)...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Register Submission Proof
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
}

