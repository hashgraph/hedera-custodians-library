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
import { DFNSConfig, FireblocksConfig, AWSKMSConfig } from './src';
config();

// Regex to validate path
export const pathRegex = /^(\S+)\/([^/]+)$/;

// Set default values for environment variables
export const DEFAULT_FIREBLOCKS_API_SECRET_KEY =
  'resources/keys/fireblocks-priv.pem';
export const DEFAULT_DFNS_SERVICE_ACCOUNT_PRIVATE_KEY =
  'resources/keys/dfns-priv.pem';
export const DEFAULT_AWS_KMS_PUBLIC_KEY =
  'resources/keys/aws-public-b6961cc4-ca88-4bcf-9e0f-51696c7fd230.pem';
export const TEST_TIMEOUT = 10000; // 10 seconds

//* Fireblocks configuration
const fireblocksApiSecretKey =
  process.env.FIREBLOCKS_API_SECRET_KEY || DEFAULT_FIREBLOCKS_API_SECRET_KEY;
export const fireblocksConfig = new FireblocksConfig(
  process.env.FIREBLOCKS_API_KEY ?? '',
  pathRegex.test(fireblocksApiSecretKey)
    ? fs.readFileSync(path.resolve(fireblocksApiSecretKey), 'utf8')
    : Buffer.from(fireblocksApiSecretKey, 'base64').toString('utf8'),
  process.env.FIREBLOCKS_BASE_URL ?? '',
  process.env.FIREBLOCKS_VAULT_ACCOUNT_ID ?? '',
  process.env.FIREBLOCKS_ASSET_ID ?? ''
);

//* DFNS configuration
const dfnsServiceAccountPrivateKey =
  process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY ||
  DEFAULT_DFNS_SERVICE_ACCOUNT_PRIVATE_KEY;
export const dfnsConfig = new DFNSConfig(
  pathRegex.test(dfnsServiceAccountPrivateKey)
    ? fs.readFileSync(path.resolve(dfnsServiceAccountPrivateKey), 'utf8')
    : Buffer.from(dfnsServiceAccountPrivateKey, 'base64').toString('utf8'),
  process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID ?? '',
  process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN ?? '',
  process.env.DFNS_APP_ORIGIN ?? '',
  process.env.DFNS_APP_ID ?? '',
  process.env.DFNS_BASE_URL ?? '',
  process.env.DFNS_WALLET_ID ?? '',
  process.env.DFNS_WALLET_PUBLIC_KEY ?? ''
);
export const dfnsConfig_ECDSA = new DFNSConfig(
  pathRegex.test(dfnsServiceAccountPrivateKey)
    ? fs.readFileSync(path.resolve(dfnsServiceAccountPrivateKey), 'utf8')
    : Buffer.from(dfnsServiceAccountPrivateKey, 'base64').toString('utf8'),
  process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID ?? '',
  process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN ?? '',
  process.env.DFNS_APP_ORIGIN ?? '',
  process.env.DFNS_APP_ID ?? '',
  process.env.DFNS_BASE_URL ?? '',
  process.env.DFNS_WALLET_ID_ECDSA ?? '',
  process.env.DFNS_WALLET_PUBLIC_KEY_ECDSA ?? ''
);

//* AWS KMS configuration
const kmsPubKeyPathOrEncoded =
  process.env.AWS_KMS_PUBLIC_KEY || DEFAULT_AWS_KMS_PUBLIC_KEY;
let kmsPubKeyPem: string | undefined;
let kmsPubKeyDerHex: string | undefined;
if (kmsPubKeyPathOrEncoded) {
  if (
    pathRegex.test(kmsPubKeyPathOrEncoded) &&
    fs.existsSync(kmsPubKeyPathOrEncoded)
  ) {
    kmsPubKeyPem = fs.readFileSync(
      path.resolve(kmsPubKeyPathOrEncoded),
      'utf8'
    );
  } else if (!pathRegex.test(kmsPubKeyPathOrEncoded)) {
    kmsPubKeyPem = Buffer.from(kmsPubKeyPathOrEncoded, 'base64').toString(
      'utf8'
    );
  } else {
    kmsPubKeyPem = undefined;
  }
  if (kmsPubKeyPem) {
    const kmsPubKeyDerBuffer = Buffer.from(
      kmsPubKeyPem.replace(
        /^-----BEGIN PUBLIC KEY-----[\r\n]+|[\r\n]+-----END PUBLIC KEY-----$/g,
        ''
      ),
      'base64'
    );
    kmsPubKeyDerHex = kmsPubKeyDerBuffer.toString('hex');
  }
}
export const awsKMSConfig = new AWSKMSConfig(
  process.env.AWS_ACCESS_KEY_ID ?? '',
  process.env.AWS_SECRET_ACCESS_KEY ?? '',
  process.env.AWS_REGION ?? '',
  process.env.AWS_KMS_KEY_ID ?? '',
  kmsPubKeyDerHex ?? ''
);
