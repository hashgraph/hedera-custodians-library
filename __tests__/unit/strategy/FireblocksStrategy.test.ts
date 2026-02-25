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

import { describe, expect, it } from '@jest/globals';
import {
  FireblocksConfig,
  SignatureRequest,
  FireblocksStrategy,
  hexStringToUint8Array,
} from '../../../src';
import { mockFireblocksSignatureResponse } from '../../../__mocks__/fireblocks-ts-sdk';

jest.mock('@fireblocks/ts-sdk', () =>
  require('../../../__mocks__/fireblocks-ts-sdk')
);

describe('🧪 FireblocksStrategy TESTS', () => {
  let fireblocksStrategy: FireblocksStrategy;

  beforeEach(() => {
    fireblocksStrategy = setupFireblocksStrategy();
    jest.spyOn(
      fireblocksStrategy['fireblocks']['transactions'],
      'createTransaction'
    );
    jest.spyOn(
      fireblocksStrategy['fireblocks']['transactions'],
      'getTransaction'
    );
  });

  it('should correctly sign a signature request', async () => {
    const mockSignatureRequest = new SignatureRequest(
      new Uint8Array([1, 2, 3])
    );
    const result = await fireblocksStrategy.sign(mockSignatureRequest);

    expect(
      fireblocksStrategy['fireblocks']['transactions']['createTransaction']
    ).toHaveBeenCalledTimes(1);
    expect(
      fireblocksStrategy['fireblocks']['transactions']['getTransaction']
    ).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      hexStringToUint8Array({
        hexString:
          mockFireblocksSignatureResponse.signedMessages[0].signature.fullSig,
      })
    );
  });
});

const setupFireblocksStrategy = (): FireblocksStrategy => {
  return new FireblocksStrategy(
    new FireblocksConfig(
      'mockedApiSecretKey',
      'mockedApiKey',
      'mockedBaseUrl',
      'mockedVaultAccountId',
      'mockedAssetId'
    )
  );
};
