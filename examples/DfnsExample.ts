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

import { CustodialWalletService, SignatureRequest } from 'index';
import {
  Client,
  AccountCreateTransaction,
  TokenCreateTransaction,
  Hbar,
  AccountId,
  TransactionReceipt,
  TransactionResponse,
  AccountBalanceQuery,
  TransferTransaction,
} from '@hashgraph/sdk';
import DfnsExampleConfig from './DfnsExampleConfig';

export default class DfnsExample {
  config: DfnsExampleConfig;
  service: CustodialWalletService;
  client: Client;
  constructor(config: DfnsExampleConfig) {
    this.config = config;
    this.service = new CustodialWalletService(this.config);
    this.client = Client.forTestnet().setOperatorWith(
      this.config.walletHederaAccountId,
      this.config.walletPublicKey,
      async (message: Uint8Array): Promise<Uint8Array> => {
        const signatureRequest = new SignatureRequest(message);
        return await this.service.signTransaction(signatureRequest);
      },
    );
  }

  public async createAccount(): Promise<{
    newAccountId: AccountId;
    response: TransactionResponse;
    receipt: TransactionReceipt;
  }> {
    // Submit a transaction to your local node
    const newAccountTx = await new AccountCreateTransaction()
      .setKey(this.config.walletPublicKey)
      .setInitialBalance(new Hbar(1));
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
      `(https://hashscan.io/testnet/account/${newAccountId.toString()})`,
    );
    console.log(
      '⛓️ Transaction Hash: ',
      Buffer.from(newAccountResponse.transactionHash).toString('hex'),
    );
    return {
      newAccountId: newAccountId,
      response: newAccountResponse,
      receipt: newAccountReceipt,
    };
  }

  /**
   * Creates a new Hedera token.
   * @param tokenInfo - The information of the token to be created.
   * @returns An object containing the token ID, response, and receipt.
   * @throws An error if there is an issue creating the token.
   */
  public async createNewHederaToken(tokenInfo: {
    name: string;
    symbol: string;
    decimals: number;
  }) {
    // Create a new token
    const createTokenTx = new TokenCreateTransaction()
      .setTokenName(tokenInfo.name)
      .setTokenSymbol(tokenInfo.symbol)
      .setDecimals(tokenInfo.decimals)
      .setTreasuryAccountId(this.config.walletHederaAccountId)
      .setInitialSupply(50000)
      .setAdminKey(this.config.walletPublicKey)
      .setMaxTransactionFee(new Hbar(30)); // Change the default max transaction fee
    // Execute the transaction
    const createTokenResponse = await createTokenTx.execute(this.client);
    // Get receipt
    const createTokenReceipt = await createTokenResponse.getReceipt(
      this.client,
    );
    // Get the token ID
    const tokenId = createTokenReceipt.tokenId;
    if (!tokenId) {
      throw new Error('❌ Error creating new Hedera Token');
    }
    console.log('✅ New Token Created with ID: ', tokenId.toString());
    console.log(
      '⛓️ Transaction Hash: ',
      Buffer.from(createTokenResponse.transactionHash).toString('hex'),
    );
    return {
      tokenId: tokenId,
      response: createTokenResponse,
      receipt: createTokenReceipt,
    };
  }

  // public async interactWithErc20(tokenInfo: {
  //   name: string;
  //   symbol: string;
  //   decimals: number;
  // }) {
  //   const { newAccountId } =
  //     await this.createAccount();
  //   const { tokenId } =
  //     await this.createNewHederaToken(tokenInfo);

  //   //Create the transfer transaction
  //   const transaction = new TransferTransaction()
  //     .addTokenTransfer(tokenId, accountId1, -12.45)
  //     .addTokenTransfer(tokenId, accountId2, 12.45)
  //     .freezeWith(this.client);

  //   //Sign with the sender account private key
  //   const signTx = await transaction.sign(accountKey1);

  //   //Sign with the client operator private key and submit to a Hedera network
  //   const txResponse = await signTx.execute(client);

  //   //Request the receipt of the transaction
  //   const receipt = await txResponse.getReceipt(client);

  //   //Obtain the transaction consensus status
  //   const transactionStatus = receipt.status;

  //   console.log(
  //     'The transaction consensus status ' + transactionStatus.toString(),
  //   );
  // }
}
