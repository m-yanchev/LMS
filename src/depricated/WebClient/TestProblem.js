// @flow

import type {TestProblemProps} from "../rules/TestProblem";
import type {TestProblemResponse} from "../../server/ApolloServer/TestProblems";
import {ProblemClient} from "./Problem";
// import {ProblemResultClient} from "./ProblemResult";
// import type {TestProblemResponseType} from "../server/Schema/TestProblem";
import {gql} from "@apollo/client/core";
import type {ProblemsQuery} from "../rules/DataSource/TestProblem";
import ErrorHandler from "../rules/ErrorHandler";
import {WebClient} from "./WebClient";

const PROBLEMS_QUERY = gql`
    query Problems($testId: ID!) {
        testProblems(testId: $testId) {
            id
            problem {
                problemsType {
                    desc
                }
                desc
                solution
                answer
                key
            }
        }
    }
`

export class TestProblemClient {

    static getProblems: ProblemsQuery = async vars => {
        try {
            const client = WebClient.create()
            const {testProblems} = (await client.query({query: PROBLEMS_QUERY, variables: vars})).data
            return TestProblemClient.listResponseToProps(testProblems)
        } catch (e) {
            console.error(e)
            throw ErrorHandler.create({
                error: e,
                props: {module: "TestProblemClient", method: "getProblems", vars: [{name: "testId", value: vars.testId}]}
            })
        }
    }

    /*static responseToProps(testProblem: TestProblemResponseType): TestProblemProps {
        return {
            id: testProblem.id,
            problem: testProblem.problem && ProblemClient.responseToProps(testProblem.problem),
            estimate: testProblem.rating,
            time: testProblem.time,
            result: testProblem.result ? ProblemResultClient.responseToProps(testProblem.result) : null
        }
    }*/

    static listResponseToProps(testProblems: Array<TestProblemResponse>): Array<TestProblemProps> {
        return testProblems.map(testProblem => TestProblemClient.oneResponseToProps(testProblem))
    }

    static oneResponseToProps(testProblem: TestProblemResponse): TestProblemProps {
        const {id, estimate, time, problem} = testProblem
        return {id, estimate, time, problem: problem ? ProblemClient.oneResponseToProps(problem) : null}
    }
}