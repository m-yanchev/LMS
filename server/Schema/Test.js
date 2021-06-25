// @flow

import GraphQLObject from "./GraphQLObject";
import type {Context, Resolve} from "./GraphQLObject";
import GraphQLTestProblem from "./TestProblem";
import type {TestProblemResponseType} from "./TestProblem";
import {Test} from "../../rules/Test";
import type {SolutionResponseType} from "./Solution";

export interface ITestsDataSource {
    getObject: TestFilterType => Promise<Test>
}

export type TestFilterType = {
    id: string,
    ...TestDocumentType
}

export type TestDocumentType = {|
    id?: string,
    parentId?: string,
    heading?: string,
    type?: "paid-test" | "test",
    isPaid?: boolean
|}

type ResolverType = Resolve<VarsType, TestResponseType>

export type TestResponseType = {
    id: string,
    heading: string,
    isPaid: boolean,
    fullTime: number,
    leftTime: number,
    highestEstimate: number,
    testProblems?: Array<TestProblemResponseType>,
    solution?: SolutionResponseType
}

type VarsType = {
    id: string,
    solutionId?: string,
    isUserData?: boolean,
}

class GraphQLTest extends GraphQLObject {

    static test: ResolverType = async (vars, context) => {
        return GraphQLTest.objectToResponse(await GraphQLTest.getObject(vars, context))
    }

    static async getObject(vars: VarsType, context: Context): Promise<Test> {
        const {id, solutionId, isUserData} = vars
        const {dataSource} = context
        const [test, testProblems] = await Promise.all([
            dataSource.tests.getObject({id}),
            GraphQLTestProblem.getObjects({testId: id, solutionId, isUserData}, context)
        ])
        test.testProblems = testProblems

        return test
    }

    static objectToResponse(test: Test): TestResponseType {
        return {
            id: test.id,
            heading: test.heading,
            isPaid: test.isPaid,
            fullTime: test.fullTime,
            leftTime: test.leftTime,
            highestEstimate: test.highestEstimate,
            testProblems: test.testProblems.map(testProblem => GraphQLTestProblem.objectToResponse(testProblem))
        }
    }

    static root = {
        test: GraphQLTest.test
    }

    static query = `
            test(id: ID!, solutionId: String, isUserData: Boolean): Test!
        `

    static types = `
            type Test {
                id: ID!
                heading: String!
                isPaid: Boolean!
                fullTime: Int!
                leftTime: Int!
                highestEstimate: Int!
                testProblems: [TestProblem!]!
            }
        `
}

export default GraphQLTest