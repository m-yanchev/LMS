// @flow

import {gql} from "@apollo/client/core";
import {IResolvers} from "graphql-tools";
import type {SyncResolver} from "./index";

export const TYPE_DEFS = gql`
    type Result {
        ok: Boolean!
    }
    extend type PutSolutionResult {
        result: Result!
    }
    extend type MakeSolutionResult {
        result: Result!
    }
`

type GetOk = SyncResolver<void, void, ResultResponse>
export type ResultResponse = {
    ok: boolean
}

export class Result {

    static get typeDefs(): string {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            PutSolutionResult: {
                result: Result.getOk
            }
        }
    }

    static get ok(): ResultResponse {
        return {ok: true}
    }

    static get isNotOk(): ResultResponse {
        return {ok: false}
    }

    static getOk: GetOk = () => {
        return {ok: true}
    }
}