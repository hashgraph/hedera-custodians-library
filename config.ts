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

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { DFNSConfig, FireblocksConfig } from './src';
config();

// Regex to validate path
const pathRegex = /^(\/[^/]+|\\[^\\]+)+(\/[^/]+|\\[^\\]+)*$/;

// Set default values for environment variables
export const DEFAULT_FIREBLOCKS_API_SECRET_KEY =
  'resources/keys/fireblocks-priv.pem';
export const DEFAULT_DFNS_SERVICE_ACCOUNT_PRIVATE_KEY =
  'resources/keys/dfns-priv.pem';
export const TEST_TIMEOUT = 10000; // 10 seconds

//* Fireblocks configuration
const fireblocksApiSecretKey =
  process.env.FIREBLOCKS_API_SECRET_KEY || DEFAULT_FIREBLOCKS_API_SECRET_KEY;
export const fireblocksConfig = new FireblocksConfig(
  process.env.FIREBLOCKS_API_KEY ?? '',
  fireblocksApiSecretKey.match(pathRegex)
    ? fs.readFileSync(path.resolve(fireblocksApiSecretKey), 'utf8')
    : fireblocksApiSecretKey,
  process.env.FIREBLOCKS_BASE_URL ?? '',
  process.env.FIREBLOCKS_VAULT_ACCOUNT_ID ?? '',
  process.env.FIREBLOCKS_ASSET_ID ?? '',
);

//* DFNS configuration
const dfnsServiceAccountPrivateKey =
  process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY ||
  DEFAULT_DFNS_SERVICE_ACCOUNT_PRIVATE_KEY;
export const dfnsConfig = new DFNSConfig(
  dfnsServiceAccountPrivateKey.match(pathRegex)
    ? fs.readFileSync(path.resolve(dfnsServiceAccountPrivateKey), 'utf8')
    : dfnsServiceAccountPrivateKey,
  process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID ?? '',
  process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN ?? '',
  process.env.DFNS_APP_ORIGIN ?? '',
  process.env.DFNS_APP_ID ?? '',
  process.env.DFNS_BASE_URL ?? '',
  process.env.DFNS_WALLET_ID ?? '',
);

function checkEnvVariables(): void {
  if (!dfnsConfig.serviceAccountPrivateKey) {
    throw new Error('DFNS service account private key is not set');
  }
  if (!dfnsConfig.serviceAccountCredentialId) {
    throw new Error('DFNS service account credential ID is not set');
  }
  if (!dfnsConfig.serviceAccountAuthToken) {
    throw new Error('DFNS service account authorization token is not set');
  }
  if (!dfnsConfig.appOrigin) {
    throw new Error('DFNS app origin is not set');
  }
  if (!dfnsConfig.appId) {
    throw new Error('DFNS app ID is not set');
  }
  if (!dfnsConfig.baseUrl) {
    throw new Error('DFNS base URL is not set');
  }
  if (!dfnsConfig.walletId) {
    throw new Error('DFNS wallet ID is not set');
  }
  if (!fireblocksConfig.apiKey) {
    throw new Error('Fireblocks API key is not set');
  }
  if (!fireblocksConfig.apiSecretKey) {
    throw new Error('Fireblocks API secret is not set');
  }
  if (!fireblocksConfig.baseUrl) {
    throw new Error('Fireblocks base URL is not set');
  }
  if (!fireblocksConfig.vaultAccountId) {
    throw new Error('Fireblocks vault account ID is not set');
  }
  if (!fireblocksConfig.assetId) {
    throw new Error('Fireblocks asset ID is not set');
  }
}

checkEnvVariables(); //! Beta
