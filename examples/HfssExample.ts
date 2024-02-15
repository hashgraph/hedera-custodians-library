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

import path from 'path';
import { pathRegex } from '../config';
import Example from './Example';
import { readFileSync } from 'fs';
import {
  FileContentsQuery,
  FileCreateTransaction,
  FileId,
  Hbar,
  TransactionReceipt,
  TransactionResponse,
} from '@hashgraph/sdk';

/**
 * Represents an example class for working with HFSS files.
 */
export default class HfssExample extends Example {
  /**
   * Creates a new file and returns the file ID and its content.
   * @returns A promise that resolves to an object containing the new file ID and its content.
   */
  public async createNewFile(): Promise<{ newFileId: FileId; fileContent: string; }> {
    const { newFileId } = await this._createNewFile({
      filePathOrContent: 'This is the content of an example file',
    });
    const fileContent = await this._getFileContent({ fileId: newFileId });
    return { newFileId, fileContent };
  }

  /**
   * Retrieves the content of a file from the Hedera network.
   * @param fileId The ID of the file to retrieve the content from.
   * @returns A Promise that resolves to the content of the file as a string.
   * @throws An error if the file content was not retrieved or if the contents were not set in the response.
   */
  private async _getFileContent({
    fileId,
  }: {
    fileId: FileId;
  }): Promise<string> {
    console.log('📂 Getting the file content...');
    //Create the query
    const query = new FileContentsQuery().setFileId(fileId);

    //Sign with client operator private key and submit the query to a Hedera network
    const contents = Buffer.from(await query.execute(this.client)).toString(
      'utf-8',
    );

    if (contents === null) {
      throw new Error(
        '❌ File content was not retrieved. Contents were not set in the response',
      );
    }
    console.log('✅ The file content is: ' + contents);
    return contents;
  }

  /**
   * Creates a new file on the Hedera network.
   * @param filePathOrContent The path to the file or the content of the file.
   * @returns An object containing the new file ID, the response, and the receipt.
   * @throws Error if the file was not created or if the file ID was not set in the receipt.
   */
  private async _createNewFile({
    filePathOrContent,
  }: {
    filePathOrContent: string;
  }): Promise<{
    newFileId: FileId;
    response: TransactionResponse;
    receipt: TransactionReceipt;
  }> {
    console.log('📂 Creating a new file...');
    const fileContent = pathRegex.test(filePathOrContent)
      ? readFileSync(path.resolve(filePathOrContent), 'utf8')
      : filePathOrContent;

    const { privateKey: filePrivKey, publicKey: filePubKey } =
      await this._createKeyPair();
    //Create the transaction
    const transaction = new FileCreateTransaction()
      .setKeys([filePubKey]) //A different key then the client operator key
      .setContents(fileContent)
      .setMaxTransactionFee(new Hbar(2))
      .freezeWith(this.client);

    //Sign with the file private key
    const signTx = await transaction.sign(filePrivKey);

    //Sign with the client operator private key and submit to a Hedera network
    const submitTx = await signTx.execute(this.client);

    //Request the receipt
    const receipt = await submitTx.getReceipt(this.client);

    //Get the file ID
    const newFileId = receipt.fileId;
    if (newFileId === null) {
      throw new Error(
        '❌ File was not created. File ID was not set in the receipt',
      );
    }
    console.log('✅ The new file ID is: ' + newFileId);
    return { newFileId, response: submitTx, receipt };
  }
}
