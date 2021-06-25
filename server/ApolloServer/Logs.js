// @flow

import {gql} from "@apollo/client/core";
import {IResolvers} from "graphql-tools";
import type {SyncResolver} from "./index";
import type {ResultResponse} from "./Result";
import {Result} from "./Result";

export const TYPE_DEFS = gql`
    type Mutation {
        makeLog(log: Log!): Result
    }
    input Log {
        message: String!
    }
`

export type MakeLogResolver = SyncResolver<any, MakeOneArgs, ResultResponse>
type MakeOneArgs = {
    log: LogArgs
}
export type LogArgs = {
    message: string
}

export class Logs {

    static makeOne: MakeLogResolver = (parent, args, context) => {
        const {log} = args
        const {logger} = context.dataSources
        logger.write(log)
        return Result.ok
    }

    static get resolvers(): IResolvers {
        return {
            Mutation: {
                makeLog: Logs.makeOne
            }
        }
    }

    static get typeDefs(): string {
        return TYPE_DEFS
    }
}