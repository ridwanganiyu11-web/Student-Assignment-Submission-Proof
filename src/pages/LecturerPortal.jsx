import React, { useState } from 'react';
import { 
  GraduationCap, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { getLocalAssignments, getLocalSubmissions } from '../utils/storage';
import { formatProofId, formatDateTime, formatAddress, compareDeadline } from '../utils/crypto';
import { BOTCHAIN_CHAIN_ID } from '../config/chain';
import { useSubmitProofContract } from '../hooks/useSubmitProofContract';

export function LecturerPortal({ setActiveTab, onSelectProof }) {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { createAssignment } = useSubmitProofContract();

  const [assignments, setAssignments] = useState(getLocalAssignments());
  const submissions = getLocalSubmissions();

  // Create form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Selected assignment to view submissions
  const [activeAssignmentId, setActiveAssignmentId] = useState(assignments[0]?.id || 1);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title || !courseCode || !deadline) return;

    setIsPublishing(true);
    try {
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
      const newAss = saveLocalAssignment({
        lecturer: address || '0x3A52c81B0992De1304C7491C7924F0e8B27bA91F',
        title,
        courseCode,
        description,
        deadline: deadlineTimestamp,
      });

      // Brief simulated confirmation
      await new Promise(r => setTimeout(r, 800));

      setAssignments(getLocalAssignments());
      setActiveAssignmentId(newAss.id);
      setShowCreateModal(false);
      setTitle('');
      setCourseCode('');
      setDescription('');
      setDeadline('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedAssignment = assignments.find(a => Number(a.id) === Number(activeAssignmentId));
  const assignmentSubmissions = submissions.filter(s => Number(s.assignmentId) === Number(activeAssignmentId));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
            <GraduationCap className="w-3.5 h-3.5" /> University Lecturer Hub
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Lecturer Assignment Portal</h1>
          <p className="text-sm text-slate-400">
            Publish coursework requirements with verifiable on-chain deadlines and inspect student proofs.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Publish New Assignment
        </button>
      </div>

      {/* Main Grid: Assignment List (Left) + Submissions Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Published Assignments */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Published Assignments</span>
            <span className="text-xs font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
              {assignments.length} total
            </span>
          </h2>

          <div className="space-y-3">
            {assignments.map((ass) => {
              const count = submissions.filter(s => Number(s.assignmentId) === Number(ass.id)).length;
              const isSelected = Number(activeAssignmentId) === Number(ass.id);

              return (
                <div
                  key={ass.id}
                  onClick={() => setActiveAssignmentId(ass.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-md'
                      : 'glass-card border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-semibold text-blue-400">
                        {ass.courseCode} · #{ass.id}
                      </span>
                      <h3 className="font-bold text-white text-sm mt-0.5">{ass.title}</h3>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-blue-400' : ''}`} />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatDateTime(ass.deadline)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <Users className="w-3 h-3 text-blue-400" />
                      {count} proofs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Submissions Inspector for Selected Assignment */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAssignment ? (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              
              {/* Assignment Overview Bar */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-900/40 text-blue-300 border border-blue-800">
                    {selectedAssignment.courseCode}
                  </span>
                  <span className="text-xs text-slate-400">
                    Published: {formatDateTime(selectedAssignment.createdAt)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">{selectedAssignment.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedAssignment.description}</p>
                <div className="flex items-center gap-2 mt-3 text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><strong>Hard Deadline:</strong> {formatDateTime(selectedAssignment.deadline)}</span>
                </div>
              </div>

              {/* Student Proofs Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Registered Student Submissions ({assignmentSubmissions.length})
                  </h3>
                </div>

                {assignmentSubmissions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-2">
                    <p className="text-sm text-slate-400">No student submissions registered for this assignment yet.</p>
                    <p className="text-xs text-slate-500">Students can submit proof against Assignment ID #{selectedAssignment.id}.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {assignmentSubmissions.map((sub) => {
                      const deadlineComp = compareDeadline(sub.timestamp, selectedAssignment.deadline);
                      return (
                        <div
                          key={sub.id}
                          className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-400">
                                {formatProofId(sub.id)}
                              </span>
                              <span className="text-xs text-slate-400">
                                {sub.fileName || 'Assignment File'}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                v{sub.version || 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                              <span>Student: <code className="text-slate-300">{formatAddress(sub.student)}</code></span>
                              <span>Timestamp: {formatDateTime(sub.timestamp)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            {deadlineComp.isLate ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-950/70 px-2.5 py-1 rounded-lg border border-red-900">
                                <AlertTriangle className="w-3 h-3" /> Late
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-900">
                                <CheckCircle2 className="w-3 h-3" /> On-Time
                              </span>
                            )}

                            <button
                              onClick={() => {
                                if (onSelectProof) onSelectProof(sub.id);
                                setActiveTab('verify');
                              }}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              Verify File
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl text-center text-slate-400">
              Select an assignment to view its student submission proofs.
            </div>
          )}
        </div>

      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                Publish Course Assignment
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Paper"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS-480"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Official Deadline *</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Description / Rubric</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instructions for students (e.g. submit PDF containing code benchmarks and security analysis)..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                >
                  {isPublishing ? 'Publishing on Botchain...' : 'Publish On-Chain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

