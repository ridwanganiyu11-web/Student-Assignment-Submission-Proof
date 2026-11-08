# SubmitProof

> **Submit with Proof. Verify with Confidence.**

SubmitProof is a blockchain-powered academic verification platform built for the **Botchain Testnet**. It enables students to cryptographically timestamp and register digital fingerprints of their assignment submissions on-chain.

If anyone later questions whether a student finished and submitted an exact file before a deadline, the student can share their public verification link or official PDF certificate with an embedded QR code.

---

## 🌐 Network Specifications (Botchain Testnet)

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain / Bohr Testnet |
| **Chain ID** | `968` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Native Token** | `BOT` |
| **Total Supply** | `150 Million BOT` |
| **Block Explorer** | [scan.bohr.life](https://scan.bohr.life/) |

---

## 💡 How It Works

1. **Client-Side SHA-256 Fingerprinting**:
   - The student selects their assignment file (`.pdf`, `.docx`, `.zip`, etc.).
   - The browser calculates the SHA-256 cryptographic digest in milliseconds using the native Web Crypto API.
   - **Crucial Privacy Guarantee**: The actual assignment file is **never uploaded** to any server or blockchain. Only the digital fingerprint, course code, title, and wallet timestamp are registered.

2. **Blockchain Registration**:
   - The student connects their wallet via Reown AppKit / Wagmi and approves the transaction.
   - The `AssignmentSubmissionRegistry` smart contract records the fingerprint and block timestamp.

3. **Public Assignment Verification (Zero Gas)**:
   - Lecturers and evaluators open the public verification link or scan the QR code.
   - They drop the received assignment file into the verification drop zone.
   - The browser computes the received file's hash and compares it directly against the registered on-chain fingerprint:
     - 🟢 **Exact Match**: Fingerprint is identical, proving the document has not been altered by even a single character.
     - 🔴 **Mismatch**: Document was modified or is different.
   - **Deadline Compliance**: Automatically compares the blockchain block timestamp against the deadline (*"Submitted on-time 2 days 4 hours before deadline"* or *"Late submission"*).
   - **No wallet or gas is needed for verification.**

---

## 🏛 Option C Architecture: Dual Submission System

SubmitProof supports **Option C (Both Modes)**:
1. **Mode 1: Open Submissions**:
   - Any student can register an assignment with custom titles, course codes, and optional self-reported deadlines.
   - Supports linked revisions (v1, v2, v3...) so earlier proofs remain immutable.
2. **Mode 2: Lecturer-Created Assignments**:
   - Lecturers publish official assignments on-chain with title, rubric, and hard deadlines.
   - Students submit proof against the specific Assignment ID.
   - The lecturer portal allows professors to view and verify all student submissions in one place.

---

## 📜 Smart Contract (`AssignmentSubmissionRegistry.sol`)

Located at [`contracts/AssignmentSubmissionRegistry.sol`](./contracts/AssignmentSubmissionRegistry.sol):
- `createAssignment(title, courseCode, description, deadline)`: Creates an official assignment.
- `registerOpenSubmission(title, courseCode, fileHash, statedDeadline, previousVersionId)`: Student open submission.
- `registerAssignmentSubmission(assignmentId, fileHash, previousVersionId)`: Student submission against an official assignment.
- `verifySubmission(submissionId, fileHash)`: Read-only check for exact match and deadline compliance.
- `getLatestSubmissionByHash(fileHash)`: Reverse-lookup proof by SHA-256 fingerprint.
- `getStudentSubmissions(student)`: Fetches submission history.
- `getAssignmentSubmissions(assignmentId)`: Fetches submissions for a lecturer's assignment.

---

## 🚀 Running SubmitProof Locally

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Start the Development Server
```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React
- **Web3 / Wallet**: `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi@2.x`, `viem`
- **Data Fetching**: `@tanstack/react-query`
- **Cryptography**: Web Crypto API (`crypto.subtle.digest('SHA-256')`)
- **Receipts & Verification**: `jspdf` & `qrcode` for downloadable PDF receipts with scannable QR verification.

