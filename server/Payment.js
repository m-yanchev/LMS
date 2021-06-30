import {sendErrorSitePage, sendToTeacher} from "./ErrorHandler";
import Payment from "../rules/Payment";
import {makeResponse} from "./Schema/Schema";
import HTTPRequest from "./HTTPRequest";
import PostTransport from "./PostTransport";

export async function create(req, res) {

    try {
        const {body, user} = req
        if (user.access === "common") res.redirect("/")
        const {service, serviceId, returnURL} = body
        const count = Number(body.count)

        await Payment.create({
            serviceId,
            service,
            count,
            returnURL,
            userId: user.id,
            makeResponse,
            httpRequestMethod: HTTPRequest.send,
            redirect: url => res.redirect(url)
        })

    } catch (e) {
        const options = {
            post: true,
            log: {
                module: "Payment",
                method: "create",
                variables: [
                    {name: "userId", value: req.user.id},
                    {name: "service", value: req.body.service},
                    {name: "price", value: req.body.price},
                    {name: "count", value: req.body.count}
                ]
            }
        }
        sendErrorSitePage(e, options)(req, res)
    }
}

export async function message(req, res) {

    res.sendStatus(200)

    messagePayment(req.body.object).catch(e => {
        const options = {
            post: true,
            log: {
                module: "Payment",
                method: "message",
                variables: [{name: "paymentId", value: req.body.object && req.body.object.id}]
            }
        }
        sendToTeacher(e, options)
    })

    async function messagePayment({id}) {
        await Payment.make({id, makeResponse, httpRequestMethod: HTTPRequest.send, PostTransport})
    }
}