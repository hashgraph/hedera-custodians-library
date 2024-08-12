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

import { KMSClient, SignCommand, SignCommandInput } from '@aws-sdk/client-kms';
import {
  EcdsaAsn1Signature,
  ISignatureStrategy,
  AWSKMSConfig,
  SignatureRequest,
  calcKeccak256,
} from '../../../src';

const SIGNING_ALGORITHM = 'ECDSA_SHA_256';
const MESSAGE_TYPE = 'DIGEST';

export class AWSKMSStrategy implements ISignatureStrategy {
  private readonly strategyConfig: AWSKMSConfig;
  private readonly kmsClient: KMSClient;

  constructor(strategyConfig: AWSKMSConfig) {
    this.strategyConfig = strategyConfig;
    this.kmsClient = new KMSClient({
      region: this.strategyConfig.awsRegion,
      credentials: {
        accessKeyId: this.strategyConfig.awsAccessKeyId,
        secretAccessKey: this.strategyConfig.awsSecretAccessKey,
      },
    });
  }

  async sign(request: SignatureRequest): Promise<Uint8Array> {
    // Create keccak256 message digest
    const hash = calcKeccak256(request.getTransactionBytes());

    // Send digest to KMS for signing
    const signCommandInput = {
      Message: hash,
      KeyId: this.strategyConfig.awsKmsKeyId,
      SigningAlgorithm: SIGNING_ALGORITHM,
      MessageType: MESSAGE_TYPE,
    } as SignCommandInput;
    console.log('Signing with KMS:', signCommandInput);
    const command = new SignCommand(signCommandInput);
    const response = await this.kmsClient.send(command);
    if (!response || !response.Signature) {
      throw new Error('Signature not found');
    }

    // Parse the DER encoded signature to get the raw ECDSA signature
    const ecdsaSignature = EcdsaAsn1Signature.fromDER(
      Buffer.from(response.Signature)
    );
    // -- Concatenate the r and s values of the signature and remove the leading 0x00 byte if present
    const rawSignature = Buffer.concat([
      ecdsaSignature.r[0] == 0 ? ecdsaSignature.r.slice(1) : ecdsaSignature.r,
      ecdsaSignature.s[0] == 0 ? ecdsaSignature.s.slice(1) : ecdsaSignature.s,
    ]).valueOf();

    return rawSignature;
  }
}
