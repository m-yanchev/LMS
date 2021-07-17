// @flow

import {GraphQLData} from "../Schema/GraphQLData/GraphQLData";
import {App} from "../../depricated/rules/App";
import {DataSource} from "../../depricated/rules/DataSource/DataSource";
import {LoggerClient} from "../../depricated/rules/LoggerClient";
import {ReactApp} from "../../client/ReactApp/ReactApp";
import {send404SitePage} from "../HTMLTemplateCreator";
import type {ProfileProps} from "../../depricated/rules/Profile";
import WinstonLogger from "../WinstonLogger";
import {HTML} from "./HTML";

export type Middleware = (Request, Response) => Promise<void>

export type Response = {
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
        return async function (req: Request, res: Response) {
            try {
                const graphQLData = GraphQLData.create()
                graphQLData.profile.set(req.user)
                const success = await graphQLData.course.load(req.params.alias)
                if (success) {
                    HTML.send(req, res, App.create({
                        dataSource: DataSource.create(graphQLData),
                        loggerClient: LoggerClient.create(WinstonLogger.create()),
                        run: ReactApp.courseServerSide
                    }))
                } else {
                    send404SitePage()(req, res)
                }
            } catch (error) {
                HTML._handleError(req, res, {error, module: "HTML.Course", method: "send"})
            }
        }
    }
}