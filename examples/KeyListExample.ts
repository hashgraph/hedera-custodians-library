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
  Client,
  Hbar,
  KeyList,
  PublicKey,
  Status,
  TransactionReceipt,
  TransactionResponse,
  TransferTransaction,
} from '@hashgraph/sdk';
import Example from './Example';

export default class KeyListExample extends Example {
  public async mainExample(): Promise<void> {
    const keyList = await this._createNewKeyList([], 1);
    const { newAccountId } = await this._createAccount({
      newAccountKey: keyList,
    });
    await this._transferHbar(newAccountId, this.config.hederaAccountId, 1);
  }

  private async _createNewKeyList(
    publicKeyList: PublicKey[] = [],
    threshold?: number
  ): Promise<KeyList> {
    console.log('Creating a new key list...');
    if (publicKeyList.length === 0) {
      publicKeyList.push((await this._createKeyPair()).publicKey);
      publicKeyList.push(this.config.publicKey);
    }
    const keyList = new KeyList(publicKeyList, threshold);
    console.log('✅ Key list created.');
    return keyList;
  }

  private async _transferHbar(
    from: AccountId,
    to: AccountId,
    amount: number | Hbar
  ): Promise<{
    transferResponse: TransactionResponse;
    transferReceipt: TransactionReceipt;
  }> {
    console.log(`💸 Transferring ${amount} Hbars from ${from} to ${to}...`);
    // Transfer Hbars (freeze with DFNS single account)
    this.client.setMaxNodesPerTransaction(1);
    const transferTx = new TransferTransaction()
      .addHbarTransfer(from, -amount)
      .addHbarTransfer(to, amount)
      .freezeWith(this.client);
    // Sign with the DFNS but KeyList account
    const keyListDfnsClient = Client.forTestnet().setOperatorWith(
      from,
      this.config.publicKey,
      this.signTransactionHandler
    );
    const signedTransferTx =
      await transferTx.signWithOperator(keyListDfnsClient);
    // Submit the transaction to a Hedera network
    const transferResponse = await signedTransferTx.execute(this.client);
    // Request the receipt of the transaction
    const transferReceipt = await transferResponse.getReceipt(this.client);
    // Get the transaction consensus status
    const transferTxStatus = transferReceipt.status;
    if (!transferTxStatus || transferTxStatus !== Status.Success) {
      throw new Error(
        `❌ Error transferring ${amount} Hbar from account: ${from} to account: ${to}`
      );
    }
    console.log('✅ Transfer transaction done ' + transferTxStatus.toString());
    return { transferResponse, transferReceipt };
  }
}
