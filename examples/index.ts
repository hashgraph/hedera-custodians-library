/*
 *
 * Hedera Stablecoin SDK
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

import inquirer, { Answers } from 'inquirer';
import {
  DEFAULT_DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH,
  DEFAULT_FIREBLOCKS_API_SECRET_KEY_PATH,
  dfnsConfig,
  fireblocksConfig,
} from '../config';
import { DFNSConfig, FireblocksConfig } from 'index';
import { readFileSync } from 'fs';
import DfnsExample from './DfnsExample';
import DfnsExampleConfig from './DfnsExampleConfig';
import { AccountId, PublicKey } from '@hashgraph/sdk';

async function main(): Promise<void> {
  const custodialAnwsers: Answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'custodialService',
      message: 'What custodial service do you use?',
      choices: ['Dfns', 'Fireblocks'],
      default: 'Dfns',
    },
    {
      type: 'confirm',
      name: 'useEnvVars',
      message: 'Use environment variables?',
      default: true,
    },
  ]);
  let example: DfnsExample; // TODO: | FireblocksExample
  switch (custodialAnwsers.custodialService) {
    case 'Dfns':
      example = new DfnsExample(
        custodialAnwsers.useEnvVars
          ? new DfnsExampleConfig(
              dfnsConfig,
              AccountId.fromString(
                process.env.DFNS_WALLET_HEDERA_ACCOUNT_ID ?? '',
              ),
              PublicKey.fromString(process.env.DFNS_WALLET_PUBLIC_KEY ?? ''),
            )
          : await askDfnsParams(),
      );
      break;
    case 'Fireblocks':
      throw new Error('❌ 🥵 Fireblocks is not implemented yet'); // TODO
      // example = new FireblocksExample(custodialAnwsers.useEnvVars ? fireblocksConfig : await askFireblocksParams();
      break;

    default:
      throw new Error(
        '❌ 🐛 Invalid custodial service. You should not be able to get here 🧐.',
      );
  }
  await example.createAccount();
  process.exit(0);
}

async function askDfnsParams(): Promise<DfnsExampleConfig> {
  const dfnsParams: Answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'dfnsServiceAccountPrivateKeyPath',
      message: 'Enter the path to the service account private key',
      default: DEFAULT_DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH,
    },
    {
      type: 'input',
      name: 'serviceAccountCredentialId',
      message: 'Enter the service account credential ID',
      default: dfnsConfig.serviceAccountCredentialId,
    },
    {
      type: 'input',
      name: 'serviceAccountAuthToken',
      message: 'Enter the service account authorization token',
      default: dfnsConfig.serviceAccountAuthToken,
    },
    {
      type: 'input',
      name: 'appOrigin',
      message: 'Enter the app origin',
      default: dfnsConfig.appOrigin,
    },
    {
      type: 'input',
      name: 'appId',
      message: 'Enter the app ID',
      default: dfnsConfig.appId,
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'Enter the base URL',
      default: dfnsConfig.baseUrl,
    },
    {
      type: 'input',
      name: 'walletId',
      message: 'Enter the wallet ID',
      default: dfnsConfig.walletId,
    },
    {
      type: 'input',
      name: 'walletPublicKey',
      message: 'Enter the wallet public key',
      default: process.env.WALLET_PUBLIC_KEY ?? '',
    },
    {
      type: 'input',
      name: 'walletHederaAccountId',
      message: 'Enter the wallet Hedera account ID',
      default: process.env.WALLET_HEDERA_ACCOUNT_ID ?? '',
    },
  ]);
  return new DfnsExampleConfig(
    new DFNSConfig(
      readFileSync(dfnsParams.dfnsServiceAccountPrivateKeyPath, 'utf8'),
      dfnsParams.serviceAccountCredentialId,
      dfnsParams.serviceAccountAuthToken,
      dfnsParams.appOrigin,
      dfnsParams.appId,
      dfnsParams.baseUrl,
      dfnsParams.walletId,
    ),
    dfnsParams.walletHederaAccountId,
    dfnsParams.walletPublicKey,
  );
}

async function askFireblocksParams(): Promise<FireblocksConfig> {
  const fireblocksParams: Answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter the Fireblocks API key',
      default: fireblocksConfig.apiKey,
    },
    {
      type: 'input',
      name: 'apiSecretKeyPath',
      message: 'Enter the path to the Fireblocks API secret key',
      default: DEFAULT_FIREBLOCKS_API_SECRET_KEY_PATH,
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'Enter the Fireblocks base URL',
      default: fireblocksConfig.baseUrl,
    },
    {
      type: 'input',
      name: 'vaultAccountId',
      message: 'Enter the Fireblocks vault account ID',
      default: fireblocksConfig.vaultAccountId,
    },
    {
      type: 'input',
      name: 'assetId',
      message: 'Enter the Fireblocks asset ID',
      default: fireblocksConfig.assetId,
    },
  ]);
  return new FireblocksConfig(
    fireblocksParams.apiKey,
    readFileSync(fireblocksParams.apiSecretKeyPath, 'utf8'),
    fireblocksParams.baseUrl,
    fireblocksParams.vaultAccountId,
    fireblocksParams.assetId,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
