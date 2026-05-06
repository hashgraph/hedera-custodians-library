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

// asn1-ts is a CJS module with __esModule:true but no `export default`.
// - Node.js ESM strict: named imports fail; `import * as ns` gives ns.default = module.exports
// - Webpack: `import * as ns` exposes named exports directly; ns.default = undefined
// The `ns.default ?? ns` pattern handles both environments correctly.
import type * as asn1tsTypes from 'asn1-ts';
import * as asn1tsNamespace from 'asn1-ts';

type ASN1Element = asn1tsTypes.ASN1Element;
type DERElement = asn1tsTypes.DERElement;

const asn1ts = (asn1tsNamespace as any).default ?? asn1tsNamespace;
const { ASN1TagClass, ASN1UniversalType, DERElement } =
  asn1ts as unknown as typeof asn1tsTypes;

/**
 * Represents an ECDSA ASN.1 signature.
 */
export class EcdsaAsn1Signature {
  r: Uint8Array;
  s: Uint8Array;

  constructor(r: Uint8Array, s: Uint8Array) {
    this.r = r;
    this.s = s;
  }

  static fromElement(element: ASN1Element): EcdsaAsn1Signature {
    const sequence = (element as DERElement).sequence;
    if (
      sequence.length !== 2 ||
      !(sequence[0] instanceof DERElement) ||
      !(sequence[1] instanceof DERElement)
    ) {
      throw new Error('Invalid EcdsaSig ASN.1 element');
    }

    const r = (sequence[0] as DERElement).value;
    const s = (sequence[1] as DERElement).value;
    return new EcdsaAsn1Signature(r, s);
  }

  static fromDER(buffer: ArrayBuffer): EcdsaAsn1Signature {
    const element = new DERElement();
    element.fromBytes(new Uint8Array(buffer));
    return EcdsaAsn1Signature.fromElement(element);
  }

  toBytes(): Buffer {
    const rElement = new DERElement();
    rElement.tagClass = ASN1TagClass.universal;
    rElement.tagNumber = ASN1UniversalType.integer;
    rElement.value = this.r;

    const sElement = new DERElement();
    sElement.tagClass = ASN1TagClass.universal;
    sElement.tagNumber = ASN1UniversalType.integer;
    sElement.value = this.s;

    const sequenceElement = new DERElement();
    sequenceElement.tagClass = ASN1TagClass.universal;
    sequenceElement.tagNumber = ASN1UniversalType.sequence;
    sequenceElement.sequence = [rElement, sElement];

    return sequenceElement.toBytes();
  }
}
