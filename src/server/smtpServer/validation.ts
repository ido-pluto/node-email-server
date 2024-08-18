import { inDomains } from "../jsonDB.ts";

export function getEmailDomain(email: string) {
    return email?.split('@')?.[1] || '';
}

export function validateEmailTo(address: string[]) {
    for(const email of address) {
        const domain = getEmailDomain(email);
        if(!inDomains(domain)) {
            return false;
        }
    }
    
    return true;
}

export function validateEmailFrom(address: string) {
    const domain = getEmailDomain(address);
    return domain.length > 0;
}