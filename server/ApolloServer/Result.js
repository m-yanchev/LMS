// @flow

import {gql} from "@apollo/client/core";
import {IResolvers} from "graphql-tools";

export const TYPE_DEFS = gql`
    type Result {
        ok: Boolean!
    }
    extend type MakeSolutionResult {
        result: Result!
    }
    extend type PutProblemResultResult {
        result: Result!
    }
`

export type ResultResponse = {
    ok: boolean
}

export class Result {

    static get typeDefs(): string {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            PutProblemResultResult: {
                result: Result.getOk
            },
            MakeSolutionResult: {
                result: Result.getOk
            }
        }
    }

    static get ok(): ResultResponse {
        return {ok: true}
    }

    static getOk(): ResultResponse {
        return {ok: true}
    }
}