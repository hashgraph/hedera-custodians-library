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

import { describe, expect, it } from '@jest/globals';
import { EcdsaAsn1Signature } from '../../src';

describe('🧪 EcdsaAsn1Signature TESTS', () => {
  it('should create an instance with r and s values', () => {
    const r = new Uint8Array([1, 2, 3]);
    const s = new Uint8Array([4, 5, 6]);
    const signature = new EcdsaAsn1Signature(r, s);
    expect(signature.r).toEqual(r);
    expect(signature.s).toEqual(s);
  });

  it('should create an instance from DER buffer', () => {
    const derBytesHex =
      '302d300706052b8104000a032200022c259347c9eee7980e7a83fee34dabcc4bf0887171bb4f1875b8608d67a819d3';
    const signature = EcdsaAsn1Signature.fromDER(
      Buffer.from(derBytesHex, 'hex')
    );
    expect(signature.r).toBeInstanceOf(Uint8Array);
    expect(signature.r.length).toBeGreaterThan(2);
    expect(signature.s).toBeInstanceOf(Uint8Array);
    expect(signature.s.length).toBeGreaterThan(2);
  });

  it('should convert to bytes', () => {
    const r = new Uint8Array([1, 2, 3]);
    const s = new Uint8Array([4, 5, 6]);
    const signature = new EcdsaAsn1Signature(r, s);
    const bytes = signature.toBytes();
    const expectedBytes = Buffer.from(
      new Uint8Array([48, 10, 2, 3, 1, 2, 3, 2, 3, 4, 5, 6])
    );
    console.log('bytes', bytes, 'expectedBytes', expectedBytes);
    expect(bytes).toEqual(expectedBytes);
  });
});
