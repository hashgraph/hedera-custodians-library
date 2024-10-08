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

import { SignatureRequest } from '../../../src';

/**
 * Represents a signature strategy for signing requests.
 */
export interface ISignatureStrategy {
  /**
   * Signs the provided signature request.
   * @param request The signature request to be signed.
   * @returns A promise that resolves to the signed data as a Uint8Array.
   */
  sign(request: SignatureRequest): Promise<Uint8Array>;
}
