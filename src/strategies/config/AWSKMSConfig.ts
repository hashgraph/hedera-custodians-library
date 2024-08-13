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
  AWSKMSStrategy,
  ISignatureStrategy,
  IStrategyConfig,
} from '../../../src';

/**
 * Configuration for the AWS KMS strategy.
 * This class stores the credentials and settings required to interact with a specific service.
 *
 * @export
 * @class AWSKMSConfig
 * @implements {IStrategyConfig}
 */
export class AWSKMSConfig implements IStrategyConfig {
  /** Creates an instance of AWSKMSConfig.
   *
   * @param {string} awsAccessKeyId - The AWS access key ID.
   * @param {string} awsSecretAccessKey - The AWS secret access key.
   * @param {string} awsRegion - The AWS region.
   * @param {string} awsKmsKeyId - The AWS KMS key ID.
   * @param {string} awsKmsPublicKey - The AWS KMS public key.
   */
  constructor(
    public awsAccessKeyId: string,
    public awsSecretAccessKey: string,
    public awsRegion: string,
    public awsKmsKeyId: string,
    public awsKmsPublicKey: string
  ) {}

  /**
   * Retrieves the signature strategy for AWS KMS configuration.
   *
   * @returns {AWSKMSStrategy} An instance of the AWSKMSStrategy signature strategy.
   */
  getSignatureStrategy(): ISignatureStrategy {
    return new AWSKMSStrategy(this);
  }
}
