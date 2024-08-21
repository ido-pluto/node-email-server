import { inDomains } from "../jsonDB.ts";

export function getEmailDomain(email: string) {
    return email?.split('@')?.[1] || '';
}

export function validateEmailTo(email: string) {
    const domain = getEmailDomain(email);
    return inDomains(domain);
}

export function validateEmailFrom(address: string) {
    const domain = getEmailDomain(address);
    return domain.length > 0;
}