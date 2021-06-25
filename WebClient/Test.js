// @flow

//import type {GetTestProps} from "../rules/DataSource/Test";
import type {TestProps} from "../rules/Test";
//import Loader from "./Loader";
import {TestProblemClient} from "./TestProblem";
import type {TestResponse} from "../server/ApolloServer/Tests";
import {SolutionClient} from "./Solution";
// import {gql} from "@apollo/client/core";
// import {PutProblemResultMutation} from "../rules/DataSource/Test";
// import {WebClient} from "./WebClient";
// import ErrorHandler from "../rules/ErrorHandler";
//import type {TestResponseType} from "../server/Schema/Test";

export class TestClient {

    // static async get(props: GetTestProps): Promise<TestProps> {
    //     const query = `
    //         query Test($lessonId: ID!) {
    //             test(lessonId: $lessonId){
    //                 id
    //                 heading
    //                 isPaid
    //                 testProblems {
    //                     id
    //                     rating
    //                     time
    //                     problem {
    //                         id
    //                         key
    //                         commonDesc
    //                         desc
    //                         answer
    //                     }
    //                     result {
    //                         testProblemId
    //                         comment
    //                         mark
    //                     }
    //                  }
    //             }
    //         }`
    //     const {test} = await Loader.requestBySchema({query, args: props})
    //     return {
    //         id: test.id,
    //         heading: test.heading,
    //         isPaid: test.isPaid,
    //         testProblems: test.testProblems.map(testProblem => ({
    //             id: testProblem.id,
    //             time: testProblem.time,
    //             estimate: testProblem.rating,
    //             result: testProblem.result ? {
    //                 testProblemId: testProblem.result.testProblemId,
    //                 comment: testProblem.result.comment,
    //                 estimate: testProblem.result.mark
    //             } : null,
    //             problem: testProblem.problem
    //         }))
    //     }
    // }
    //
    // static responseToProps(test: TestResponseType): TestProps {
    //     const {id, heading, isPaid, testProblems} = test
    //     return {
    //         id,
    //         heading,
    //         isPaid,
    //         testProblems: testProblems && testProblems.map(testProblem => TestProblemClient.responseToProps(testProblem))
    //     }
    // }

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