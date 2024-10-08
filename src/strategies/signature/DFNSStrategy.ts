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

import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import { DfnsApiClient } from '@dfns/sdk';
import {
  SignatureKind,
  SignatureStatus,
} from '@dfns/sdk/codegen/datamodel/Wallets/index.js';
import {
  ISignatureStrategy,
  DFNSConfig,
  SignatureRequest,
  hexStringToUint8Array,
  calcKeccak256,
  uint8ArrayToHexString,
  ED25519_KEY_LENGTH,
} from '../../../src';

const sleep = (interval = 0): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, interval));
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_INTERVAL = 1000;

/**
 * Represents a signature strategy for DFNSStrategy.
 */
export class DFNSStrategy implements ISignatureStrategy {
  private readonly dfnsApiClient: DfnsApiClient;
  private readonly walletId: string;
  private readonly publicKey: string;

  /**
   * Creates an instance of DFNSStrategy.
   * @param strategyConfig - The configuration for the DFNSStrategy.
   */
  constructor(strategyConfig: DFNSConfig) {
    this.dfnsApiClient = this.createDfnsApiClient(strategyConfig);
    this.walletId = strategyConfig.walletId;
    this.publicKey = strategyConfig.publicKey;
  }

  /**
   * Creates a DfnsApiClient instance.
   * @param strategyConfig - The configuration for the DFNSStrategy.
   * @returns The created DfnsApiClient instance.
   */
  private createDfnsApiClient(strategyConfig: DFNSConfig): DfnsApiClient {
    const signer = new AsymmetricKeySigner({
      privateKey: strategyConfig.serviceAccountPrivateKey,
      credId: strategyConfig.serviceAccountCredentialId,
      appOrigin: strategyConfig.appOrigin,
    });

    return new DfnsApiClient({
      appId: strategyConfig.appId,
      authToken: strategyConfig.serviceAccountAuthToken,
      baseUrl: strategyConfig.baseUrl,
      signer,
    });
  }

  /**
   * Signs a signature request and returns the signature as a Uint8Array.
   * @param request The signature request to sign.
   * @returns A Promise that resolves to the signature as a Uint8Array.
   */
  async sign(request: SignatureRequest): Promise<Uint8Array> {
    let signedMessage;
    if (this.publicKey.length == ED25519_KEY_LENGTH) {
      const serializedTransaction = Buffer.from(
        request.getTransactionBytes()
      ).toString('hex');
      signedMessage = await this.signMessage(serializedTransaction);
    } else {
      const bytesToSignHash = calcKeccak256(request.getTransactionBytes());
      const bytesToSignHashHex = uint8ArrayToHexString(bytesToSignHash);
      signedMessage = await this.signHash(bytesToSignHashHex);
    }

    return hexStringToUint8Array({ hexString: signedMessage });
  }

  /**
   * Signs a message using the DFNSStrategy.
   * @param message - The message to be signed.
   * @returns A promise that resolves to the generated signature.
   */
  private async signMessage(message: string): Promise<string> {
    const response = await this.dfnsApiClient.wallets.generateSignature({
      walletId: this.walletId,
      body: { kind: SignatureKind.Message, message: `0x${message}` },
    });
    return this.waitForSignature(response.id);
  }

  /**
   * Signs a hash using the DFNSStrategy.
   * @param hash - The hash to be signed.
   * @returns A promise that resolves to the generated signature.
   */
  private async signHash(hash: string): Promise<string> {
    const response = await this.dfnsApiClient.wallets.generateSignature({
      walletId: this.walletId,
      body: { kind: SignatureKind.Hash, hash: hash },
    });

    return this.waitForSignature(response.id);
  }

  /**
   * Waits for a signature with the specified signatureId.
   * @param signatureId - The ID of the signature to wait for.
   * @returns A promise that resolves to the signature string.
   * @throws An error if the signature request fails.
   */
  private async waitForSignature(signatureId: string): Promise<string> {
    for (let retries = DEFAULT_MAX_RETRIES; retries > 0; retries--) {
      const response = await this.dfnsApiClient.wallets.getSignature({
        walletId: this.walletId,
        signatureId,
      });

      if (response.status === SignatureStatus.Signed && response.signature) {
        const signature = response.signature;
        const r = signature.r.substring(2);
        const s = signature.s.substring(2);
        return Buffer.from(r + s, 'hex').toString('hex');
      } else if (response.status === SignatureStatus.Failed) {
        break;
      }
      await sleep(DEFAULT_RETRY_INTERVAL);
    }
    throw new Error(`DFNS Signature request ${signatureId} failed.`);
  }
}
