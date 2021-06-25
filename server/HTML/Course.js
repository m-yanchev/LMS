// @flow

import {GraphQLData} from "../Schema/GraphQLData/GraphQLData";
import {App} from "../../rules/App";
import {DataSource} from "../../rules/DataSource/DataSource";
import {LoggerClient} from "../../rules/LoggerClient";
import {ReactApp} from "../../ReactApp/ReactApp";
import {send404SitePage} from "../HTMLTemplateCreator";
import {sendErrorSitePage} from "../ErrorHandler";
import {InstanceError} from "../../rules/ErrorHandler/InstanceError";
import type {ProfileProps} from "../../rules/Profile";
import WinstonLogger from "../WinstonLogger";

type Middleware = (Request, Response) => Promise<void>

type Response = {
    status: number => Response,
    send: string => Response
}

type Request = {
    user: ProfileProps,
    params: {alias: string}
}

export class Course {

    static create(): Course {
        return new Course()
    }

    send(): Middleware {
        return async function (req, res) {

            const _handleError = e => {
                console.error(e)
                const log = {
                    module: "HTML.Course",
                    method: "send"
                }
                sendErrorSitePage(e, {post: true, log})(req, res)
            }

            const send = app => {
                const {html} = app.start()
                if (!html) throw InstanceError.create("html")
                res.status(200).send(html)
            }

            try {
                const graphQLData = GraphQLData.create()
                graphQLData.profile.set(req.user)
                const success = await graphQLData.course.load(req.params.alias)
                if (success) {
                    send(App.create({
                        dataSource: DataSource.create(graphQLData),
                        loggerClient: LoggerClient.create(WinstonLogger.create()),
                        run: ReactApp.courseServerSide
                    }))
                } else {
                    send404SitePage()(req, res)
                }
            } catch (e) {
                _handleError(e)
            }
        }
    }
}