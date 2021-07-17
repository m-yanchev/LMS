// @flow

import type {SolutionProps} from "../rules/Solution";
import type {SolutionResponse} from "../../server/ApolloServer/Solutions";
import {ProblemResultClient} from "./ProblemResult";
import {gql} from "@apollo/client/core";
import type {Make, ProblemResultMutation, Send} from "../rules/DataSource/Solution";
import {WebClient} from "./WebClient";
import {FileStorageClient} from "./FileStorageClient";

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
    mutation SendSolution($testId: ID!, $fileNames: [String!]!) {
        sendSolution(testId: $testId, fileNames: $fileNames) {
            solution(testId: $testId) {
                id
                sentTimeStamp
                uploadingAuths(fileNames: $fileNames) {
                    timeStamp
                    signature
                    policy
                }
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

    static send: Send = async vars => {
        const {testId, files} = vars
        const client = WebClient.create()
        const fileNames = files.map(file => file.name)
        const {data} = await client.mutate({mutation: SEND_MUTATION, variables: {testId, fileNames}})
        const {result, solution} = data.sendSolution
        if (!result.ok) throw new Error("Попытка повторной отправки решения")
        await FileStorageClient.put({
            folder: "solutions",
            id: solution.id,
            uploadingAuths: solution.uploadingAuths,
            files: vars.files
        })
        return SolutionClient.oneResponseToProps(solution)
    }

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