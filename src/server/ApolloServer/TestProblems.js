// @flow

import type {Context, Resolver} from "./index";
import type {TestResponse} from "./Tests";
import {DocumentNode, gql} from "@apollo/client/core";
import {IResolvers} from "graphql-tools";
import type {ProblemResponse} from "./Problems";
import {TestProblem} from "../../depricated/rules/TestProblem";
import {Problems} from "./Problems";

export const TYPE_DEFS = gql`
    extend type Query {
        testProblems(testId: ID!): [TestProblem!]!
    }
    extend type Test {
        testProblems: [TestProblem!]!
    }
    type TestProblem {
        id: ID!
        estimate: Int!
        time: Int!
        problemId: ID!
    }
`

export interface ITestProblemsDataAPI {
    find: Filter => Promise<Array<Record>>,
    getObject: GetObject
}
export type GetObject = {id: string} => Promise<TestProblem>
type Filter = {
    parentId: string
}
export type Record = {
    id: string,
    rating: number,
    time: number,
    problemId: string,
    parentId: string
}

export type TestProblemsResolver = Resolver<TestResponse | any, ListArgs, Array<TestProblemResponse>>
type ListArgs = {
    testId?: string
}
export type TestProblemResponse = {
    id: string,
    estimate: number,
    time: number,
    problemId?: string,
    problem: ProblemResponse | null
}

export class TestProblems {

    static async getObject(filter: {id: string}, context: Context): Promise<TestProblem> {
        const {id} = filter
        const {dataSources} = context
        const {db} = dataSources
        const testProblem = await db.testProblems.getObject({id})
        testProblem.problem = await Problems.getObject({id: testProblem.problemId}, context)
        return testProblem
    }

    static getTestProblems: TestProblemsResolver = async (parent, args, context) => {
        const {dataSources} = context
        const {db} = dataSources
        const {testId} = args
        const testProblems = await db.testProblems.find({parentId: testId || parent.id})
        return TestProblems.listDataToResponse(testProblems)
    }

    static listDataToResponse(testProblems: Array<Record>): Array<TestProblemResponse> {
        return testProblems.map(testProblem => TestProblems.oneDataToResponse(testProblem))
    }

    static oneDataToResponse(testProblem: Record): TestProblemResponse {
        const {id, rating, time, problemId} = testProblem
        return {id, estimate: rating, time, problemId, problem: null}
    }

    static get typeDefs(): DocumentNode {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            Query: {
                testProblems: TestProblems.getTestProblems
            },
            Test: {
                testProblems: TestProblems.getTestProblems
            }
        }
    }
}