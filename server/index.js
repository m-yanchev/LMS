// @flow

import {HTML} from "./HTML/HTML";
import {Express} from "express";
import {ApolloServer} from "./ApolloServer";
import DB from "./MongoDBDataSource/DB";
import WinstonLogger from "./WinstonLogger";

const express = require("express");
const fs = require("fs");
const https = require("https");
const multer = require("multer");
const HTMLTemplateCreator = require("./HTMLTemplateCreator");
const Access = require("./passportAccess/Access");
const Schema = require("./Schema/Schema")
const Payment = require("./Payment")

const ErrorHandler = require("./ErrorHandler")

startServer().catch(error => console.error("Server: error = ", error))

async function startServer(): Promise<void> {

    const db = await DB.open()
    const logger = WinstonLogger.create()
    const apolloServer = await ApolloServer.create({dataAPI: db, loggerAPI: logger})
    await apolloServer.start()

    const app = express()

    console.log('start init server');

    app.use(express.static('dist'));
    app.use(express.static('public'));
    app.use(/.*\.png$|.*\.ico$/, (req, res) => {
        res.sendStatus(404)
    });

    console.log('init use dist and public');

    app.use(express.json(), express.urlencoded({ extended: true }))
    const storage = multer.memoryStorage();
    const upload = multer({storage: storage});
    app.use("/api/data", upload.any());

    console.log('init multer');

    Access.config(app);

    console.log('init Access config');

    app.use("/kursy/:alias/info", HTMLTemplateCreator.sendCourse(true))

    const html = HTML.create()
    app.use("/kursy/:alias/tema", html.course.send())

    app.use("/api/error/", ErrorHandler.sendErrorToTeacher())

    app.use("/privacy/", HTMLTemplateCreator.sendLegalSitePage("privacy"))
    app.use("/term/",  HTMLTemplateCreator.sendLegalSitePage("term"))
    app.use("/solutions/admin/", HTMLTemplateCreator.sendEmptySitePage("courseSolutionAdmin"))

    console.log('init privacy and term');

    app.use("/payment/create", Payment.create)
    app.use("/payment/message", Payment.message)

    console.log('init payment');

    console.log('init upload');

    Access.useAuthSrc(app)

    console.log('init Access useAuthSrc');

    app.use('/api/access/:method', Access.route);

    console.log('init Access route');

    app.use("/api/data", Schema.sendResponse);

    console.log('init api data');

    app.use("/access/sendPasswordRestoreRequest/:id/:key",
        Access.sendPasswordRestoreRequest,
        HTMLTemplateCreator.sendMainSitePage("/"));

    console.log('init Access sendPasswordRestoreRequest');

    apolloServer.applyMiddleware(app)

    app.use(HTMLTemplateCreator.sendMainSitePage());

    console.log('init sendSiteData');

    await startExpressServer(app)
}

async function startExpressServer(app: Express): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
        await Promise.all([
            listenHTTPS(app),
            listenHTTP()
        ])
    } else {
        await listen(app,3000, "localhost")
        console.log(`Run the server at: http://localhost:3000`)
    }
}

async function listenHTTPS(app: Express): Promise<void> {
    const key = fs.readFileSync("encryption/certificate.key")
    const cert = fs.readFileSync("encryption/tetradkavkletochku_ru.crt")
    const ca = fs.readFileSync("encryption/tetradkavkletochku_ru.ca-bundle")
    await listen(https.createServer({key, cert, ca}, app), 443, "37.143.15.209")
}

async function listenHTTP(): Promise<void> {
    const httpApp = express();
    httpApp.use((req, res) => {res.redirect(301, "https://tetradkavkletochku.ru" + req.path)})
    await listen(httpApp,80, "37.143.15.209")
}

function listen(app: Express, port: number, hostname: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        app.listen(port, hostname, error => {
            if (error) reject(error)
            else resolve()
        })
    })
}