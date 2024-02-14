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
  AccountCreateTransaction,
  Client,
  KeyList,
  PublicKey,
  Status,
  TransferTransaction,
} from '@hashgraph/sdk';

import dotenv from 'dotenv';
import { CustodialWalletService, SignatureRequest } from '../src';
import * as process from 'process';
import { dfnsConfig } from '../config';

dotenv.config();

const signTransactionHandler = async (
  message: Uint8Array,
): Promise<Uint8Array> => {
  const signatureRequest = new SignatureRequest(message);
  const service = new CustodialWalletService(dfnsConfig);
  return await service.signTransaction(signatureRequest);
};

async function createAccountWithDFNSKey(client: Client): Promise<string> {
  const ECpublicKey = PublicKey.fromStringECDSA(
    '0247a85d8e240656ff94a2f3b79f4ff272c56113226d1e39fee8f3d974cb14d144',
  );
  const EDpublicKey = PublicKey.fromStringED25519(
    process.env.DFNS_WALLET_PUBLIC_KEY!,
  );

  const publicKeyList = [ECpublicKey, EDpublicKey];
  const thresholdKey = new KeyList(publicKeyList, 1);

  const response = await new AccountCreateTransaction()
    .setKey(thresholdKey)
    .setInitialBalance(3)
    .execute(client);

  const receipt = await response.getReceipt(client);
  const dfnsAccountId = receipt.accountId;
  if (dfnsAccountId == null) {
    throw new Error('Account ID is null');
  }
  console.log(`Created account with DFNS key : ${dfnsAccountId.toString()}`);

  return dfnsAccountId.toString();
}

async function transferFunds(
  client: Client,
  dfnsAccountId: string,
): Promise<void> {
  client.setOperatorWith(
    dfnsAccountId,
    process.env.DFNS_WALLET_PUBLIC_KEY!,
    signTransactionHandler,
  );

  client.setMaxNodesPerTransaction(1);
  const transaction = await new TransferTransaction()
    .addHbarTransfer(dfnsAccountId, -1)
    .addHbarTransfer(process.env.OPERATOR_ID!, 1)
    .execute(client);

  const transferReceipt = await transaction.getReceipt(client);
  const transferTxStatus = transferReceipt.status;
  if (!transferTxStatus || transferTxStatus !== Status.Success) {
    throw new Error(
      `❌ Error transferring from account: ${dfnsAccountId} to account: ${process.env.OPERATOR_ID!}`,
    );
  }
  console.log('✅ Transfer transaction done ' + transferTxStatus.toString());
}

async function main(): Promise<void> {
  const client = Client.forName(process.env.HEDERA_NETWORK!);
  client.setOperator(process.env.OPERATOR_ID!, process.env.OPERATOR_KEY!);

  const dfnsAccountId = await createAccountWithDFNSKey(client);
  await transferFunds(client, dfnsAccountId);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
