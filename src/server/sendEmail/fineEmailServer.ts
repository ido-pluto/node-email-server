import type { AddressObject } from "mailparser";
import dns from 'dns';
import type { Address } from "nodemailer/lib/mailer/index";

export function getEmailsFromAddressObject(emails?: AddressObject | AddressObject[]) {
    if (!emails) return [];
    return Array.from(new Set([emails].flat().map(x => x.value.map(x => x.address)).flat()));
}

export function getEmailsFromOptions(emails?: string | Address | Array<string | Address>) {
    if (!emails) return [];
    return Array.from(new Set([emails].flat()));
}

export async function resolveEmails(allEmails: (string | Address)[]): Promise<{ [host: string]: (string | Address)[]; }> {
    if (!allEmails.length) return {};

    const allDomains = Array.from(new Set(allEmails.map(x => typeof x === 'string' ? x : x.address).map(x => x.split('@')?.[1]).filter(Boolean)));
    const promises: Promise<[string, string]>[] = allDomains.map(domain => new Promise((resolve) => {
        dns.resolveMx(domain, (err, addresses) => {
            if (err) {
                return resolve([domain, domain]);
            }

            const bestAddress = addresses.sort((a, b) => a.priority - b.priority)[0];
            resolve([domain, bestAddress.exchange]);
        });
    }));

    const foundMxRecords = await Promise.all(promises);
    const hostEntries = foundMxRecords.map(([domain, host]) => {
        const foundEmails = allEmails.filter(x => (typeof x === 'string' ? x : x.address).endsWith('@' + domain));
        const uniqueEmails = foundEmails.filter((email, index) => foundEmails.findIndex(x => (typeof x === 'string' ? x : x.address) === email) === index);
        return [host, uniqueEmails];
    });
    return Object.fromEntries(hostEntries);
}

export async function findServerIP(hostname: string) {
    return new Promise<{address: string, isIPv6: boolean}>((resolve) => {
        dns.lookup(hostname, (err, address) => {
            if (err) {
                return resolve(null);
            }

            const isIPv6 = address.includes(':');
            resolve({
                address,
                isIPv6
            });
        });
    });
}