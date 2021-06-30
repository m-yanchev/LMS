// @flow

import {DocumentNode, gql} from "@apollo/client/core";
import {IResolvers} from "graphql-tools";
import type {Resolver} from "./index";
import type {TestResponse} from "./Tests";
import type {ProblemResultResponse} from "./ProblemResults";
import type {MakeVars, PutProblemResultVars, SendVars} from "../../rules/DataSource/Solution";
import {ProblemResults} from "./ProblemResults";
import {saveSolutions} from "../Uploader";

export const TYPE_DEFS = gql`
    extend type Mutation {
        makeSolution(testId: ID!) :GetSolutionResult
        putProblemResult(id: ID!, testProblemId: ID!, answer: String) :PutSolutionResult!
        sendSolution(testId: ID!, files: [Upload!]!): GetSolutionResult!
    }
    extend type Test {
        solution: Solution
    }
    type GetSolutionResult {
        solution(testId: ID!): Solution!
    }
    type PutSolutionResult {
        solution(id: ID!): Solution!
    }
    type Solution {
        id: ID!,
        sentTimeStamp: TimeStamp!,
        verifiedTimeStamp: TimeStamp,
        comment: String
    }
`

export interface ISolutionsDataAPI {
    findOne: OneFilter => Promise<OneData>,
    make: Make,
    verify: Verify
}

export type Make = MakeRecord => Promise<{id: string}>
type MakeRecord = {
    testId: string,
    userId: string
}
export type Verify = VerifyFilter => Promise<void>
type VerifyFilter = {
    id: string
}

type OneFilter = {
    testId: string,
    userId: string
} | {
    id: string
}
type OneData = {
    id: string,
    date: string,
    verifiedTimeStamp: string | null,
    comment: string | null
}

export type MakeMutationResolver = Resolver<any, MakeVars, {}>
export type PutProblemResultMutationResolver = Resolver<any, PutProblemResultVars, {}>
export type SendSolutionMutationResolver = Resolver<any, SendVars, {}>

export type SolutionResolver = Resolver<TestResponse, OneVars, SolutionResponse | null>
type OneVars = {
    testId?: string,
    id?: string
}
export type SolutionResponse = {
    id: string,
    sentTimeStamp: number,
    verifiedTimeStamp: number | null,
    comment: string | null,
    problemResults?: Array<ProblemResultResponse>
}

export class Solutions {

    static make: MakeMutationResolver = async (parent, vars, context) => {
        const {testId} = vars
        const {dataSources, user} = context
        const {db} = dataSources
        await db.solutions.make({userId: user.id, testId})
        return {}
    }

    static putProblemResult: PutProblemResultMutationResolver = async (parent, vars, context) => {
        const {id, testProblemId, answer} = vars
        const {dataSources} = context
        const {db} = dataSources
        if (!answer) await ProblemResults.make(parent,{solutionId: id, testProblemId}, context)
        else await ProblemResults.put(parent, {solutionId: id, testProblemId, answer}, context)
        await db.solutions.verify({id})
        return {}
    }

    static send: SendSolutionMutationResolver = async (parent, vars, context) => {
        const {testId, files} = vars
        const {dataSources, user} = context
        const {db} = dataSources
        const {id} = await db.solutions.make({userId: user.id, testId})
        console.log(files, id)
        await saveSolutions({files, key: id})
        return {}
    }

    static getSolution: SolutionResolver = async (parent, vars, context) => {
        const {dataSources, user} = context
        const {db} = dataSources
        const filter = vars.id ? {
            id: vars.id
        } : vars.testId ? {
            testId: vars.testId, userId: user.id
        } : {
            testId: parent.id, userId: user.id
        }
        const solution = await db.solutions.findOne(filter)
        return solution ? Solutions.oneDataToResponse(solution) : null;
    }

    static oneDataToResponse(solution: OneData): SolutionResponse {
        const {id, date, verifiedTimeStamp, comment} = solution
        return {
            id,
            sentTimeStamp: Number(date),
            verifiedTimeStamp: verifiedTimeStamp ? Number(verifiedTimeStamp) : null,
            comment,
            problemResults: []
        }
    }

    static get typeDefs(): DocumentNode {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            Mutation: {
                makeSolution: Solutions.make,
                putProblemResult: Solutions.putProblemResult,
                sendSolution: Solutions.send
            },
            Test: {
                solution: Solutions.getSolution
            },
            PutSolutionResult: {
                solution: Solutions.getSolution
            },
            GetSolutionResult: {
                solution: Solutions.getSolution
            }
        }
    }
}