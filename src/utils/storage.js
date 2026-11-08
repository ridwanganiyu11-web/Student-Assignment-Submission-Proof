/**
 * Hybrid Storage & Mock Service for SubmitProof
 * Ensures that all features (Proof generation, SHA-256 validation, Lecturer assignments,
 * PDF receipts, QR codes) can be seamlessly demonstrated both on-chain and locally.
 */

const STORAGE_KEY_SUBMISSIONS = 'submitproof_submissions_v1';
const STORAGE_KEY_ASSIGNMENTS = 'submitproof_assignments_v1';

// Seed initial illustrative data as highlighted in the project specification
const INITIAL_ASSIGNMENTS = [
  {
    id: 1,
    lecturer: '0x3A52c81B0992De1304C7491C7924F0e8B27bA91F',
    title: 'Introduction to Computer Science',
    courseCode: 'CS-101',
    description: 'Final submission for Module 1: Algorithms and Data Structures analysis.',
    deadline: Math.floor(Date.now() / 1000) + 86400 * 4, // 4 days from now
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
    isActive: true,
  },
  {
    id: 2,
    lecturer: '0x8b321F55C992Ae74901C7924F0e8B27bA91FaBc',
    title: 'Database Management Systems',
    courseCode: 'CS-304',
    description: 'Relational Database Schema Design and Normalization Documentation.',
    deadline: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
    isActive: true,
  },
  {
    id: 3,
    lecturer: '0x9E758a6E45E20F7604B0971b3152dFa28aE38676',
    title: 'Distributed Systems & Blockchain',
    courseCode: 'CS-480',
    description: 'Consensus mechanisms paper and smart contract security audit.',
    deadline: Math.floor(Date.now() / 1000) - 86400 * 1, // Past deadline (for testing late check)
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
    isActive: true,
  }
];

const INITIAL_SUBMISSIONS = [
  {
    id: 125,
    student: '0x72a91faBc891B0992De1304C7491C7924F0e8B27',
    fileHash: '0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    title: 'Introduction to Computer Science',
    courseCode: 'CS-101',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
    assignmentId: 1,
    statedDeadline: Math.floor(Date.now() / 1000) + 86400 * 4,
    previousVersionId: 0,
    version: 1,
    fileType: 'PDF',
    fileName: 'CS101_Assignment_01_Final.pdf',
    txHash: '0x4fbc681b9e28d405291cfb543e26bb015a3bf4f1b2b0b822cd15d6c15b0f00c1'
  },
  {
    id: 126,
    student: '0x72a91faBc891B0992De1304C7491C7924F0e8B27',
    fileHash: '0x5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    title: 'Database Management',
    courseCode: 'CS-304',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 1, // 1 day ago
    assignmentId: 2,
    statedDeadline: Math.floor(Date.now() / 1000) + 86400 * 7,
    previousVersionId: 0,
    version: 1,
    fileType: 'DOCX',
    fileName: 'CS304_DB_Design_Assignment02.docx',
    txHash: '0x81b9e28d405291cfb543e26bb015a3bf4f1b2b0b822cd15d6c15b0f00c14fbc6'
  }
];

export function getLocalAssignments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
      return INITIAL_ASSIGNMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_ASSIGNMENTS;
  }
}

export function saveLocalAssignment(assignment) {
  const all = getLocalAssignments();
  const nextId = all.length > 0 ? Math.max(...all.map(a => Number(a.id))) + 1 : 1;
  const newAssignment = {
    id: nextId,
    createdAt: Math.floor(Date.now() / 1000),
    isActive: true,
    ...assignment,
  };
  all.push(newAssignment);
  localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(all));
  return newAssignment;
}

export function getLocalSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SUBMISSIONS;
  }
}

export function saveLocalSubmission(submission) {
  const all = getLocalSubmissions();
  const nextId = all.length > 0 ? Math.max(...all.map(s => Number(s.id))) + 1 : 127;
  
  // Calculate version number based on previous version if any
  let version = 1;
  if (submission.previousVersionId && Number(submission.previousVersionId) > 0) {
    const prev = all.find(s => Number(s.id) === Number(submission.previousVersionId));
    if (prev) {
      version = (prev.version || 1) + 1;
    }
  }

  const newSub = {
    id: nextId,
    timestamp: Math.floor(Date.now() / 1000),
    version,
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    ...submission,
  };

  all.unshift(newSub);
  localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(all));
  return newSub;
}

export function findSubmissionById(id) {
  const all = getLocalSubmissions();
  const cleanId = String(id).replace(/[^0-9]/g, '');
  return all.find(s => Number(s.id) === Number(cleanId)) || null;
}

export function findSubmissionByHash(fileHash) {
  if (!fileHash) return null;
  const all = getLocalSubmissions();
  const clean = fileHash.toLowerCase().startsWith('0x') ? fileHash.toLowerCase() : '0x' + fileHash.toLowerCase();
  return all.find(s => (s.fileHash || '').toLowerCase() === clean) || null;
}

