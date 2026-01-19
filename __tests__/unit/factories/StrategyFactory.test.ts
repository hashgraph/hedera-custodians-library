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
  DFNSStrategy,
  DFNSConfig,
  FireblocksStrategy,
  FireblocksConfig,
  StrategyFactory,
} from '../../../src';

const MOCK_FIREBLOCKS_CONFIG = new FireblocksConfig(
  'mockedApiSecretKey',
  'mockedApiKey',
  'mockedBaseUrl',
  'mockedVaultAccountId',
  'mockedAssetId'
);

const MOCK_DFNS_CONFIG = new DFNSConfig(
  'mockedServiceAccountPrivateKey',
  'mockedServiceAccountCredentialId',
  'mockedServiceAccountAuthToken',
  'mockedAppOrigin',
  'mockedAppId',
  'mockedBaseUrl',
  'mockedWalletId',
  'mockedPublicKey'
);

describe('🧪 Factory TESTS', () => {
  describe('[Fireblocks]', () => {
    it('should instantiate FireblocksStrategy when given Fireblocks configuration', () => {
      const strategy = StrategyFactory.createSignatureStrategy(
        MOCK_FIREBLOCKS_CONFIG
      );

      expect(strategy).toBeInstanceOf(FireblocksStrategy);
    });
  });

  describe('[DFNS]', () => {
    it('should instantiate DFNSStrategy when given DFNS configuration', () => {
      const strategy =
        StrategyFactory.createSignatureStrategy(MOCK_DFNS_CONFIG);

      expect(strategy).toBeInstanceOf(DFNSStrategy);
    });
  });
});
