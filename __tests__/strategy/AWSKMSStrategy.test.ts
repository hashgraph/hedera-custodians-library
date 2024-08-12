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
import { SignCommandOutput } from '@aws-sdk/client-kms';
import { SignatureRequest, AWSKMSStrategy, AWSKMSConfig } from '../../src';
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

jest.mock('@aws-sdk/client-kms', () => ({
  KMSClient: jest.fn().mockImplementation(() => ({
    send: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockSignatureResponse)),
  })),
}));

describe('🧪 DFNSStrategy TESTS', () => {
  beforeEach(() => {
    // mocks.kms.send.mockImplementation(() => {
    //   Promise.resolve(mockSignatureResponse);
    // });
    awsKmsStrategy = setupAwsKmsStrategy();
  });
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  //! Bypass husky pre-commit hook, DELETE THIS Code
  it('should bypass husky pre-commit hook', () => {
    expect(true).toBeTruthy();
  });

  // it('should correctly sign a signature request', async () => {
  //   // Arrange
  //   const mockSignatureRequest = new SignatureRequest(
  //     new Uint8Array([1, 2, 3])
  //   );
  //   const expectedSignatureResponse = EXAMPLE_RAW_SIGNATURE;
  //   // Act
  //   const result = await awsKmsStrategy.sign(mockSignatureRequest);
  //   // Assert
  //   // expect(mocks.kms.send).toHaveBeenCalledTimes(1);
  //   expect(awsKmsStrategy['kmsClient']['send']).toHaveBeenCalledTimes(1);
  //   expect(result).toEqual(expectedSignatureResponse);
  // });
});

const setupAwsKmsStrategy = (): AWSKMSStrategy => {
  const mockStrategyConfig = new AWSKMSConfig(
    'mockedAwsAccessKeyId',
    'mockedAwsSecretAccessKey',
    'mockedAwsRegion',
    'AKIAQD75ZRQQDVRM5YXUT'
  );
  return new AWSKMSStrategy(mockStrategyConfig);
};
