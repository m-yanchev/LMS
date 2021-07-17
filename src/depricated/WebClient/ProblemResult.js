// @flow

import type {ProblemResultProps} from "../rules/ProblemResult";
// import type {ProblemResultResponseType} from "../server/Schema/ProblemResult";
import type {ProblemResultResponse} from "../../server/ApolloServer/ProblemResults";
// import {gql} from "@apollo/client/core";
import {WebClient} from "./WebClient";
import ErrorHandler from "../rules/ErrorHandler";
// import {SolutionClient} from "./Solution";

const MODULE_NAME = "ProblemResultClient"

export class ProblemResultClient {

    /*static responseToProps(problemResult: ProblemResultResponseType): ProblemResultProps {
        return {
            testProblemId: problemResult.testProblemId,
            comment: problemResult.comment || null,
            estimate: problemResult.mark
        }
    }*/

    static oneResponseToProps(problemResult: ProblemResultResponse): ProblemResultProps {
        const {testProblemId, estimate, comment} = problemResult
        return {testProblemId, comment, estimate}
    }
}