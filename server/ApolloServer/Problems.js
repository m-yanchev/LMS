// @flow

import {DocumentNode, gql} from "@apollo/client/core";
import type {ProblemsTypeResponse} from "./ProblemsTypes";
import type {TestProblemResponse} from "./TestProblems";
import type {Context, Resolver} from "./index";
import {IResolvers} from "graphql-tools";
import {InstanceError} from "../../rules/ErrorHandler/InstanceError";
import {Problem} from "../../rules/Problem";

export const TYPE_DEFS = gql`
    extend type TestProblem {
        problem: Problem!
    }
    type Problem {
        parentId: ID!
        key: String!
        desc: String!
        solution: String
        answer: String
    }
`

export interface IProblemsDataAPI {
    findOne: OneFilter => Promise<Record>,
    getObject: GetObject
}
export type GetObject = {id: string} => Promise<Problem>
type OneFilter = {
    id: string
}
export type Record = {
    key: string,
    desc: string,
    parentId: string,
    answer?: string,
    solution?: string
}

export type ProblemResolver = Resolver<TestProblemResponse, OneArgs, ProblemResponse>
type OneArgs = {}
export type ProblemResponse = {
    key: string,
    desc: string,
    parentId?: string,
    problemsType: ProblemsTypeResponse | null,
    solution: ?string,
    answer: ?string
}

export class Problems {

    static async getObject(filter: {id: string}, context: Context): Promise<Problem> {
        const {id} = filter
        const {dataSources} = context
        const {db} = dataSources
        return await db.problems.getObject({id})
    }

    static getProblem: ProblemResolver = async (parent, args, context) => {
        const {dataSources} = context
        const {db} = dataSources
        if (!parent.problemId) throw InstanceError.create("problemId")
        const problem = await db.problems.findOne({id: parent.problemId})
        return Problems.oneDataToResponse(problem)
    }

    static oneDataToResponse(data: Record): ProblemResponse {
        const {key, desc, parentId, answer, solution} = data
        return {key, desc, parentId, answer, solution, problemsType: null}
    }

    static get typeDefs(): DocumentNode {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            TestProblem: {
                problem: Problems.getProblem
            }
        }
    }
}