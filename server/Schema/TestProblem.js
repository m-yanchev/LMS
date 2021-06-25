// @flow

import GraphQLObject from "./GraphQLObject";
import type {Context, Resolve} from "./GraphQLObject";
import GraphQLProblem from "./Problem";
import type {ProblemResponseType} from "./Problem";
import GraphQLProblemResult from "./ProblemResult";
import type {ProblemResultResponseType} from "./ProblemResult";
import {TestProblem} from "../../rules/TestProblem";
import GraphQLSolution from "./Solution";
import {InstanceError} from "../../rules/ErrorHandler/InstanceError";

export interface ITestProblemsDataSource {
    getObjects: TestProblemsFilterType => Promise<Array<TestProblem>>
}

export type TestProblemsFilterType = {
    ...TestProblemDocumentType
}

type TestProblemsResolverType = Resolve<TestProblemsVarsType, Array<TestProblemResponseType>>

export type TestProblemResponseType = {
    id: string,
    problemId?: string,
    problem: ProblemResponseType,
    rating: number,
    time: number,
    result: ProblemResultResponseType | null
}

type TestProblemsVarsType = {
    testId: string,
    solutionId?: ?string,
    isUserData?: boolean,
}

export type TestProblemDocumentType = {|
    parentId?: string,
    problemId?: string,
    rating?: number,
    time?: number
|}

class GraphQLTestProblem extends GraphQLObject {

    static testProblems: TestProblemsResolverType = async (vars, context) => {
        const testProblems = await GraphQLTestProblem.getObjects(vars, context)
        return testProblems.map(testProblem => GraphQLTestProblem.objectToResponse(testProblem))
    }

    static async getObjects(vars: TestProblemsVarsType, context: Context): Promise<Array<TestProblem>> {
        const {testId, solutionId, isUserData} = vars
        const {dataSource} = context

        const [testProblems, solution] = await Promise.all([
            dataSource.testProblems.getObjects({parentId: testId}),
            (isUserData && !solutionId) ?
                GraphQLSolution.getObject(
                    {testId, isUserData: false},
                    context,
                    {withoutTest: true, withoutProfile: true}) :
                null
        ])

        const [problems, problemResults] = await Promise.all([
            Promise.all(testProblems.map(testProblem =>
                GraphQLProblem.getObject({id: testProblem.problem.id}, context)
            )),
            (solution || solutionId) ?
                Promise.all(testProblems.map(testProblem => {
                    const _solutionId = solution ? solution.id : solutionId
                    if (!_solutionId) throw InstanceError.create("solutionId")
                    return GraphQLProblemResult.getObject({
                        solutionId: _solutionId,
                        testProblemId: testProblem.id
                    }, context)
                })) : null
        ])

        testProblems.forEach((testProblem, i) => {
            testProblem.problem = problems[i]
            if (problemResults && problemResults[i]) testProblem.result = problemResults[i]
        })

        return testProblems
    }

    static objectToResponse(testProblem: TestProblem): TestProblemResponseType {
        return {
            id: testProblem.id,
            problem: GraphQLProblem.objectToResponse(testProblem.problem),
            rating: testProblem.estimate,
            time: testProblem.time,
            result: testProblem.result ? GraphQLProblemResult.objectToResponse(testProblem.result) : null
        }
    }

    static root = {
        testProblems: GraphQLTestProblem.testProblems
    }

    static types = `
            type TestProblem {
                id: ID!
                problemId: ID!
                problem: Problem!
                rating: Int!
                time: Int!
                result: ProblemResult
            }
        `
}

export default GraphQLTestProblem