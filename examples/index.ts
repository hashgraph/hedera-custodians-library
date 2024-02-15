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

import inquirer, { Answers } from 'inquirer';
import {
  DEFAULT_DFNS_SERVICE_ACCOUNT_PRIVATE_KEY,
  DEFAULT_FIREBLOCKS_API_SECRET_KEY,
  dfnsConfig,
  fireblocksConfig,
} from '../config';
import { DFNSConfig, FireblocksConfig } from 'index';
import { readFileSync } from 'fs';
import Example from './Example';
import ExampleConfig from './ExampleConfig';
import HtsExample from './HtsExample';
import KeyListExample from './KeyListExample';
import HscsExample from './HscsExample';
import HfssExample from './HfssExample';

async function main(): Promise<void> {
  console.log('👋 Welcome to the Hedera Custodians Integration example');
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
  let example: Example;
  let htsExample: HtsExample;
  let hscsExample: HscsExample;
  let keyListExample: KeyListExample;
  let hfssExample: HfssExample;
  switch (custodialAnwsers.custodialService) {
    case 'Dfns':
      if (custodialAnwsers.useEnvVars) {
        example = new Example(
          dfnsConfig,
          process.env.DFNS_WALLET_HEDERA_ACCOUNT_ID ?? '',
          process.env.DFNS_WALLET_PUBLIC_KEY ?? '',
        );
        htsExample = new HtsExample(
          dfnsConfig,
          process.env.DFNS_WALLET_HEDERA_ACCOUNT_ID ?? '',
          process.env.DFNS_WALLET_PUBLIC_KEY ?? '',
        );
        hscsExample = new HscsExample(
          dfnsConfig,
          process.env.DFNS_WALLET_HEDERA_ACCOUNT_ID ?? '',
          process.env.DFNS_WALLET_PUBLIC_KEY ?? '',
        );
        hfssExample = new HfssExample(
          dfnsConfig,
          process.env.DFNS_WALLET_HEDERA_ACCOUNT_ID ?? '',
          process.env.DFNS_WALLET_PUBLIC_KEY ?? '',
        );
        keyListExample = new KeyListExample(
          dfnsConfig,
          process.env.DFNS_WALLET_HEDERA_ACCOUNT_ID ?? '',
          process.env.DFNS_WALLET_PUBLIC_KEY ?? '',
        );
      } else {
        const dfnsParams = await askDfnsParams();
        example = new Example(dfnsParams);
        htsExample = new HtsExample(dfnsParams);
        hscsExample = new HscsExample(dfnsParams);
        hfssExample = new HfssExample(dfnsParams);
        keyListExample = new KeyListExample(dfnsParams);
      }
      break;
    case 'Fireblocks':
      throw new Error('❌ 🥵 Fireblocks is not implemented yet'); // TODO
      if (custodialAnwsers.useEnvVars) {
        example = new Example(
          fireblocksConfig,
          process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID ?? '',
          process.env.FIREBLOCKS_PUBLIC_KEY ?? '',
        );
        htsExample = new HtsExample(
          fireblocksConfig,
          process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID ?? '',
          process.env.FIREBLOCKS_PUBLIC_KEY ?? '',
        );
        hscsExample = new HscsExample(
          fireblocksConfig,
          process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID ?? '',
          process.env.FIREBLOCKS_PUBLIC_KEY ?? '',
        );
        hfssExample = new HfssExample(
          fireblocksConfig,
          process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID ?? '',
          process.env.FIREBLOCKS_PUBLIC_KEY ?? '',
        );
        keyListExample = new KeyListExample(
          fireblocksConfig,
          process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID ?? '',
          process.env.FIREBLOCKS_PUBLIC_KEY ?? '',
        );
      } else {
        const fireblocksParams = await askFireblocksParams();
        example = new Example(fireblocksParams);
        htsExample = new HtsExample(fireblocksParams);
        hscsExample = new HscsExample(fireblocksParams);
        hfssExample = new HfssExample(fireblocksParams);
        keyListExample = new KeyListExample(fireblocksParams);
      }
      break;

    default:
      throw new Error(
        '❌ 🐛 Invalid custodial service. You should not be able to get here 🧐.',
      );
  }

  //* Ask for the action to perform
  let exit = false;
  do {
    const actionAnwsers: Answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What action do you want to perform?',
        choices: [
          '🔑 [HTS] Create new Hedera Account',
          '🔷 [HTS] Create new Hedera Token',
          '🚀 [HTS] Interact with Hedera Token (New account, new hedera token, associate account and transfer token amount)',
          '📄 [HSCS] Create new Smart Contract (Storage example)',
          '📂 [HFSS] Create new File',
          '🔑🔑 [KeyList] Transfer Hbar from Custodial KeyList',
          '🔴 Exit',
        ],
        default:
          '🚀 Interact with Hedera Token (New account, new hedera token, associate account and transfer token amount)',
      },
    ]);
    switch (actionAnwsers.action) {
      case '🔑 [HTS] Create new Hedera Account':
        await example.createAccount();
        break;
      case '🔷 [HTS] Create new Hedera Token':
        await htsExample.createNewHederaToken(await askTokenInfo());
        break;
      case '🚀 [HTS] Interact with Hedera Token (New account, new hedera token, associate account and transfer token amount)':
        await htsExample.interactWithHederaToken(await askTokenInfo());
        break;
      case '📄 [HSCS] Create new Smart Contract (Storage example)':
        await hscsExample.createSmartContract();
        break;
      case '📂 [HFSS] Create new File':
        await hfssExample.createNewFile();
        break;
      case '🔑🔑 [KeyList] Transfer Hbar from Custodial KeyList':
        await keyListExample.mainExample();
        break;
      case '🔴 Exit':
        console.log('👋 Goodbye');
        exit = true;
        break;
      default:
        throw new Error(
          '❌ 🐛 Invalid action. You should not be able to get here 🧐.',
        );
    }
  } while (!exit);

  //* END
  process.exit(0);
}

async function askDfnsParams(): Promise<ExampleConfig> {
  const dfnsParams: Answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'dfnsServiceAccountPrivateKeyPath',
      message: 'Enter the path to the service account private key',
      default: DEFAULT_DFNS_SERVICE_ACCOUNT_PRIVATE_KEY,
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
      default: process.env.DFNS_WALLET_PUBLIC_KEY ?? '',
    },
    {
      type: 'input',
      name: 'walletHederaAccountId',
      message: 'Enter the wallet Hedera account ID',
      default: process.env.DFNS_WALLET_HEDERA_ACCOUNT_ID ?? '',
    },
  ]);
  return new ExampleConfig(
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

async function askFireblocksParams(): Promise<ExampleConfig> {
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
      default: DEFAULT_FIREBLOCKS_API_SECRET_KEY,
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
    {
      type: 'input',
      name: 'hederaAccountId',
      message: 'Enter the Hedera account ID',
      default: process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID ?? '',
    },
    {
      type: 'input',
      name: 'publicKey',
      message: 'Enter the wallet public key',
      default: process.env.FIREBLOCKS_PUBLIC_KEY ?? '',
    },
  ]);
  return new ExampleConfig(
    new FireblocksConfig(
      fireblocksParams.apiKey,
      readFileSync(fireblocksParams.apiSecretKeyPath, 'utf8'),
      fireblocksParams.baseUrl,
      fireblocksParams.vaultAccountId,
      fireblocksParams.assetId,
    ),
    fireblocksParams.hederaAccountId,
    fireblocksParams.publicKey,
  );
}

async function askTokenInfo(): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  initSupply: number;
}> {
  const tokenInfo: Answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the token name',
      default: 'Hedera Stablecoin',
    },
    {
      type: 'input',
      name: 'symbol',
      message: 'Enter the token symbol',
      default: 'HSC',
    },
    {
      type: 'input',
      name: 'decimals',
      message: 'Enter the token decimals',
      default: 8,
    },
    {
      type: 'input',
      name: 'initialSupply',
      message: 'Enter the token initial supply',
      default: 100000000,
    },
    {
      type: 'input',
      name: 'transferAmount',
      message: 'Enter the transfer amount',
      default: 120,
    },
  ]);
  // * Confirmation loop
  const conf: Answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `🟠 Are this values correct?
          Name: ${tokenInfo.name}
          Symbol: ${tokenInfo.symbol}
          Decimals: ${tokenInfo.decimals}
          Initial Supply: ${tokenInfo.initialSupply}
          Transfer Amount: ${tokenInfo.transferAmount}
      `,
      default: true,
    },
  ]);
  if (!conf.confirm) {
    return await askTokenInfo();
  }

  return {
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    decimals: tokenInfo.decimals,
    initSupply: tokenInfo.initialSupply,
  };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
