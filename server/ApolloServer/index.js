// @flow
import {ApolloServer as Server, mergeSchemas} from "apollo-server-express";
import {Application} from "express";
import type {ICourseVideoLessonsDataAPI} from "./Lessons";
import type {ICourseTestsDataAPI, ITestsDataAPI} from "./Tests";
import type {ITestProblemsDataAPI} from "./TestProblems";
import {Profile} from "../../rules/Profile";
import type {IProblemResultsDataAPI} from "./ProblemResults";
import {Lessons} from "./Lessons";
import {Tests} from "./Tests";
import {TestProblems} from "./TestProblems";
import {ProblemResults} from "./ProblemResults";
import {Solutions} from "./Solutions";
import {TimeStamp} from "./TimeStamp";
import type {ISolutionsDataAPI} from "./Solutions";
import {Result} from "./Result";
import {Logs} from "./Logs";
import type {ILoggerAPI} from "../../rules/LoggerClient";
import type {IProblemsTypeDataAPI} from "./ProblemsTypes";
import {ProblemsTypes} from "./ProblemsTypes";
import type {IProblemsDataAPI} from "./Problems";
import {Problems} from "./Problems";

const PATH = "/api/v1"
const SCHEMAS = [
    Result, Logs, Lessons, Tests, TestProblems, Problems, ProblemsTypes, ProblemResults, Solutions, TimeStamp
]

type Options = {
    dataAPI: IDataAPI,
    loggerAPI: ILoggerAPI
}

export interface IDataAPI {
    courseVideoLessons: ICourseVideoLessonsDataAPI,
    tests: ITestsDataAPI,
    courseTests: ICourseTestsDataAPI,
    testProblems: ITestProblemsDataAPI,
    problemResults: IProblemResultsDataAPI,
    solutions: ISolutionsDataAPI,
    problems: IProblemsDataAPI,
    problemsTypes: IProblemsTypeDataAPI
}

export type Resolver<ParentT, ArgsT, ResponseT> = (ParentT, ArgsT, Context) => Promise<ResponseT>
export type SyncResolver<ParentT, ArgsT, ResponseT> = (ParentT, ArgsT, Context) => ResponseT

export type Context = {
    user: Profile,
    dataSources: DataSources
}

type DataSources = {
    db: IDataAPI,
    logger: ILoggerAPI
}

export class ApolloServer {

    _server: ApolloServer

    constructor(options: Options) {
        const {dataAPI, loggerAPI} = options
        const schema = mergeSchemas({
            schemas: SCHEMAS.map(schema => schema.typeDefs),
            resolvers: SCHEMAS.map(schema => schema.resolvers)
        })
        this._server = new Server({
            schema,
            dataSources: () => ({
                db: dataAPI,
                logger: loggerAPI
            }),
            context: ({req}) => ({user: req.body.user})
        });
    }

    async start(): Promise<void> {
        await this._server.start()
    }

    applyMiddleware(app: Application): void {
        app.use((req, res, next) => {
            req.body.user = req.user
            next()
        })
        this._server.applyMiddleware({app, path: PATH})
    }

    static async create(options: Options): Promise<ApolloServer> {
        return new ApolloServer(options)
    }
}
