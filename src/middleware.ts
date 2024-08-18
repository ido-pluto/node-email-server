import astroForms from "@astro-utils/forms";
import { startEmailServer } from "./server/smtpServer/smtpServer.ts";
import { jsonDB } from "./server/jsonDB.ts";

await startEmailServer();
export const onRequest = astroForms({
    secret: process.env.WEBSITE_SECRET || jsonDB.data.sessionSecret,
});
