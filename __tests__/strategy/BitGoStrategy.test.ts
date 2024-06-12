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
  DFNSConfig,
  SignatureRequest,
  BitGoStrategy,
  hexStringToUint8Array,
} from '../../src';
import { describe, expect, it, jest } from '@jest/globals';
import { SignatureStatus } from '@dfns/sdk/codegen/datamodel/Wallets/index.js';
import {
  Client,
  PrivateKey,
  PublicKey,
  TokenAssociateTransaction,
} from '@hashgraph/sdk';

describe('🧪 BitGoStrategy TESTS', () => {
  const bitGoStrategy: BitGoStrategy = new BitGoStrategy();

  it('should correctly sign a signature request', async () => {
    const hederaAccountId = '0.0.4424668';
    const privateKeyUser =
      '302e020100300506032b657004220420d5d7275403b95367e82c9e21183dbe220a275525ea54931a3bb2821d7168828e';
    const tokenId = '0.0.4388923';

    const client = Client.forTestnet();

    client.setOperator(hederaAccountId, privateKeyUser);

    const privateKey = PrivateKey.fromStringDer(privateKeyUser);

    let associateTx = new TokenAssociateTransaction()
      .setAccountId(hederaAccountId)
      .setTokenIds([tokenId])
      .freezeWith(client);

    const signedAssociateTx = await associateTx.sign(privateKey);

    const result = await bitGoStrategy.signAndSend(signedAssociateTx);
    console.log(result);
  }, 1000000);
});
