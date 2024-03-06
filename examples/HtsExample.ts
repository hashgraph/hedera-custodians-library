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
  AccountId,
  Hbar,
  PrivateKey,
  Status,
  TokenAssociateTransaction,
  TokenCreateTransaction,
  TokenId,
  TransactionReceipt,
  TransactionResponse,
  TransferTransaction,
} from '@hashgraph/sdk';
import Example from './Example';

/**
 * Represents an example class for interacting with Hedera Token Service (HTS).
 */
export default class HtsExample extends Example {
  /**
   * Creates a new Hedera token.
   * @param tokenInfo - The information of the token to be created.
   * @returns A promise that resolves with the created token.
   */
  public async createNewHederaToken({
    tokenInfo,
  }: {
    tokenInfo: {
      name: string;
      symbol: string;
      decimals: number;
      initSupply: number;
    };
  }): Promise<{
    tokenId: TokenId;
    response: TransactionResponse;
    receipt: TransactionReceipt;
  }> {
    return this._createNewHederaToken({ tokenInfo });
  }

  /**
   * Interacts with an Hedera token.
   *
   * @param tokenInfo - Information about the token.
   * @param tokenInfo.name - The name of the token.
   * @param tokenInfo.symbol - The symbol of the token.
   * @param tokenInfo.decimals - The number of decimal places for the token.
   * @param tokenInfo.initSupply - The initial supply of the token.
   */
  public async interactWithHederaToken({
    tokenInfo,
  }: {
    tokenInfo: {
      name: string;
      symbol: string;
      decimals: number;
      initSupply: number;
    };
  }): Promise<void> {
    // Create a new account key pair
    const { privateKey: newAccPrivKey } = await this._createKeyPair();
    const { newAccountId } = await this._createAccount({
      newAccountKey: newAccPrivKey,
    });
    const { tokenId } = await this._createNewHederaToken({ tokenInfo });
    await this._associateTokenWithAccount({
      account: newAccountId,
      privateKey: newAccPrivKey,
      tokenId,
    });

    const tokenBalancesBefore = await Promise.all([
      this._getTokenBalance({
        account: this.config.hederaAccountId,
        tokenId,
      }),
      this._getTokenBalance({ account: newAccountId, tokenId }),
    ]);
    await this._delay({ ms: 3000 });
    console.log('Balances before transfer:');
    console.log('    💶 Main account balance: ', tokenBalancesBefore[0]);
    console.log('    💶 New account balance: ', tokenBalancesBefore[1]);
    await this._transferToken({
      from: this.config.hederaAccountId,
      to: newAccountId,
      tokenId,
      amount: 120,
    });
    await this._delay({ ms: 3000 });
    const tokenBalancesAfter = await Promise.all([
      this._getTokenBalance({
        account: this.config.hederaAccountId,
        tokenId,
      }),
      this._getTokenBalance({ account: newAccountId, tokenId }),
    ]);
    console.log('Balances after transfer:');
    console.log('    💶 Main account balance: ', tokenBalancesAfter[0]);
    console.log('    💶 New account balance: ', tokenBalancesAfter[1]);
  }

  /**
   * Associates a token with an account.
   *
   * @param account - The account ID to associate the token with.
   * @param privateKey - The private key of the account.
   * @param tokenId - The ID of the token to associate.
   * @returns An object containing the associate transaction response and receipt.
   * @throws An error if there is an issue associating the token with the account.
   */
  private async _associateTokenWithAccount({
    account,
    privateKey,
    tokenId,
  }: {
    account: AccountId;
    privateKey: PrivateKey;
    tokenId: TokenId;
  }): Promise<{
    associateResponse: TransactionResponse;
    associateReceipt: TransactionReceipt;
  }> {
    console.log(
      `🔗 Associating token(${tokenId}) with new account(${account}) ...`
    );
    // Associate a token to an account and freeze the unsigned transaction for signing
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(account)
      .setTokenIds([tokenId])
      .freezeWith(this.client);

    // Sign with the private key of the account that is being associated to a token
    const signedAssociateTx = await associateTx.sign(privateKey);

    // Submit the transaction to a Hedera network
    const associateResponse = await signedAssociateTx.execute(this.client);

    // Request the receipt of the transaction
    const associateReceipt = await associateResponse.getReceipt(this.client);

    // Get the transaction consensus status
    const associateTxStatus = associateReceipt.status;

    if (!associateTxStatus || associateTxStatus !== Status.Success) {
      throw new Error(
        `❌ Error associating token: ${tokenId} with account: ${account}`
      );
    }
    console.log(
      '✅ Associate transaction done ' + associateTxStatus.toString()
    );
    return { associateResponse, associateReceipt };
  }
  /**
   * Creates a new Hedera token.
   * @param tokenInfo - The information of the token to be created.
   * @returns An object containing the token ID, response, and receipt.
   * @throws An error if there is an issue creating the token.
   */
  private async _createNewHederaToken({
    tokenInfo,
  }: {
    tokenInfo: {
      name: string;
      symbol: string;
      decimals: number;
      initSupply: number;
    };
  }): Promise<{
    tokenId: TokenId;
    response: TransactionResponse;
    receipt: TransactionReceipt;
  }> {
    console.log('🔷 Creating new Hedera Token...');
    // Create a new token
    const createTokenTx = new TokenCreateTransaction()
      .setTokenName(tokenInfo.name)
      .setTokenSymbol(tokenInfo.symbol)
      .setDecimals(tokenInfo.decimals)
      .setTreasuryAccountId(this.config.hederaAccountId)
      .setInitialSupply(tokenInfo.initSupply)
      .setAdminKey(this.config.publicKey)
      .setMaxTransactionFee(new Hbar(30)); // Change the default max transaction fee
    // Execute the transaction
    const createTokenResponse = await createTokenTx.execute(this.client);
    // Get receipt
    const createTokenReceipt = await createTokenResponse.getReceipt(
      this.client
    );
    // Get the token ID
    const tokenId = createTokenReceipt.tokenId;
    if (!tokenId) {
      throw new Error('❌ Error creating new Hedera Token');
    }
    console.log(
      `✅ New Token Created with ID: ${tokenId.toString()} (https://hashscan.io/testnet/token/${tokenId.toString()})`
    );
    console.log(
      '⛓️  Transaction Hash: ',
      Buffer.from(createTokenResponse.transactionHash).toString('hex')
    );
    return {
      tokenId: tokenId,
      response: createTokenResponse,
      receipt: createTokenReceipt,
    };
  }

  /**
   * Transfers a specified amount of a token from one account to another.
   *
   * @param from The account ID of the sender.
   * @param to The account ID of the recipient.
   * @param tokenId The ID of the token being transferred.
   * @param amount The amount of the token being transferred.
   * @returns An object containing the transfer response and receipt.
   * @throws An error if the token transfer fails.
   */
  private async _transferToken({
    from,
    to,
    tokenId,
    amount,
  }: {
    from: AccountId;
    to: AccountId;
    tokenId: TokenId;
    amount: number;
  }): Promise<{
    transferResponse: TransactionResponse;
    transferReceipt: TransactionReceipt;
  }> {
    console.log(`💸 Transferring token(${tokenId}) from ${from} to ${to}...`);
    // Transfer tokens
    const transferTx = new TransferTransaction()
      .addTokenTransfer(tokenId, from, -amount)
      .addTokenTransfer(tokenId, to, amount)
      .freezeWith(this.client);
    // Sign with the private key of the account that is being associated to a token
    const signedTransferTx = await transferTx.signWithOperator(this.client);
    // Submit the transaction to a Hedera network
    const transferResponse = await signedTransferTx.execute(this.client);
    // Request the receipt of the transaction
    const transferReceipt = await transferResponse.getReceipt(this.client);
    // Get the transaction consensus status
    const transferTxStatus = transferReceipt.status;
    if (!transferTxStatus || transferTxStatus !== Status.Success) {
      throw new Error(
        `❌ Error transferring token: ${tokenId} from account: ${from} to account: ${to}`
      );
    }
    console.log('✅ Transfer transaction done ' + transferTxStatus.toString());
    return { transferResponse, transferReceipt };
  }

  /**
   * Retrieves the balance of a specific token for a given account.
   * @param account The account ID.
   * @param tokenId The token ID.
   * @returns The balance of the token as a number.
   */
  private async _getTokenBalance({
    account,
    tokenId,
  }: {
    account: AccountId;
    tokenId: TokenId;
  }): Promise<number> {
    const tokensUriRequest = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${account.toString()}/tokens?limit=2&order=desc&token.id=${tokenId.toString()}`;
    // console.log(`🔍 Getting token balance from "${tokensUriRequest}"...`);
    const response = await fetch(tokensUriRequest);
    if (!response.ok) {
      throw new Error(`❌ Error fetching token balance`);
    }
    const data = await response.json();
    if (!data.tokens || !data.tokens[0] || !data.tokens[0].balance) {
      return 0;
    }
    return data.tokens[0].balance as number;
  }
}
