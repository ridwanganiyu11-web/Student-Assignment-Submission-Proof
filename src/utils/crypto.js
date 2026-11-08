/**
 * Calculates SHA-256 hash of a file or ArrayBuffer in the browser using Web Crypto API.
 * The file is NEVER uploaded anywhere - computation happens 100% locally.
 * 
 * @param {File|Blob|ArrayBuffer} fileOrBuffer 
 * @param {function} [onProgress] Optional progress callback
 * @returns {Promise<{ hexHash: string, bytes32Hash: string, sizeBytes: number }>}
 */
export async function calculateFileHash(fileOrBuffer, onProgress) {
  let buffer;

  if (fileOrBuffer instanceof ArrayBuffer) {
    buffer = fileOrBuffer;
  } else if (fileOrBuffer instanceof Blob || fileOrBuffer instanceof File) {
    if (onProgress) onProgress(30);
    buffer = await fileOrBuffer.arrayBuffer();
    if (onProgress) onProgress(70);
  } else {
    throw new Error('Unsupported input type for hash calculation');
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const bytes32Hash = '0x' + hexHash;

  if (onProgress) onProgress(100);

  return {
    hexHash,
    bytes32Hash,
    sizeBytes: buffer.byteLength,
  };
}

/**
 * Truncates an Ethereum address or hash for UI display
 */
export function formatAddress(address, chars = 4) {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Truncates a SHA-256 hash
 */
export function formatHash(hash, leading = 8, trailing = 8) {
  if (!hash) return '';
  const clean = hash.startsWith('0x') ? hash : '0x' + hash;
  if (clean.length <= leading + trailing + 2) return clean;
  return `${clean.slice(0, leading + 2)}...${clean.slice(-trailing)}`;
}

/**
 * Formats a submission ID into a standard academic proof reference, e.g. "SP-000125"
 */
export function formatProofId(id) {
  if (!id && id !== 0) return 'SP-000000';
  const num = typeof id === 'bigint' ? Number(id) : parseInt(id, 10);
  return `SP-${num.toString().padStart(6, '0')}`;
}

/**
 * Formats unix timestamp to readable string
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return 'N/A';
  const millis = typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : (timestamp > 1e11 ? timestamp : timestamp * 1000);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(millis));
}

/**
 * Compares submission timestamp against deadline
 */
export function compareDeadline(submissionTimestamp, deadlineTimestamp) {
  if (!deadlineTimestamp || Number(deadlineTimestamp) === 0) {
    return { hasDeadline: false, isLate: false, diffText: 'No deadline set' };
  }

  const sub = typeof submissionTimestamp === 'bigint' ? Number(submissionTimestamp) : Number(submissionTimestamp);
  const dead = typeof deadlineTimestamp === 'bigint' ? Number(deadlineTimestamp) : Number(deadlineTimestamp);

  const subSec = sub > 1e11 ? Math.floor(sub / 1000) : sub;
  const deadSec = dead > 1e11 ? Math.floor(dead / 1000) : dead;

  const diffSeconds = deadSec - subSec;

  if (diffSeconds >= 0) {
    const hours = Math.floor(diffSeconds / 3600);
    const mins = Math.floor((diffSeconds % 3600) / 60);
    const days = Math.floor(hours / 24);

    let text = '';
    if (days > 0) {
      text = `${days} day${days > 1 ? 's' : ''} ${hours % 24} hr before deadline`;
    } else if (hours > 0) {
      text = `${hours} hr ${mins} min before deadline`;
    } else {
      text = `${mins} min before deadline`;
    }

    return {
      hasDeadline: true,
      isLate: false,
      diffText: text,
      status: 'On-Time',
    };
  } else {
    const lateSec = Math.abs(diffSeconds);
    const hours = Math.floor(lateSec / 3600);
    const mins = Math.floor((lateSec % 3600) / 60);
    const days = Math.floor(hours / 24);

    let text = '';
    if (days > 0) {
      text = `${days} day${days > 1 ? 's' : ''} ${hours % 24} hr after deadline`;
    } else if (hours > 0) {
      text = `${hours} hr ${mins} min after deadline`;
    } else {
      text = `${mins} min after deadline`;
    }

    return {
      hasDeadline: true,
      isLate: true,
      diffText: text,
      status: 'Late Submission',
    };
  }
}

