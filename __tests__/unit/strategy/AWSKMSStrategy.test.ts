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
import { SignatureRequest, AWSKMSStrategy, AWSKMSConfig } from '../../../src';
import { EXAMPLE_RAW_SIGNATURE } from '../../../__mocks__/aws-kms';

jest.mock('@aws-sdk/client-kms', () => require('../../../__mocks__/aws-kms'));

const MOCKED_AWS_KMS_CONFIG = new AWSKMSConfig(
  'mockedAwsAccessKeyId',
  'mockedAwsSecretAccessKey',
  'mockedAwsRegion',
  'AKIAQD75ZRQQDVRM5YXUT'
);

let awsKmsStrategy: AWSKMSStrategy;

describe('🧪 AWSKMSStrategy TESTS', () => {
  it('should correctly create an instance of AWSKMSStrategy', () => {
    const result = setupAwsKmsStrategy();

    expect(result).toBeInstanceOf(AWSKMSStrategy);
    expect(result['strategyConfig']).toEqual(MOCKED_AWS_KMS_CONFIG);
  });

  it('should correctly sign a signature request', async () => {
    awsKmsStrategy = setupAwsKmsStrategy();
    const mockSignatureRequest = new SignatureRequest(
      new Uint8Array([1, 2, 3])
    );

    const result = await awsKmsStrategy.sign(mockSignatureRequest);

    expect(result).toEqual(EXAMPLE_RAW_SIGNATURE);
  });
});

function setupAwsKmsStrategy(): AWSKMSStrategy {
  return new AWSKMSStrategy(MOCKED_AWS_KMS_CONFIG);
}
