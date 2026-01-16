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

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import axios from 'axios';
import {
  CustodialWalletService,
  DFNSConfig,
  FireblocksConfig,
  SignatureRequest,
} from '../../src';
import {
  awsKMSConfig,
  dfnsConfig,
  dfnsConfig_ECDSA,
  fireblocksConfig,
  TEST_TIMEOUT,
} from '../../config';

/**
 * Integration tests for CustodialWalletService.
 * These tests make real API calls to Fireblocks and DFNS services.
 * Run only on merge to main branch.
 */

// Axios interceptor to handle circular references in HTTP responses
// This prevents Jest worker serialization errors
let axiosInterceptorId: number;

beforeAll(() => {
  axiosInterceptorId = axios.interceptors.response.use(
    (response) => {
      // Remove circular references and non-serializable properties
      if (response.config) {
        delete response.config.adapter;
        delete response.config.httpAgent;
        delete response.config.httpsAgent;
        delete response.config.transformRequest;
        delete response.config.transformResponse;
      }
      if (response.request) {
        delete response.request;
      }
      return response;
    },
    (error) => {
      if (error.config) {
        delete error.config.adapter;
        delete error.config.httpAgent;
        delete error.config.httpsAgent;
        delete error.config.transformRequest;
        delete error.config.transformResponse;
      }
      if (error.request) {
        delete error.request;
      }
      return Promise.reject(error);
    }
  );
});

afterAll(() => {
  axios.interceptors.response.eject(axiosInterceptorId);
});

const signatureRequest = new SignatureRequest(new Uint8Array([1, 2, 3]));

const signatureRequest_Hash = new SignatureRequest(
  new Uint8Array([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 1, 2, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13, 14, 15, 16,
  ])
);

describe('🧪 [INTEGRATION] Service TESTS', () => {
  describe('Configuration', () => {
    it(
      '[Fireblocks] Get configuration from service instance',
      async () => {
        const signatureService = new CustodialWalletService(fireblocksConfig);

        const config = signatureService.getConfig() as FireblocksConfig;

        expect(config).toBeInstanceOf(FireblocksConfig);
        expect(config.apiKey).toEqual(fireblocksConfig.apiKey);
        expect(config.apiSecretKey).toEqual(fireblocksConfig.apiSecretKey);
        expect(config.baseUrl).toEqual(fireblocksConfig.baseUrl);
        expect(config.vaultAccountId).toEqual(fireblocksConfig.vaultAccountId);
        expect(config.assetId).toEqual(fireblocksConfig.assetId);
      },
      TEST_TIMEOUT
    );

    it(
      '[DFNS] Get configuration from service instance',
      async () => {
        const signatureService = new CustodialWalletService(dfnsConfig);

        const config = signatureService.getConfig() as DFNSConfig;

        expect(config).toBeInstanceOf(DFNSConfig);
        expect(config.serviceAccountPrivateKey).toEqual(
          dfnsConfig.serviceAccountPrivateKey
        );
        expect(config.serviceAccountCredentialId).toEqual(
          dfnsConfig.serviceAccountCredentialId
        );
        expect(config.serviceAccountAuthToken).toEqual(
          dfnsConfig.serviceAccountAuthToken
        );
        expect(config.appOrigin).toEqual(dfnsConfig.appOrigin);
        expect(config.appId).toEqual(dfnsConfig.appId);
        expect(config.baseUrl).toEqual(dfnsConfig.baseUrl);
        expect(config.walletId).toEqual(dfnsConfig.walletId);
      },
      TEST_TIMEOUT
    );

    it(
      'Set configuration to service instance Fireblocks -> DFNS',
      async () => {
        const signatureService = new CustodialWalletService(fireblocksConfig);

        signatureService.setConfig(dfnsConfig);
        const config = signatureService.getConfig() as DFNSConfig;

        expect(config).toBeInstanceOf(DFNSConfig);
        expect(config.serviceAccountPrivateKey).toEqual(
          dfnsConfig.serviceAccountPrivateKey
        );
        expect(config.serviceAccountCredentialId).toEqual(
          dfnsConfig.serviceAccountCredentialId
        );
        expect(config.serviceAccountAuthToken).toEqual(
          dfnsConfig.serviceAccountAuthToken
        );
        expect(config.appOrigin).toEqual(dfnsConfig.appOrigin);
        expect(config.appId).toEqual(dfnsConfig.appId);
        expect(config.baseUrl).toEqual(dfnsConfig.baseUrl);
        expect(config.walletId).toEqual(dfnsConfig.walletId);
      },
      TEST_TIMEOUT
    );

    it(
      'Set configuration to service instance DFNS -> Fireblocks',
      async () => {
        const signatureService = new CustodialWalletService(dfnsConfig);

        signatureService.setConfig(fireblocksConfig);
        const config = signatureService.getConfig() as FireblocksConfig;

        expect(config).toBeInstanceOf(FireblocksConfig);
        expect(config.apiKey).toEqual(fireblocksConfig.apiKey);
        expect(config.apiSecretKey).toEqual(fireblocksConfig.apiSecretKey);
        expect(config.baseUrl).toEqual(fireblocksConfig.baseUrl);
        expect(config.vaultAccountId).toEqual(fireblocksConfig.vaultAccountId);
        expect(config.assetId).toEqual(fireblocksConfig.assetId);
      },
      TEST_TIMEOUT
    );
  });

  describe('[Fireblocks] Signatures', () => {
    // TODO: Re-enable when Fireblocks tenant is active again
    it.skip(
      'Sign bunch of bytes',
      async () => {
        const signatureService = new CustodialWalletService(fireblocksConfig);
        const signature =
          await signatureService.signTransaction(signatureRequest);
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT
    );
  });

  describe('[DFNS] Signatures', () => {
    it(
      'Sign bunch of bytes with ED25519 key',
      async () => {
        const signatureService = new CustodialWalletService(dfnsConfig);
        const signature =
          await signatureService.signTransaction(signatureRequest);
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT
    );

    it(
      'Sign hash with ECDSA key',
      async () => {
        const signatureService = new CustodialWalletService(dfnsConfig_ECDSA);
        const signature = await signatureService.signTransaction(
          signatureRequest_Hash
        );
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT
    );
  });

  describe('[AWS KMS] Signatures', () => {
    // TODO: Re-enable when AWS KMS secrets are configured
    it.skip(
      'Sign bunch of bytes',
      async () => {
        const signatureService = new CustodialWalletService(awsKMSConfig);
        const signature =
          await signatureService.signTransaction(signatureRequest);
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT
    );
  });
});
