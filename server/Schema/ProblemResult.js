//@flow

import GraphQLObject from "./GraphQLObject";
import type {Context, Insert, Resolve, Update} from "./GraphQLObject";
import {ProblemResult} from "../../rules/ProblemResult";
import type {ProblemResultProps} from "../../rules/ProblemResult";
import {InstanceError} from "../../rules/ErrorHandler/InstanceError";

export interface IProblemResultsDataSource {
    getObject: ProblemResultFilterType => Promise<ProblemResult>,
    insert: Insert<ProblemResultInsertType>,
    update: Update<ProblemResultUpdateType>
}

export type ProblemResultFilterType = {
    ...ProblemResultDocumentType
}

export type ProblemResultInsertType = {
    ...ProblemResultDocumentType
}

export type ProblemResultUpdateType = {
    id: string,
    ...ProblemResultInputType
}

type ResolverType = Resolve<VarsType, ProblemResultResponseType>

export type ProblemResultResponseType = {
    id?: string,
    testProblemId: string,
    comment: string | null,
    mark: number
}

export type ProblemResultInputType = {|
    testProblemId: string,
    comment: string,
    mark: number
|}

type VarsType = {
    solutionId: string,
    testProblemId: string
}

export type ProblemResultDocumentType = {|
    testProblemId?: string,
    solutionId?: string,
    comment?: string,
    mark?: number
|}

class GraphQLProblemResult extends GraphQLObject {

    static problemResult: ResolverType = async (vars, context) => {
        return GraphQLProblemResult.objectToResponse(await GraphQLProblemResult.getObject(vars, context))
    }

    static getObject(vars: VarsType, context: Context): Promise<ProblemResult> {
        const {solutionId, testProblemId} = vars
        const {dataSource} = context
        return dataSource.problemResults.getObject({testProblemId, solutionId})
    }

    static propsToProblemResultsResponse(results: Array<ProblemResultProps>): Array<ProblemResultResponseType> {
        return results.map(result => {
            if (!result.estimate) throw InstanceError.create("estimate")
            return {
                testProblemId: result.testProblemId,
                comment: result.comment ? result.comment : null,
                mark: result.estimate
            }
        })
    }

    static objectToResponse(result: ProblemResult): ProblemResultResponseType {
        return {
            testProblemId: result.testProblemId,
            comment: result.comment,
            mark: result.estimate
        }
    }

    static types = `
            type ProblemResult {
                id: ID!
                testProblemId: ID!
                comment: String
                mark: Int!
            }
            input ProblemResultInput {
                testProblemId: ID!
                comment: String!
                mark: Int!
            }
        `
}

export default GraphQLProblemResult