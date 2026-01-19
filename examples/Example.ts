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
  AWSKMSConfig,
  CustodialWalletService,
  DFNSConfig,
  FireblocksConfig,
  SignatureRequest,
} from '../src';
import {
  Client,
  AccountCreateTransaction,
  Hbar,
  AccountId,
  TransactionReceipt,
  TransactionResponse,
  Key,
  PublicKey,
  PrivateKey,
} from '@hiero-ledger/sdk';
import nacl from 'tweetnacl';
import ExampleConfig from './ExampleConfig';

export default class Example {
  config: ExampleConfig;
  service: CustodialWalletService;
  client: Client;

  constructor(config: ExampleConfig);
  constructor(
    config: FireblocksConfig | DFNSConfig | AWSKMSConfig,
    hederaAccountId: AccountId | string,
    publicKey: PublicKey | string
  );
  constructor(
    config: ExampleConfig | FireblocksConfig | DFNSConfig | AWSKMSConfig,
    hederaAccountId?: AccountId | string,
    publicKey?: PublicKey | string
  ) {
    if (config instanceof ExampleConfig) {
      this.config = config;
    } else {
      if (!hederaAccountId || !publicKey) {
        throw new Error('❌ Missing Hedera account ID or public key');
      }
      this.config = new ExampleConfig(config, hederaAccountId, publicKey);
    }
    const { serviceSpecificConfig } = this.config;
    this.service = new CustodialWalletService(serviceSpecificConfig);
    this.client = Client.forTestnet().setOperatorWith(
      this.config.hederaAccountId,
      this.config.publicKey,
      this.signTransactionHandler
    );
  }

  /**
   * Handles signing a transaction.
   *
   * @param message - The message to be signed.
   * @returns The signed message.
   */
  protected readonly signTransactionHandler = async (
    message: Uint8Array
  ): Promise<Uint8Array> => {
    const signatureRequest = new SignatureRequest(message);
    return await this.service.signTransaction(signatureRequest);
  };

  /**
   * Creates a new account with an optional account key.
   * @param newAccountKey The account key for the new account (optional).
   * @returns An object containing the new account ID, transaction response, and transaction receipt.
   */
  public async createAccount({
    newAccountKey,
  }: { newAccountKey?: Key } = {}): Promise<{
    newAccountId: AccountId;
    response: TransactionResponse;
    receipt: TransactionReceipt;
  }> {
    return this._createAccount({ newAccountKey });
  }

  /**
   * Creates a new Hedera account.
   * @param newAccountKey The key for the new account (optional).
   * @returns An object containing the new account ID, transaction response, and transaction receipt.
   * @throws Error if there is an error creating the new Hedera account.
   */
  protected async _createAccount({
    newAccountKey,
  }: { newAccountKey?: Key } = {}): Promise<{
    newAccountId: AccountId;
    response: TransactionResponse;
    receipt: TransactionReceipt;
  }> {
    console.log('🔑 Creating new Hedera Account...');
    // Submit a transaction to your local node
    const newAccountTx = new AccountCreateTransaction()
      .setKey(newAccountKey || this.config.publicKey)
      .setInitialBalance(new Hbar(5));
    // Execute the transaction
    const newAccountResponse = await newAccountTx.execute(this.client);
    // Get receipt
    const newAccountReceipt = await newAccountResponse.getReceipt(this.client);
    // Get the account ID
    const newAccountId = newAccountReceipt.accountId;
    if (!newAccountId) {
      throw new Error('❌ Error creating new Hedera Account');
    }
    console.log(
      '✅ New account ID Created: ',
      newAccountId.toString(),
      `(https://hashscan.io/testnet/account/${newAccountId.toString()})`
    );
    console.log(
      '⛓️  Transaction Hash: ',
      Buffer.from(newAccountResponse.transactionHash).toString('hex')
    );
    return {
      newAccountId: newAccountId,
      response: newAccountResponse,
      receipt: newAccountReceipt,
    };
  }

  /**
   * Creates a key pair for cryptographic operations.
   * @param type The type of key pair to create. Defaults to 'ed25519'.
   * @returns An object containing the private and public keys.
   * @throws Error if an invalid key type is provided.
   */
  protected async _createKeyPair({
    type = 'ed25519',
  }: { type?: string } = {}): Promise<{
    privateKey: PrivateKey;
    publicKey: PublicKey;
  }> {
    let keyPair;
    switch (type) {
      case 'ed25519':
        keyPair = nacl.sign.keyPair();
        return {
          privateKey: PrivateKey.fromBytesED25519(keyPair.secretKey),
          publicKey: PublicKey.fromBytes(keyPair.publicKey),
        };
      default:
        throw new Error('❌ Invalid key type');
    }
  }

  /**
   * Delays the execution for the specified number of milliseconds.
   * @param ms The number of milliseconds to delay.
   * @returns A promise that resolves after the specified delay.
   */
  protected async _delay({ ms }: { ms: number }): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
