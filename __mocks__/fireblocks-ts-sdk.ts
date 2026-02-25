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

// Mock TransactionStatus enum to avoid importing from actual module
export const TransactionStatus = {
  Submitted: 'SUBMITTED',
  Queued: 'QUEUED',
  PendingSignature: 'PENDING_SIGNATURE',
  PendingAuthorization: 'PENDING_AUTHORIZATION',
  Broadcasting: 'BROADCASTING',
  Confirming: 'CONFIRMING',
  Completed: 'COMPLETED',
  Cancelled: 'CANCELLED',
  Rejected: 'REJECTED',
  Blocked: 'BLOCKED',
  Failed: 'FAILED',
} as const;

// Mock TransactionOperation enum
export const TransactionOperation = {
  Transfer: 'TRANSFER',
  Burn: 'BURN',
  ContractCall: 'CONTRACT_CALL',
  ProgramCall: 'PROGRAM_CALL',
  Mint: 'MINT',
  Raw: 'RAW',
  TypedMessage: 'TYPED_MESSAGE',
  Approve: 'APPROVE',
  EnableAsset: 'ENABLE_ASSET',
} as const;

// Mock TransferPeerPathType enum
export const TransferPeerPathType = {
  VaultAccount: 'VAULT_ACCOUNT',
  ExchangeAccount: 'EXCHANGE_ACCOUNT',
  InternalWallet: 'INTERNAL_WALLET',
  ExternalWallet: 'EXTERNAL_WALLET',
  Contract: 'CONTRACT',
  NetworkConnection: 'NETWORK_CONNECTION',
  FiatAccount: 'FIAT_ACCOUNT',
  Compound: 'COMPOUND',
  GasStation: 'GAS_STATION',
  OneTimeAddress: 'ONE_TIME_ADDRESS',
  Unknown: 'UNKNOWN',
  EndUserWallet: 'END_USER_WALLET',
  ProgramCall: 'PROGRAM_CALL',
  MultiDestination: 'MULTI_DESTINATION',
  OecPartner: 'OEC_PARTNER',
} as const;

export const mockFireblocksSignatureResponse = {
  id: 'transaction-id',
  status: TransactionStatus.Completed,
  signedMessages: [{ signature: { fullSig: 'signature-string' } }],
};

export const mockTransactionsApi = {
  createTransaction: jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ data: mockFireblocksSignatureResponse })
    ),
  getTransaction: jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ data: mockFireblocksSignatureResponse })
    ),
};

export const Fireblocks = jest.fn().mockImplementation(() => ({
  transactions: mockTransactionsApi,
}));
