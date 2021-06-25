// @flow

import GraphQLObject from "./GraphQLObject";
import type {Context, Resolve} from "./GraphQLObject";
import {Problem} from "../../rules/Problem";

export interface IProblemsDataSource {
    getObject: ProblemFilterType => Promise<Problem>
}

export type ProblemFilterType = {
    id: string,
    ...ProblemDocumentType
}

type ResolverType = Resolve<VarsType, ProblemResponseType>

export type ProblemResponseType = {
    id?: string,
    key: string,
    parentId?: string,
    commonDesc: string | null,
    desc: string,
    solution: string | null,
    answer: string | null
}

type VarsType = {
    id: string
}

export type ProblemDocumentType = {|
    id?: string,
    key?: string,
    parentId?: string,
    desc?: string,
    solution?: string,
    answer?: string,
    isExample?: boolean,
    src?: string,
    srcNumb?: string
|}

class GraphQLProblem extends GraphQLObject {

    static problem: ResolverType = async (vars, context) => {
        return GraphQLProblem.objectToResponse(await GraphQLProblem.getObject(vars, context))
    }

    static async getObject(vars: VarsType, context: Context): Promise<Problem> {
        const {id} = vars
        const {dataSource} = context
        const problem = await dataSource.problems.getObject({id})
        const problemType = await dataSource.headings.findOne({id: problem.typeId})
        if (problemType) problem.commonDesc = problemType.heading
        return problem
    }

    static objectToResponse(problem: Problem): ProblemResponseType {
        return {
            id: problem.id,
            key: problem.key,
            commonDesc: problem.commonDesc || null,
            desc: problem.desc,
            solution: problem.solution || null,
            answer: problem.answer || null
        }
    }

    static root = {
        problem: GraphQLProblem.problem
    }

    static types = `
            type Problem {
                id: ID!
                key: ID!
                parentId: ID!
                commonDesc: String
                desc: String!
                solution: String
                answer: String
            }
        `
}

export default GraphQLProblem