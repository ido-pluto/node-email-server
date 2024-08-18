import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer/index';
import type { SMTPServerDataStream } from 'smtp-server';
import { getEmailsFromOptions, resolveEmails } from './fineEmailServer.ts';
import { inDomains, jsonDB } from '../jsonDB.ts';
import { getEmailDomain } from '../smtpServer/validation.ts';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index';

function connect(host: string) {
    return nodemailer.createTransport({
        host,
        port: 25,
        secure: false,
        requireTLS: true,
        tls: {
            rejectUnauthorized: false,
        }
    });
}

export async function sendEmail(emailOptions: Mail.Options, customSend?: (connect:  nodemailer.Transporter<SMTPTransport.SentMessageInfo>) => Promise<any> | null, validateOrigin = true) {
    const allEmailsAsStrings = getEmailsFromOptions(emailOptions.to || emailOptions.envelope.to);
    const resolvedEmails = await resolveEmails(allEmailsAsStrings);

    const fromSource = emailOptions.from || emailOptions.envelope.from as string;
    const getFrom = typeof fromSource === 'object' ? fromSource.address : fromSource;
    const sendFromDomain = getEmailDomain(getFrom) || jsonDB.data.config.mainDomain;

    if (validateOrigin && !inDomains(sendFromDomain)) {
        return [{
            error: "This domain is not registered in the system"
        }];
    }

    const promises: Promise<any>[] = [];
    for (const [host, emails] of Object.entries(resolvedEmails)) {
        const transporter = connect(host);
        promises.push(
            customSend?.(transporter) || transporter.sendMail({
                ...emailOptions,
                to: emails,
                dkim: {
                    domainName: getEmailDomain(getFrom) || jsonDB.data.config.mainDomain,
                    keySelector: 'default',
                    privateKey: jsonDB.data.certificate.private,
                },
            })
        );
    }

    const results = await Promise.allSettled(promises);
    const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason);

    return errors;
}

export async function forwardEmail(emailStream: SMTPServerDataStream) {
    try {
        const buffers = await emailStream.toArray();
        const buffer = Buffer.concat(buffers);

        const sendData: Mail.Options = {
            envelope: {
                from: `forwarded@${jsonDB.data.config.mainDomain}`,
                to: jsonDB.data.redirectEmailsTo,
            },
            raw: buffer
        };

        const result = await sendEmail(sendData, connect => connect.sendMail(sendData), false);
        return result;
    } catch (error) {
        console.error('Error forwarding email:', error);
        return [{
            message: error.message,
        }];
    }
}