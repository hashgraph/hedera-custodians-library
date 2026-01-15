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

import { AccountId, PublicKey } from '@hiero-ledger/sdk';
import { AWSKMSConfig, FireblocksConfig, DFNSConfig } from '../src';

/**
 * Represents the configuration for an example service.
 */
export default class ExampleConfig {
  serviceSpecificConfig: DFNSConfig | FireblocksConfig | AWSKMSConfig;
  hederaAccountId: AccountId;
  publicKey: PublicKey;

  constructor(
    config: DFNSConfig | FireblocksConfig | AWSKMSConfig,
    hederaAccountId: AccountId | string,
    publicKey: PublicKey | string
  ) {
    this.serviceSpecificConfig = config;
    this.hederaAccountId =
      typeof hederaAccountId === 'string'
        ? AccountId.fromString(hederaAccountId)
        : hederaAccountId;
    this.publicKey =
      typeof publicKey === 'string'
        ? PublicKey.fromString(publicKey)
        : publicKey;
  }
}
