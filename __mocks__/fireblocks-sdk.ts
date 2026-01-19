/*
 *
 * Hedera Custodians Integration
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// Mock Fireblocks enums
export const TransactionStatus = {
  SUBMITTED: 'SUBMITTED',
  QUEUED: 'QUEUED',
  PENDING_SIGNATURE: 'PENDING_SIGNATURE',
  PENDING_AUTHORIZATION: 'PENDING_AUTHORIZATION',
  PENDING_3RD_PARTY_MANUAL_APPROVAL: 'PENDING_3RD_PARTY_MANUAL_APPROVAL',
  PENDING_3RD_PARTY: 'PENDING_3RD_PARTY',
  BROADCASTING: 'BROADCASTING',
  CONFIRMING: 'CONFIRMING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  BLOCKED: 'BLOCKED',
  FAILED: 'FAILED',
} as const;

export const TransactionOperation = {
  RAW: 'RAW',
  TRANSFER: 'TRANSFER',
  CONTRACT_CALL: 'CONTRACT_CALL',
} as const;

export const PeerType = {
  VAULT_ACCOUNT: 'VAULT_ACCOUNT',
  EXCHANGE_ACCOUNT: 'EXCHANGE_ACCOUNT',
  INTERNAL_WALLET: 'INTERNAL_WALLET',
  EXTERNAL_WALLET: 'EXTERNAL_WALLET',
} as const;

export const mockFireblocksSignatureResponse = {
  status: TransactionStatus.COMPLETED,
  id: 'transaction-id',
  signedMessages: [{ signature: { fullSig: 'signature-string' } }],
};

export const FireblocksSDK = jest.fn().mockImplementation(() => ({
  createTransaction: jest
    .fn()
    .mockResolvedValue(mockFireblocksSignatureResponse),
  getTransactionById: jest
    .fn()
    .mockResolvedValue(mockFireblocksSignatureResponse),
}));
