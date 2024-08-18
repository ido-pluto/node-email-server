import fsExtra from "fs-extra/esm";
import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = path.join(process.cwd(), 'storage', 'db.json');
await fsExtra.ensureDir(path.dirname(storage));


export const jsonDB = await JSONFilePreset(storage, {
    nodeEmailServerVersion: "1.0.0",
    emailServerPassword: uuidv4(),
    sessionSecret: uuidv4(),
    redirectEmailsTo: "",
    emails: [],
    maxEmails: 100,
    maxMessageSize: 1024 * 1024, // 1MB
    config: {
        mainDomain: "CHANGE_THIS_DOMAIN.com",
        altDomains: [] as string[]
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
});

export async function inDomains(domain: string){
    return jsonDB.data.config.mainDomain === domain || jsonDB.data.config.altDomains.includes(domain);
}