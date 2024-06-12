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

import { BitGoAPI } from '@bitgo/sdk-api';
import { SignatureRequest } from '../../models/signature/SignatureRequest.js';
import { ISignatureStrategy } from '../signature/ISignatureStrategy.js';
import { Thbar } from '@bitgo/sdk-coin-hbar'; // Ensure Thbar is imported
import { Transaction } from '@hashgraph/sdk';

export class BitGoStrategy implements ISignatureStrategy {
  constructor() {}
  sign(request: SignatureRequest): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  async signAndSend(request: Transaction): Promise<any> {
    const bitgo = new BitGoAPI({
      env: 'test',
      accessToken:
        'v2x51af929655d1ce0857f00c4b1895c84b3e817749e690ecfa335d68e472e1f3bc',
    });
    const coin = 'thbar'; // Hedera Testnet
    bitgo.register(coin, Thbar.createInstance);

    const walletId = '6662f487b357415ff3ba70b6d9e837da';

    // Fetch the wallet
    const wallet = await bitgo.coin(coin).wallets().get({ id: walletId });

    const params = {
      halfSigned: {
        txHex: this.fromUint8ArraytoHex(request.toBytes()),
      },
      // txHex: this.fromUint8ArraytoHex(request.toBytes()),
      // otp: '0000000',
    };
    const signedTransaction = await wallet.submitTransaction(params);

    console.log(JSON.stringify(signedTransaction));

    return signedTransaction;
  }

  fromUint8ArraytoHex(uint8ArrayKey: Uint8Array): string {
    return Array.from(uint8ArrayKey, (byte) =>
      ('0' + byte.toString(16)).slice(-2)
    ).join('');
  }
}
