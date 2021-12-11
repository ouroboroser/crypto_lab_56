const JSSalsa20 = require('js-salsa20');
const randomstring = require('randomstring');

import { KeyManagementServiceClient } from '@google-cloud/kms';
import { config } from '../../config';
import { toArrayBuffer } from './convertArray';

const client = new KeyManagementServiceClient();

export class DataProtection {
    readonly key: string;

    readonly projectId: string;
    readonly locationId: string;
    readonly keyRingId: string;
    readonly keyId: string;

    constructor() {
        this.key = config.key;

        this.projectId = config.kms.projectId;
        this.locationId = config.kms.locationId;
        this.keyRingId = config.kms.keyRingId;
        this.keyId = config.kms.keyId;
    };

    encrypt(property: string) {
        const encoder = new TextEncoder();

        const convertedKey = encoder.encode(this.key);
        const convertedNonce = encoder.encode(randomstring.generate(8));
        const convertedProperty = encoder.encode(property);

        const encrypt = new JSSalsa20(convertedKey, convertedNonce).encrypt(convertedProperty);

        return {
            encrypt,
            propertyKey: convertedNonce,
        };
    };

    decrypt(property: Buffer, propertyKey: Buffer) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const decrypt = new JSSalsa20(encoder.encode(this.key), propertyKey).decrypt(property);

        const decryptToString = decoder.decode(decrypt);

        return decryptToString;
    };

    async kmsEncrypt(property: string) {

        const keyName = client.cryptoKeyPath(this.projectId, this.locationId, this.keyRingId, this.keyId);
        
        const [encryptResponse] = await client.encrypt({
            name: keyName,
            plaintext: new TextEncoder().encode(property),
        });

        return toArrayBuffer(encryptResponse.ciphertext);
    };

    async kmsDecrypt(property: Buffer) {
        const keyName = client.cryptoKeyPath(this.projectId, this.locationId, this.keyRingId, this.keyId);

        const [decryptResponse] = await client.decrypt({
            name: keyName,
            ciphertext: property,
        });

        return decryptResponse.plaintext?.toString();
    };
};