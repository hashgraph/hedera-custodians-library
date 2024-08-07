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

/**
 * Converts a hexadecimal string to a Uint8Array.
 *
 * @param hexString - The hexadecimal string to convert.
 * @returns The Uint8Array representation of the hexadecimal string.
 */

import { keccak256 } from 'ethereum-cryptography/keccak';

export function hexStringToUint8Array({
  hexString,
}: {
  hexString: string;
}): Uint8Array {
  const uint8Array = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    const decimal = parseInt(hexString.substring(i, i + 2), 16);
    uint8Array[i / 2] = decimal;
  }
  return uint8Array;
}

export function calcKeccak256(message: Uint8Array): Buffer {
  return Buffer.from(keccak256(message));
}

export function uint8ArrayToHexString(uint8ArrayKey: Uint8Array): string {
  return Array.from(uint8ArrayKey, (byte) =>
    ('0' + byte.toString(16)).slice(-2)
  ).join('');
}
