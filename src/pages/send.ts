import { ExpressRoute } from "@astro-utils/express-endpoints";
import { jsonDB } from "../server/jsonDB.ts";
import { sendEmail } from "../server/sendEmail/sendEmail.ts";

const router = new ExpressRoute();

export const POST = router.route(async (req, res) => {
    if(req.body.password !== jsonDB.data.emailServerPassword) {
        return res.status(401).send("Invalid password");
    }

    delete req.body.password;
    res.json(await sendEmail(req.body));
});