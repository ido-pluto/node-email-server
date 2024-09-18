import fsExtra from "fs-extra/esm";
import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = path.join(process.cwd(), 'storage', 'db.json');
await fsExtra.ensureDir(path.dirname(storage));

const DEFAULT_CONFIG = {
    nodeEmailServerVersion: "1.0.0",
    emailServerPassword: uuidv4(),
    sessionSecret: uuidv4(),
    redirectEmailsTo: "",
    doNotForwardEmailsSentTo: ["dmarc-reports"],
    doNotForwardEmailsFrom: [] as string[],
    rejectEmailsFrom: [] as string[],
    emails: [],
    maxEmails: 100,
    maxMessageSize: 1024 * 1024, // 1MB
    config: {
        mainDomain: "CHANGE_THIS_DOMAIN.com",
        altDomains: [] as string[],
    },
    certificate: {
        config: {
            mainDomain: "",
            altDomains: [],
        },
        private: "",
        public: "",
        cert: "",
    }
}


export const jsonDB = await JSONFilePreset(storage, DEFAULT_CONFIG);
Object.assign(jsonDB.data, {...DEFAULT_CONFIG, ...jsonDB.data});

export function inDomains(domain: string){
    return jsonDB.data.config.mainDomain === domain || jsonDB.data.config.altDomains.includes(domain);
}