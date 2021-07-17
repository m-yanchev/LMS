// @flow

import type {TestProps} from "../rules/Test";
import {TestProblemClient} from "./TestProblem";
import type {TestResponse} from "../../server/ApolloServer/Tests";
import {SolutionClient} from "./Solution";

export class TestClient {

    static oneResponseToProps(test: TestResponse): TestProps {
        const {id, heading, isPaid, testProblems, solution} = test
        return {
            id,
            heading,
            isPaid,
            testProblems: testProblems.map(testProblem => TestProblemClient.oneResponseToProps(testProblem)),
            solution: solution ? SolutionClient.oneResponseToProps(solution) : null
        }
    }
}