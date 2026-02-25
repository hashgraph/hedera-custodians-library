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

import {
  Fireblocks,
  TransactionOperation,
  TransferPeerPathType,
  CreateTransactionResponse,
  TransactionResponse,
} from '@fireblocks/ts-sdk';
import {
  ISignatureStrategy,
  FireblocksConfig,
  SignatureRequest,
  hexStringToUint8Array,
} from '../../../src';

const MAX_RETRIES = 10;
const POLL_INTERVAL = 1000;
const COMPLETED_STATUS = 'COMPLETED';
const FAILED_STATUS = 'FAILED';

/**
 * Represents a signature strategy using the Fireblocks SDK.
 */
export class FireblocksStrategy implements ISignatureStrategy {
  private fireblocks: Fireblocks;
  private config: FireblocksConfig;

  /**
   * Constructs a new instance of the FireblocksStrategy class.
   * @param strategyConfig The configuration for the Fireblocks strategy.
   */
  constructor(strategyConfig: FireblocksConfig) {
    this.fireblocks = new Fireblocks({
      apiKey: strategyConfig.apiKey,
      secretKey: strategyConfig.apiSecretKey,
      basePath: strategyConfig.baseUrl,
    });
    this.config = strategyConfig;
  }

  /**
   * Signs a signature request using the Fireblocks SDK.
   * @param request The signature request to sign.
   * @returns A promise that resolves to the signature as a Uint8Array.
   */
  async sign(request: SignatureRequest): Promise<Uint8Array> {
    const serializedTransaction = Buffer.from(
      request.getTransactionBytes()
    ).toString('hex');
    const signatureHex = await this.signMessage(serializedTransaction);
    return hexStringToUint8Array({ hexString: signatureHex });
  }

  /**
   * Signs a message using the Fireblocks SDK.
   * @param message The message to sign.
   * @returns A promise that resolves to the signature as a string.
   */
  private async signMessage(message: string): Promise<string> {
    const response = await this.createFireblocksTransaction(message);
    if (!response.id) {
      throw new Error('Transaction ID not returned from Fireblocks.');
    }
    const txInfo = await this.pollTransaction(response.id);
    if (!txInfo.signedMessages || txInfo.signedMessages.length === 0) {
      throw new Error('No signature found in transaction response.');
    }

    const signature = txInfo.signedMessages[0].signature;
    if (!signature?.fullSig) {
      throw new Error('Full signature not found in transaction response.');
    }
    return signature.fullSig;
  }

  /**
   * Polls a Fireblocks transaction until it is completed or failed.
   * @param transactionId The ID of the transaction to poll.
   * @returns A promise that resolves to the transaction response.
   * @throws An error if the transaction does not complete within the expected time frame.
   */
  private async pollTransaction(
    transactionId: string
  ): Promise<TransactionResponse> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await this.fireblocks.transactions.getTransaction({
          txId: transactionId,
        });
        const txInfo = response.data;
        if (
          txInfo.status === COMPLETED_STATUS ||
          txInfo.status === FAILED_STATUS
        ) {
          return txInfo;
        }
      } catch (err) {
        console.error(`❌ Error polling transaction ${transactionId}:`, err);
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
    throw new Error(
      `Transaction ${transactionId} did not complete within the expected time frame.`
    );
  }

  /**
   * Creates a Fireblocks transaction for signing a message.
   * @param message The message to include in the transaction.
   * @returns A promise that resolves to the created transaction response.
   */
  private async createFireblocksTransaction(
    message: string
  ): Promise<CreateTransactionResponse> {
    const response = await this.fireblocks.transactions.createTransaction({
      transactionRequest: {
        operation: TransactionOperation.Raw,
        assetId: this.config.assetId,
        source: {
          type: TransferPeerPathType.VaultAccount,
          id: this.config.vaultAccountId,
        },
        extraParameters: {
          rawMessageData: { messages: [{ content: message }] },
        },
      },
    });
    return response.data;
  }
}
