// @flow

// import Loader from "./Loader";
import type {SolutionProps} from "../rules/Solution";
// import type {GetSolutionProps, InsertSolutionProps, UpdateSolutionProps} from "../rules/DataSource/Solution";
// import type {ProblemResultProps} from "../rules/ProblemResult";
// import type {ProblemResultInputType} from "../server/Schema/ProblemResult";
// import type {SolutionResponseType} from "../server/Schema/Solution";
import type {SolutionResponse} from "../server/ApolloServer/Solutions";
import {ProblemResultClient} from "./ProblemResult";
import {gql} from "@apollo/client/core";
import type {Make, ProblemResultMutation, Send} from "../rules/DataSource/Solution";
import {WebClient} from "./WebClient";

const MAKE_MUTATION = gql`
    mutation MakeSolution($testId: ID!) {
        makeSolution(testId: $testId) {
            solution(testId: $testId) {
                id
                sentTimeStamp
            }
            result {
                ok
            }
        }
    }
`

const PROBLEM_RESULT_MUTATION = gql`
    mutation PutProblemResult($id: ID!, $testProblemId: ID!, $answer: String) {
        putProblemResult(id: $id, testProblemId: $testProblemId, answer: $answer) {
            result {
                ok
            }
            solution(id: $id) {
                id
                sentTimeStamp
                verifiedTimeStamp
                problemResults {
                    testProblemId
                    estimate
                }
            }
        }
    }
`

const SEND_MUTATION = gql`
    mutation SendSolution($testId: ID!, $files: [Upload!]!) {
        sendSolution(testId: $testId, files: $files) {
            solution(testId: $testId) {
                id
                sentTimeStamp
            }
            result {
                ok
            }
        }
    }
`

export class SolutionClient {

    static make: Make = async vars => {
        const client = WebClient.create()
        const {data} = await client.mutate({mutation: MAKE_MUTATION, variables: vars})
        return SolutionClient.oneResponseToProps(data.makeSolution.solution)
    }

    static putProblemResult: ProblemResultMutation = async vars => {
        const client = WebClient.create()
        const {data} = await client.mutate({mutation: PROBLEM_RESULT_MUTATION, variables: vars})
        return SolutionClient.oneResponseToProps(data.putProblemResult.solution)
    }

    static send: Send = async (vars, files) => {
        const client = WebClient.create()
        const {data} = await client.mutate({mutation: SEND_MUTATION, variables: vars})
        const {solution, fileStorageAccessData} = data.sendSolution
        await FileStorageClient.put({
            storageName: "solutions",
            key: solution.id,
            accessData: fileStorageAccessData,
            files
        })
        return SolutionClient.oneResponseToProps(solution)
    }

    /*static async get(vars: GetSolutionProps): Promise<SolutionProps> {
        const query = `query Solution($testId: ID!) {
            solution(testId: $testId) {
                id
                sentTimeStamp
                test {
                    id
                    heading
                    isPaid
                    testProblems {
                        id
                        rating
                        time
                        problem {
                            id
                            key
                            commonDesc
                            desc
                            answer
                        }
                        result {
                            testProblemId
                            comment
                            mark
                        }
                     }
                }
            }
        }`
        const {solution} = await Loader.requestBySchema({query, args: vars})
        return {
            id: solution.id,
            sentTimeStamp: Number(solution.sentTimeStamp),
            test: {
                id: solution.test.id,
                heading: solution.test.heading,
                isPaid: solution.test.isPaid,
                testProblems: solution.test.testProblems.map(testProblem => ({
                    id: testProblem.id,
                    time: testProblem.time,
                    estimate: testProblem.rating,
                    result: testProblem.result ? {
                        testProblemId: testProblem.result.testProblemId,
                        comment: testProblem.result.comment,
                        estimate: testProblem.result.mark
                    } : null,
                    problem: testProblem.problem
                }))
            }
        }
    }*/

    /*static async update(props: UpdateSolutionProps): Promise<void> {
        const query = `mutation UpdateSolution($id: ID, $problemResults: [ProblemResultInput!]!) {
           updateSolution(id: $id, problemResults: $problemResults)
        }`
        const args = {
            id: props.id,
            problemResults: SolutionClient.propsToProblemResultsInput(props.problemResults)
        }
        await Loader.requestBySchema({query, args})
    }

    static async insert(props: InsertSolutionProps): Promise<string> {
        const query = `mutation InsertSolution($testId: ID, $problemResults: [ProblemResultInput!]!) {
           insertSolution(testId: $testId, problemResults: $problemResults)
        }`
        const args = {
            testId: props.testId,
            problemResults: SolutionClient.propsToProblemResultsInput(props.problemResults)
        }
        return (await Loader.requestBySchema({query, args})).insertSolution
    }*/

    /*static propsToProblemResultsInput(results: Array<ProblemResultProps>): Array<ProblemResultInputType> {
        return results.map(result => ({
            testProblemId: result.testProblemId, comment: result.comment || "", mark: result.estimate
        }))
    }*/

    /*static responseToProps(solution: SolutionResponseType): SolutionProps {
        const {sentTimeStamp, comment, verifiedTimeStamp} = solution
        return {
            sentTimeStamp: Number(sentTimeStamp),
            result: comment ? {comment} : null,
            verifiedTimeStamp: verifiedTimeStamp ? Number(verifiedTimeStamp) : null
        }
    }*/

    static oneResponseToProps(solution: SolutionResponse): SolutionProps {
        const {id, sentTimeStamp, comment, verifiedTimeStamp, problemResults} = solution
        return {
            id,
            sentTimeStamp,
            comment: comment ? comment : null,
            verifiedTimeStamp: verifiedTimeStamp ? verifiedTimeStamp : null,
            problemResults: problemResults ? problemResults.map(problemResult =>
                ProblemResultClient.oneResponseToProps(problemResult)
            ) : []
        }
    }
}