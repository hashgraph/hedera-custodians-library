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

import { TopicCreateTransaction } from '@hashgraph/sdk';
import Example from './Example';

/**
 * Represents an example class for HCS (Hedera Consensus Service).
 */
export default class HcsExample extends Example {
  /**
   * Creates a topic.
   * @returns A promise that resolves when the topic is created.
   */
  public async createTopic(): Promise<void> {
    return this._createTopic();
  }

  /**
   * Creates a new topic.
   * @returns A promise that resolves when the topic is created.
   */
  private async _createTopic(): Promise<void> {
    console.log('Creating a new Topic...');
    //Create the transaction
    const transaction = new TopicCreateTransaction();

    //Sign with the client operator private key and submit the transaction to a Hedera network
    const txResponse = await transaction.execute(this.client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(this.client);

    //Get the topic ID
    const newTopicId = receipt.topicId;
    if (newTopicId == null) {
      throw new Error('❌ Cannot create new Topic. Topic ID is null');
    }
    console.log('✅ The new topic ID is ' + newTopicId);
  }
}
