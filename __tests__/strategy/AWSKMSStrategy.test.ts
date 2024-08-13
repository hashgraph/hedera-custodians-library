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

import { describe, expect, it, jest } from '@jest/globals';
import {
  KMSClient,
  SignCommandInput,
  SignCommandOutput,
} from '@aws-sdk/client-kms';
import {
  SignatureRequest,
  AWSKMSStrategy,
  AWSKMSConfig,
  calcKeccak256,
} from '../../src';
const EXAMPLE_DER_SIGNATURE = new Uint8Array([
  48, 69, 2, 32, 106, 83, 175, 75, 8, 232, 155, 63, 17, 93, 150, 137, 172, 254,
  239, 255, 246, 1, 106, 180, 240, 53, 247, 66, 142, 240, 185, 235, 172, 101,
  234, 173, 2, 33, 0, 234, 218, 66, 178, 57, 16, 75, 111, 184, 162, 232, 167,
  148, 27, 127, 194, 94, 213, 11, 196, 0, 125, 162, 125, 234, 70, 245, 208, 254,
  8, 112, 43,
]);
const EXAMPLE_RAW_SIGNATURE = new Uint8Array([
  106, 83, 175, 75, 8, 232, 155, 63, 17, 93, 150, 137, 172, 254, 239, 255, 246,
  1, 106, 180, 240, 53, 247, 66, 142, 240, 185, 235, 172, 101, 234, 173, 234,
  218, 66, 178, 57, 16, 75, 111, 184, 162, 232, 167, 148, 27, 127, 194, 94, 213,
  11, 196, 0, 125, 162, 125, 234, 70, 245, 208, 254, 8, 112, 43,
]);

const SIGNING_ALGORITHM = 'ECDSA_SHA_256';
const MESSAGE_TYPE = 'DIGEST';

const MOCKED_AWS_KMS_CONFIG = new AWSKMSConfig(
  'mockedAwsAccessKeyId',
  'mockedAwsSecretAccessKey',
  'mockedAwsRegion',
  'AKIAQD75ZRQQDVRM5YXUT'
);

const mockSignatureResponse: SignCommandOutput = {
  $metadata: {
    httpStatusCode: 200,
    requestId: 'ef18ac69-ef93-4add-96a4-f77eccee9da7',
    attempts: 1,
    totalRetryDelay: 0,
  },
  KeyId:
    'arn:aws:kms:eu-north-1:036502604807:key/b6961cc4-ca88-4bcf-9e0f-51696c7fd230',
  SigningAlgorithm: 'ECDSA_SHA_256',
  Signature: EXAMPLE_DER_SIGNATURE,
};

let awsKmsStrategy: AWSKMSStrategy;
const mocks = {
  kms: {
    send: jest.spyOn(KMSClient.prototype, 'send'),
  },
};

describe('🧪 DFNSStrategy TESTS', () => {
  beforeAll(() => {
    mocks.kms.send.mockImplementation(() =>
      Promise.resolve(mockSignatureResponse)
    );
  });
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should correctly create an instance of AWSKMSStrategy', () => {
    // Arrange
    const expectedStrategyConfig = MOCKED_AWS_KMS_CONFIG;
    // Act
    const result = setupAwsKmsStrategy();
    // Assert
    expect(result).toBeInstanceOf(AWSKMSStrategy);
    expect(result['strategyConfig']).toEqual(expectedStrategyConfig);
    expect(result['kmsClient']).toBeInstanceOf(KMSClient);
  });

  it('should correctly sign a signature request', async () => {
    // Arrange
    // Setup AWS KMS Strategy
    awsKmsStrategy = setupAwsKmsStrategy();
    const mockSignatureRequest = new SignatureRequest(
      new Uint8Array([1, 2, 3])
    );
    const expectedSignatureResponse = EXAMPLE_RAW_SIGNATURE;
    const expectedCommand = {
      Message: calcKeccak256(mockSignatureRequest.getTransactionBytes()),
      KeyId: MOCKED_AWS_KMS_CONFIG.awsKmsKeyId,
      SigningAlgorithm: SIGNING_ALGORITHM,
      MessageType: MESSAGE_TYPE,
    } as SignCommandInput;
    // Act
    const result = await awsKmsStrategy.sign(mockSignatureRequest);
    // Assert
    expect(mocks.kms.send).toHaveBeenCalledTimes(1);
    expect(mocks.kms.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedCommand })
    );
    expect(result).toEqual(expectedSignatureResponse);
  });
});

function setupAwsKmsStrategy(): AWSKMSStrategy {
  return new AWSKMSStrategy(MOCKED_AWS_KMS_CONFIG);
}
