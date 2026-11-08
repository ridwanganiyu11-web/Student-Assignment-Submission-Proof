import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { formatProofId, formatDateTime, formatHash, formatAddress, compareDeadline } from './crypto';
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL } from '../config/chain';

/**
 * Generates an official, verifiable Assignment Submission Proof PDF
 * @param {object} submission
 */
export async function generateProofPDF(submission) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const proofIdFormatted = formatProofId(submission.id);
  const verifyUrl = `${window.location.origin}/#/verify?id=${submission.id}`;

  // Generate QR code data URL
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code for PDF', err);
  }

  // --- PDF Header & Decorative Styling ---
  // Top header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent line
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 38, pageWidth, 2.5, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('SubmitProof', 20, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Submit with Proof. Verify with Confidence.', 20, 26);
  doc.text('Powered by Botchain Testnet (Chain ID 968)', 20, 32);

  // Badge Proof ID top right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(96, 165, 250); // blue-400
  doc.text(proofIdFormatted, pageWidth - 20, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('OFFICIAL SUBMISSION RECEIPT', pageWidth - 20, 28, { align: 'right' });

  // --- Body Section ---
  let y = 52;

  // Title Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(submission.title || 'Untitled Assignment', 20, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`Course: ${submission.courseCode || 'General'}  |  Version: v${submission.version || 1}`, 20, y);

  y += 12;

  // Status Banner Box
  const deadlineCheck = compareDeadline(submission.timestamp, submission.statedDeadline);
  const isLate = deadlineCheck.isLate;

  if (deadlineCheck.hasDeadline) {
    if (isLate) {
      doc.setFillColor(254, 242, 242); // red-50
      doc.setDrawColor(239, 68, 68); // red-500
      doc.roundedRect(20, y, pageWidth - 40, 14, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(185, 28, 28); // red-700
      doc.text('LATE SUBMISSION', 26, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(220, 38, 38);
      doc.text(deadlineCheck.diffText, 70, y + 9);
    } else {
      doc.setFillColor(240, 253, 244); // green-50
      doc.setDrawColor(34, 197, 94); // green-500
      doc.roundedRect(20, y, pageWidth - 40, 14, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(21, 128, 61); // green-700
      doc.text('ON-TIME SUBMISSION', 26, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(22, 101, 52);
      doc.text(deadlineCheck.diffText, 75, y + 9);
    }
    y += 20;
  }

  // Cryptographic Proof Grid
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(20, y, pageWidth - 40, 95, 3, 3, 'FD');

  const leftLabelX = 26;
  const leftValueX = 72;
  let rowY = y + 12;

  const addMetadataRow = (label, value, isCode = false) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), leftLabelX, rowY);

    if (isCode) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
    }
    doc.setTextColor(15, 23, 42);
    doc.text(String(value || 'N/A'), leftValueX, rowY);

    rowY += 10;
  };

  addMetadataRow('Proof Reference', proofIdFormatted);
  addMetadataRow('Registered At', formatDateTime(submission.timestamp));
  if (submission.statedDeadline) {
    addMetadataRow('Assignment Due', formatDateTime(submission.statedDeadline));
  }
  addMetadataRow('Student Wallet', submission.student || 'Anonymous / Local');
  addMetadataRow('Network', `Botchain Testnet (Chain ID ${BOTCHAIN_CHAIN_ID})`);
  addMetadataRow('Transaction Hash', formatHash(submission.txHash || 'Pending on-chain block', 12, 12), true);

  // File Fingerprint Box (Dedicated)
  rowY += 4;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(leftLabelX, rowY - 5, pageWidth - 52, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('SHA-256 DIGITAL FILE FINGERPRINT:', leftLabelX + 3, rowY);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const fullHash = submission.fileHash || '0x0000000000000000000000000000000000000000000000000000000000000000';
  doc.text(fullHash, leftLabelX + 3, rowY + 7);

  // QR Code & Verification Block
  y = rowY + 30;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(20, y, pageWidth - 40, 48, 3, 3, 'FD');

  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 26, y + 4, 40, 40);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Scan to Verify Authenticity', 72, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Lecturers and evaluators can verify this document by scanning the QR code', 72, y + 21);
  doc.text('or uploading the original file to compare its cryptographic fingerprint.', 72, y + 26);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text(verifyUrl.slice(0, 55), 72, y + 35);

  // Footer Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const disclaimer = 'Notice: SubmitProof cryptographically proves that this specific file fingerprint was registered at the stated block timestamp. It does not store or expose assignment file contents.';
  doc.text(disclaimer, pageWidth / 2, 282, { align: 'center', maxWidth: pageWidth - 40 });

  // Save the PDF
  doc.save(`SubmitProof_${proofIdFormatted}.pdf`);
}

