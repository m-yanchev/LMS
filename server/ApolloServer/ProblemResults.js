// @flow

import {DocumentNode, gql} from "@apollo/client/core";
import type {Resolver} from "./index";
import type {SolutionResponse} from "./Solutions"
import {IResolvers} from "graphql-tools";
import {TestProblems} from "./TestProblems";
import {InstanceError} from "../../rules/ErrorHandler/InstanceError";

export const TYPE_DEFS = gql`
    extend type Solution {
        problemResults: [ProblemResult!]!
    }
    type ProblemResult {
        testProblemId: ID!
        estimate: Int!
        comment: String
    }
`

export interface IProblemResultsDataAPI {
    make: Make,
    put: Put,
    find: Filter => Promise<Array<Record>>
}

export type Make = MakeRecord => Promise<void>
type MakeRecord = {
    solutionId: string,
    testProblemId: string
}

export type Put = PutRecord => Promise<void>
type PutRecord = {
    testProblemId: string,
    solutionId: string,
    mark: number
}

export type MakeResolver = Resolver<any, MakingVars, {}>
type MakingVars = {
    testProblemId: string,
    solutionId: string
}

export type PutResolver = Resolver<any, PuttingVars, {}>
type PuttingVars = {
    testProblemId: string,
    solutionId: string,
    answer: string
}

type Filter = {
    solutionId: string
}
export type Record = {
    testProblemId: string,
    mark: number,
    comment?: string
}

export type ProblemResultsResolver = Resolver<SolutionResponse, ListArgs, Array<ProblemResultResponse>>
type ListArgs = {}
export type ProblemResultResponse = {
    testProblemId: string,
    estimate: number,
    comment?: string
}

export class ProblemResults {

    static make: MakeResolver = async (parent, vars, context) => {
        const {dataSources} = context
        const {db} = dataSources
        const {solutionId, testProblemId} = vars
        await db.problemResults.make({solutionId, testProblemId})
        return {}
    }

    static put: PutResolver = async (parent, vars, context) => {
        const {dataSources} = context
        const {db} = dataSources
        const {solutionId, testProblemId, answer} = vars
        const testProblem = await TestProblems.getObject({id: testProblemId}, context)
        if (!testProblem) throw InstanceError.create("testProblem")
        await db.problemResults.put({solutionId, testProblemId, mark: testProblem.getEstimate(answer)})
        return {}
    }

    static getProblemResults: ProblemResultsResolver = async (parent, args, context) => {
        const {dataSources} = context
        const {db} = dataSources
        const problemResults = await db.problemResults.find({solutionId: parent.id})
        return ProblemResults.listDataToResponse(problemResults);
    }

    static listDataToResponse(problemResults: Array<Record>): Array<ProblemResultResponse> {
        return problemResults.map(problemResult => ProblemResults.oneDataToResponse(problemResult))
    }

    static oneDataToResponse(problemResult: Record): ProblemResultResponse {
        const {testProblemId, mark, comment} = problemResult
        return {testProblemId, estimate: mark, comment}
    }

    static get typeDefs(): DocumentNode {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            Solution: {
                problemResults: ProblemResults.getProblemResults
            }
        }
    }
}