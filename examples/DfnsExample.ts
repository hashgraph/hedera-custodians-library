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
    receipt: TransactionReceipt;
  }> {
    // Submit a transaction to your local node
    const newAccount = await new AccountCreateTransaction()
      .setKey(this.config.walletPublicKey)
      .setInitialBalance(new Hbar(1))
      .execute(this.client);

    // Get receipt
    const receipt = await newAccount.getReceipt(this.client);
    // console.log(receipt);

    // Get the account ID
    const newAccountId = receipt.accountId;
    if (!newAccountId) {
      throw new Error('❌ Error creating new Hedera Account');
    }
    console.log('✅ New account ID Created: ', newAccountId.toString());
    return { newAccountId: newAccountId, receipt: receipt };
  }

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
    const createTokenReceipt = await (
      await createTokenTx.execute(this.client)
    ).getReceipt(this.client);
    // Get the token ID
    const tokenId = createTokenReceipt.tokenId;
    if (!tokenId) {
      throw new Error('❌ Error creating new Hedera Token');
    }
    console.log('✅ New Token Created with ID: ', tokenId.toString());
  }
}
