import { simpleParser } from 'mailparser';
import { SMTPServer } from 'smtp-server';
import superjson from 'superjson';
import { jsonDB } from '../jsonDB.ts';
import { forwardEmail } from '../sendEmail/sendEmail.ts';
import { ensureCertificate } from './certificate.ts';
import { validateEmailFrom, validateEmailTo } from './validation.ts';

let activeServer: SMTPServer | null = null;

export async function startEmailServer() {
    if (activeServer) {
        await new Promise((resolve: any) => activeServer?.close(resolve));
    }
    await ensureCertificate();

    activeServer = new SMTPServer({
        secure: false,
        secured: true,
        authOptional: true,
        key: jsonDB.data.certificate.private,
        cert: jsonDB.data.certificate.cert,
        size: jsonDB.data.maxMessageSize,
        onMailFrom(address, _, callback) {
            if (!validateEmailFrom(address.address)) {
                const err = new Error("Invalid email address") as any;
                err.responseCode = 550;
                return callback(err);
            }

            return callback();
          },
        onRcptTo(address, session, callback) {
            if (!validateEmailTo(address.address)) {
                const err = new Error("Email domain is not registered") as any;
                err.responseCode = 550;
                return callback(err);
            }
            
            if (session.envelope.mailFrom) {
                const args: any = session.envelope.mailFrom.args;
                let expectedSize = Number(args.SIZE) || 0;
                if (expectedSize > jsonDB.data.maxMessageSize) {
                    const err = new Error("Message it too large") as any;
                    err.responseCode = 452;
                    return callback(err);
                }
            }

            callback();
        },
        onData(stream, _, callback) {
            if (jsonDB.data.redirectEmailsTo) {
                forwardEmail(stream).then((errors) => {
                    if (errors.length) {
                        console.error('Error forwarding email:', errors);
                    }
                });
            }

            simpleParser(stream, async (err, parsed) => {
                if (err) {
                    const error = new Error('Error parsing email') as any;
                    error.responseCode = 451;
                    return callback(error);
                }

                if(stream.sizeExceeded){
                    const error = new Error('Message is too large') as any;
                    error.responseCode = 452;
                    return callback(error);
                }

                parsed.attachments.forEach((attachment) => {
                    (attachment as any).content = attachment.content.toString('base64');
                });

                await jsonDB.update(data => {
                    data.emails.unshift(superjson.stringify(parsed));
                    if (data.emails.length > data.maxEmails) {
                        data.emails.pop();
                    }
                });

                callback();
            });
        },
    });

    activeServer.on("error", (err) => {
        console.error("Error %s", err.message);
    });

    activeServer.listen(25, '0.0.0.0', () => {
        console.log('SMTP server started');
    });
}