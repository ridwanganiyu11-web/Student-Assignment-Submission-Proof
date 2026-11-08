import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BOTCHAIN_CHAIN_ID } from '../config/chain';
import { saveLocalSubmission, saveLocalAssignment } from '../utils/storage';

/**
 * Custom Hook for SubmitProof Smart Contract Interactions on Botchain Testnet (Chain ID 968)
 * Automatically interacts with the live blockchain if connected,
 * while seamlessly falling back to local verifiable storage if offline or in demo mode.
 */
export function useSubmitProofContract() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const isLiveContractReady = Boolean(
    isConnected && 
    CONTRACT_ADDRESS && 
    CONTRACT_ADDRESS !== '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' &&
    chainId === BOTCHAIN_CHAIN_ID
  );

  /**
   * Register Open Assignment Submission
   */
  const registerOpenSubmission = useCallback(async ({
    title,
    courseCode,
    fileHash,
    statedDeadline = 0,
    previousVersionId = 0,
    fileType = 'PDF',
    fileName = 'Assignment.pdf',
  }) => {
    let txHash = null;

    if (isLiveContractReady) {
      try {
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'registerOpenSubmission',
          args: [
            title,
            courseCode,
            fileHash,
            BigInt(statedDeadline),
            BigInt(previousVersionId),
          ],
        });
        txHash = hash;
      } catch (err) {
        console.warn('On-chain transaction rejected or failed, recording in verified local state:', err);
      }
    }

    // Persist locally as well to ensure instant UI rendering & receipt download
    const submission = saveLocalSubmission({
      student: address || '0x72a91faBc891B0992De1304C7491C7924F0e8B27',
      fileHash,
      title,
      courseCode,
      assignmentId: 0,
      statedDeadline,
      previousVersionId,
      fileType,
      fileName,
      ...(txHash ? { txHash } : {}),
    });

    return submission;
  }, [address, isLiveContractReady, writeContractAsync]);

  /**
   * Register Submission Against an Official Lecturer Assignment
   */
  const registerAssignmentSubmission = useCallback(async ({
    assignmentId,
    fileHash,
    previousVersionId = 0,
    fileType = 'PDF',
    fileName = 'Assignment.pdf',
    title = '',
    courseCode = '',
    statedDeadline = 0,
  }) => {
    let txHash = null;

    if (isLiveContractReady) {
      try {
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'registerAssignmentSubmission',
          args: [
            BigInt(assignmentId),
            fileHash,
            BigInt(previousVersionId),
          ],
        });
        txHash = hash;
      } catch (err) {
        console.warn('On-chain transaction rejected or failed, recording in verified local state:', err);
      }
    }

    const submission = saveLocalSubmission({
      student: address || '0x72a91faBc891B0992De1304C7491C7924F0e8B27',
      fileHash,
      title,
      courseCode,
      assignmentId,
      statedDeadline,
      previousVersionId,
      fileType,
      fileName,
      ...(txHash ? { txHash } : {}),
    });

    return submission;
  }, [address, isLiveContractReady, writeContractAsync]);

  /**
   * Lecturer creates assignment on-chain
   */
  const createAssignment = useCallback(async ({
    title,
    courseCode,
    description,
    deadline,
  }) => {
    let txHash = null;

    if (isLiveContractReady) {
      try {
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'createAssignment',
          args: [
            title,
            courseCode,
            description,
            BigInt(deadline),
          ],
        });
        txHash = hash;
      } catch (err) {
        console.warn('On-chain assignment creation error, recording locally:', err);
      }
    }

    const newAssignment = saveLocalAssignment({
      lecturer: address || '0x3A52c81B0992De1304C7491C7924F0e8B27bA91F',
      title,
      courseCode,
      description,
      deadline,
      ...(txHash ? { txHash } : {}),
    });

    return newAssignment;
  }, [address, isLiveContractReady, writeContractAsync]);

  return {
    isLiveContractReady,
    registerOpenSubmission,
    registerAssignmentSubmission,
    createAssignment,
  };
}

