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

import {
  ContractCreateFlow,
  ContractId,
  ContractInfo,
  ContractInfoQuery,
  TransactionReceipt,
  TransactionResponse,
} from '@hashgraph/sdk';
import Example from './Example';

const STORAGE_BYTECODE =
  '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100d9565b60405180910390f35b610073600480360381019061006e919061009d565b61007e565b005b60008054905090565b8060008190555050565b60008135905061009781610103565b92915050565b6000602082840312156100b3576100b26100fe565b5b60006100c184828501610088565b91505092915050565b6100d3816100f4565b82525050565b60006020820190506100ee60008301846100ca565b92915050565b6000819050919050565b600080fd5b61010c816100f4565b811461011757600080fd5b5056fea26469706673582212200ca7b087bda2da36b05d19dbb10f84bcaee76702575126320bf4df83cb15539564736f6c63430008070033';

/**
 * Represents an example class for interacting with smart contracts on the Hedera network.
 */
export default class HscsExample extends Example {
  /**
   * Creates a new smart contract.
   * @returns A promise that resolves to a ContractInfo object.
   */
  public async createSmartContract(): Promise<ContractInfo> {
    const { newContractId } = await this._createSmartContract({
      bytecode: STORAGE_BYTECODE,
    });
    const contractInfo = await this.getContractInfo({
      contractId: newContractId,
    });
    console.log('📄 Smart Constract details: ', contractInfo);
    return contractInfo;
  }

  /**
   * Retrieves information about a contract.
   * @param contractId The ID of the contract.
   * @returns A Promise that resolves to the ContractInfo object.
   */
  public async getContractInfo({
    contractId,
  }: {
    contractId: ContractId;
  }): Promise<ContractInfo> {
    //Create the query
    const query = new ContractInfoQuery().setContractId(contractId);
    //Sign the query with the client operator private key and submit to a Hedera network
    const info = await query.execute(this.client);
    return info;
  }

  /**
   * Creates a new smart contract on the Hedera network.
   * @param bytecode The bytecode of the smart contract.
   * @returns A promise that resolves to an object containing the new contract ID, the transaction response, and the receipt.
   * @throws An error if the contract creation fails.
   */
  private async _createSmartContract({
    bytecode,
  }: {
    bytecode: string;
  }): Promise<{
    newContractId: ContractId;
    response: TransactionResponse;
    receipt: TransactionReceipt;
  }> {
    console.log('Creating a new smart contract...');
    // Create a new smart contract transaction with the bytecode
    const contractCreate = new ContractCreateFlow()
      .setGas(100000)
      .setBytecode(bytecode);

    // Sign the transaction with the client operator key and submit to a Hedera network
    const txResponse = await contractCreate.execute(this.client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(this.client);

    //Get the new contract ID
    const newContractId = receipt.contractId;
    if (newContractId == null) {
      throw new Error('❌ Failed to create new contract. Contract ID is null');
    }
    console.log('✅ Smart contract created with ID ' + newContractId);
    return { newContractId, response: txResponse, receipt };
  }
}
