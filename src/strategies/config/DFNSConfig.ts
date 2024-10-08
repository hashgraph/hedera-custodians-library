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
  DFNSStrategy,
  IStrategyConfig,
  ISignatureStrategy,
} from '../../../src';

/**
 * Configuration for the DFNS strategy.
 * This class stores the credentials and settings required to interact with a specific service.
 *
 * @export
 * @class DFNSConfig
 * @implements {IStrategyConfig}
 */
export class DFNSConfig implements IStrategyConfig {
  /**
   * Creates an instance of DFNSConfig.
   *
   * @param {string} serviceAccountPrivateKey - The service account's private key.
   * @param {string} serviceAccountCredentialId - The credential ID of the service account.
   * @param {string} serviceAccountAuthToken - The authentication token of the service account.
   * @param {string} appOrigin - The url of the origin application.
   * @param {string} appId - The ID of the origin application.
   * @param {string} baseUrl - The base URL for requests.
   * @param {string} walletId - The ID of the associated wallet.
   * @param {string} publicKey - The public Key of the associated wallet.
   */
  constructor(
    public serviceAccountPrivateKey: string,
    public serviceAccountCredentialId: string,
    public serviceAccountAuthToken: string,
    public appOrigin: string,
    public appId: string,
    public baseUrl: string,
    public walletId: string,
    public publicKey: string
  ) {}

  /**
   * Retrieves the signature strategy for DFNS configuration.
   *
   * @returns {DFNSStrategy} An instance of the DFNSStrategy signature strategy.
   */
  getSignatureStrategy(): ISignatureStrategy {
    return new DFNSStrategy(this);
  }
}
