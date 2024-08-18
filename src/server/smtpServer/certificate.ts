import { jsonDB } from "../jsonDB.ts";
import selfsigned from 'selfsigned';

export async function ensureCertificate() {
    if (JSON.stringify(jsonDB.data.certificate.config) === JSON.stringify(jsonDB.data.config)) {
        return;
    }

    const attributes = [{ name: 'commonName', value: jsonDB.data.config.mainDomain }]; // Only CN

    const options: selfsigned.SelfsignedOptions = {
        keySize: 2048, // Key size in bits
        days: 365 * 200, // Validity period in days
        algorithm: 'sha256', // Hashing algorithm
    };

    if (jsonDB.data.config.altDomains.length) {
        options.extensions = {
            name: 'subjectAltName',
            altNames: jsonDB.data.config.altDomains.map((domain) => ({ type: 2, value: domain })),
        } as any;
    }

    const pems = selfsigned.generate(attributes, options);

    await jsonDB.update(data => {
        data.certificate = {
            config: structuredClone(jsonDB.data.config),
            ...pems
        };
    });
}