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
  DFNSConfig,
  SignatureRequest,
  DFNSStrategy,
  hexStringToUint8Array,
} from '../../../src';
import { mockDfnsSignatureResponse } from '../../../__mocks__/dfns-sdk';

jest.mock('@dfns/sdk', () => require('../../../__mocks__/dfns-sdk'));

describe('🧪 DFNSStrategy TESTS', () => {
  let dfnsStrategy: DFNSStrategy;
  const walletId = 'wallet-id';

  beforeEach(() => {
    dfnsStrategy = setupDfnsStrategy(walletId);
    jest.spyOn(dfnsStrategy['dfnsApiClient']['wallets'], 'generateSignature');
    jest.spyOn(dfnsStrategy['dfnsApiClient']['wallets'], 'getSignature');
  });

  it('should correctly sign a signature request', async () => {
    const mockSignatureRequest = new SignatureRequest(
      new Uint8Array([1, 2, 3])
    );
    const result = await dfnsStrategy.sign(mockSignatureRequest);

    const expectedSignatureResponse = hexStringToUint8Array({
      hexString:
        mockDfnsSignatureResponse.signature!.r.substring(2) +
        mockDfnsSignatureResponse.signature!.s.substring(2),
    });

    expect(
      dfnsStrategy['dfnsApiClient']['wallets']['generateSignature']
    ).toHaveBeenCalledTimes(1);
    expect(
      dfnsStrategy['dfnsApiClient']['wallets']['getSignature']
    ).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedSignatureResponse);
  });
});

const setupDfnsStrategy = (walletId: string): DFNSStrategy => {
  const mockStrategyConfig = new DFNSConfig(
    'mockedServiceAccountPrivateKey',
    'mockedServiceAccountCredentialId',
    'mockedServiceAccountAuthToken',
    'mockedAppOrigin',
    'mockedAppId',
    'mockedBaseUrl',
    walletId,
    'mockedPublicKey'
  );
  return new DFNSStrategy(mockStrategyConfig);
};
