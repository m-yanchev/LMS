import React from "react"
import ReactDOMServer from "react-dom/server"
import template from "../client/ReactApp/template"
import ContentMainView from "../client/entryPoints/main/components/views/ContentMainView"
import Landing from "../client/entryPoints/landing/Landing"
import Course from "../client/ReactApp/smartComponents/course/Course";
import {ServerStyleSheets} from '@material-ui/core/styles';
import AppData from "../depricated/rules/AppData";
import {makeResponse} from "./Schema/Schema";
import {COMPACT_COURSE_QUERY, CONTENT_QUERY, FULL_COURSE_QUERY} from "./Schema/schemaQueries";

const ErrorHandler = require("./ErrorHandler")

export function sendLegalSitePage(legalType) {
    return function (req, res) {
        sendSitePage({legalType})(req, res).catch(e => {
            console.error(e)
            const log = {
                module: "HTMLTemplateCreator",
                method: "sendLegalSitePage.sendSitePage",
                variables: [{name: "legalType", value: legalType}]
            }
            ErrorHandler.sendErrorSitePage(e, {post: true, log})(req, res)
        })
    }
}

export function sendMainSitePage(imposedPath) {
    return function (req, res) {
        const path = imposedPath || req.path
        sendSitePage({path}, path)(req, res).catch((e) => {
            const log = {
                module: "HTMLTemplateCreator",
                method: "sendMainSitePage.sendSitePage",
                variables: [{name: "path", value: path}]
            }
            ErrorHandler.sendErrorSitePage(e, {post: true, log})(req, res)
        })
    }
}

function sendSitePage(props, path) {
    return async function (req, res) {
        try {
            const content = await getContent({path: props.path, profile: req.user})
            const appData = await AppData.create({
                legalType: props.legalType,
                content,
                profile: req.user,
                activeService: req.activeService && req.activeService.item
            })
            if (appData.status === 404) {
                send404SitePage()(req, res)
            } else {
                sendReactTemplate({Component: ContentMainView, path, appData})(req, res)
            }
        } catch (e) {
            console.error(e)
            const log = {
                module: "HTMLTemplateCreator",
                method: "sendSitePage"
            }
            ErrorHandler.sendErrorSitePage(e, {post: true, log})(req, res)
        }
    }
}

export function sendEmptySitePage(entryPoint = "main") {
    return function (req, res) {
        try {
            res.status(200).send(template({entryPoint}))
        } catch (e) {
            const log = {
                module: "HTMLTemplateCreator.sendEmptySitePage"
            }
            ErrorHandler.sendErrorSitePage(e, {post: true, log})(req, res)
            throw e
        }
    }
}

export function sendErrorSitePage() {
    return function (req, res) {
        sendReactTemplate({Component: ContentMainView, status: 500})(req, res)
    }
}

export function send404SitePage() {
    return function (req, res) {
        sendReactTemplate({Component: ContentMainView, status: 404})(req, res)
    }
}

export function sendCourse(isLanding) {
    return async function (req, res) {
        try {
            const course = await getCourse({isFull: !isLanding, alias: req.params.alias})
            if (course) {
                const appData = AppData.createCourseApp({course, profile: req.user})
                sendReactTemplate({
                    Component: isLanding ? Landing : Course,
                    entryPoint: isLanding ? "landing" : "course",
                    appData
                })(req, res)
            } else {
                send404SitePage()(req, res)
            }
        } catch (e) {
            console.error(e)
            const log = {
                module: "HTMLTemplateCreator",
                method: "sendCourse"
            }
            ErrorHandler.sendErrorSitePage(e, {post: true, log})(req, res)
        }
    }
}

function sendReactTemplate({Component, path, appData, status = 200, entryPoint}) {
    return function (req, res) {
        try {
            const sheets = new ServerStyleSheets()
            const component = <Component path={path} appData={appData} status={status}/>
            res.status(status).send(template({
                app: ReactDOMServer["renderToString"](sheets.collect(component)),
                css: sheets.toString(),
                appData,
                status,
                entryPoint
            }))
        } catch (e) {
            console.error(e)
        }
    }
}

async function getCourse({isFull, alias}) {
    const query = isFull ? FULL_COURSE_QUERY : COMPACT_COURSE_QUERY
    return (await makeResponse(query, {alias: alias})).course
}

async function getContent({path, profile}) {
    return path ? (await makeResponse(CONTENT_QUERY, {path}, profile)).content : null
}