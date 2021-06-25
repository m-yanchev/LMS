// @flow

import mailer from "nodemailer"
import {TEACHER} from "../common/constants";
const path = require('path');

export type UserPostTransportProps = {
    email: string,
    subject: string,
    html: string,
    attachments?: PostAttachments
}

export type AdminPostTransportProps = {
    subject: string,
    message: string
}

export type PostAttachments = {
    path: string,
    fileNames: Array<string>
}

export interface PostTransportInterface {
    +send: UserPostTransportProps => Promise<void>,
    +sendInfoToTeacher: AdminPostTransportProps => Promise<void>
}

class PostTransport {

    static send(props: UserPostTransportProps): Promise<void> {

        const {email, subject, html, attachments} = props

        return new Promise ((resolve, reject) => {

            const from = 'info@tetradkavkletochku.ru'

            const transporter = {
                host: "mail.tetradkavkletochku.ru",
                port: 465,
                secure: true,
                auth: {
                    user: from,
                    pass: 'Ks%wpA-4GQyZ'
                },
                tls: {
                    rejectUnauthorized: false
                }
            }

            const contacts = `` +
                `<p><br/>С Уважением,<br/>` +
                `${TEACHER.name}<br/>` +
                `${TEACHER.phone}<br/>` +
                `${TEACHER.email}<br/>` +
                `${TEACHER.skype}</p>`

            const transport = mailer.createTransport(transporter)
            const mailOptions = {
                from,
                to: email,
                subject,
                html: html + contacts,
                attachments: attachments ? attachments.fileNames.map(fileName => ({
                    path: path.join(attachments.path, fileName),
                    fileName
                })) : []
            };

            transport.sendMail(mailOptions, e => {
                if (e) {
                    reject(e)
                    console.log("reject")
                } else {
                    resolve()
                }
            });
        })
    }

    static sendInfoToTeacher(props: AdminPostTransportProps): Promise<void> {

        const {message, subject} = props

        const _subject = process.env.NODE_ENV === 'production' ? subject : subject + "Test"
        const html = `<p>${message}</p>`
        const email = "nu.yanchev@gmail.com"
        return PostTransport.send({email, html, subject: _subject})
    }

}

export default PostTransport