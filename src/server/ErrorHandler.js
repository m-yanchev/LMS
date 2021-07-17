import PostTransport from "./PostTransport";
import {formatDateTime} from "../depricated/common/DateTime";
import Logging from "./WinstonLogger/Logging";
const HTMLTemplateCreator = require("./HTMLTemplateCreator")

export function sendErrorSitePage(error, options = {}) {
    return (req, res) => {
        try {
            HTMLTemplateCreator.sendErrorSitePage()(req,res)
            sendToTeacher(error, options)
        } catch (e) {
            console.error(e)
        }
    }
}

export function sendError(error, status = 500, options = {}) {
    return (req, res) => {
        console.error(error)
        res.sendStatus(status)
        sendToTeacher(error, options)
    }
}

export function sendErrorToTeacher(error){
    return (req, res) => {
        const {variables, ...rest} = req.body
        let oVariables = {}
        try {
            oVariables = variables ? JSON.parse(variables) : {}
        } catch (e) {
            console.warn(new Error ("Недопустимый формат variables"))
        } finally {
            sendToTeacher(error, {post: true, log: {variables: oVariables, ...rest}})
            res.status(200).send({ok: true})
        }
    }
}

export function sendToTeacher(error, {post, log}) {
    if (post && process.env.NODE_ENV === 'production')
        PostTransport.sendInfoToTeacher("Ошибка в приложении!!!", "Error").catch(e => console.error(e))
    const logger = Logging()
    if (log) {
        logger.error(`${
            formatDateTime(Date.now())
        }\t${
            log.module ? log.module + ":\t" : ""
        }${
            log.method ? log.method + ":\t" : ""
        }${
            log.message ? log.message + ",\t" : error && error.message ? error.message + ",\t" : ""
        }${
            (Array.isArray(log["variables"]) ? log["variables"] : []).reduce((prevValue, variable) =>
                prevValue + `${variable.name}:\t${variable.value},\t`
                , "")
        }`)
    }
}