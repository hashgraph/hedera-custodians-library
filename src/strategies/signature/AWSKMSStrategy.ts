import { ISignatureStrategy } from './ISignatureStrategy';
import { AWSKMSConfig } from '../config/AWSKMSConfig';
import { SignatureRequest } from '../../models/signature/SignatureRequest';
import { KMSClient, SignCommand, SignCommandInput } from '@aws-sdk/client-kms';

const SIGNING_ALGORITHM = "ECDSA_SHA_256";
const MESSAGE_TYPE = "DIGEST";

let kmsClient: KMSClient;

export class AWSKMSStrategy implements ISignatureStrategy {
  private readonly strategyConfig: AWSKMSConfig;

  constructor(strategyConfig: AWSKMSConfig) {
    this.strategyConfig = strategyConfig;
    kmsClient = new KMSClient({
      region: this.strategyConfig.awsRegion,
      credentials: {
        accessKeyId: this.strategyConfig.awsAccessKeyId,
        secretAccessKey: this.strategyConfig.awsSecretAccessKey,
      },
    });
  }

  async sign(request: SignatureRequest): Promise<Uint8Array> {
    const signingInput: SignCommandInput = {
      KeyId: process.env.AWS_KMS_KEY_ID!,
      SigningAlgorithm: SIGNING_ALGORITHM,
      MessageType: MESSAGE_TYPE,
      Message: request.getTransactionBytes(),
    };

    const command = new SignCommand(signingInput);
    const response = await kmsClient.send(command);

    if (!response.Signature) {
      throw new Error("Signature not found");
    }

    return new Uint8Array(response.Signature);
  }

}