// @flow

import {DocumentNode, gql} from "@apollo/client/core";
import type {Resolver} from "./index";
import type {ProblemResponse} from "./Problems";
import {IResolvers} from "graphql-tools";
import {InstanceError} from "../../depricated/rules/ErrorHandler/InstanceError";

export const TYPE_DEFS = gql`
    extend type Problem {
        problemsType: ProblemsType!
    }
    type ProblemsType {
        desc: String
    }
`

export interface IProblemsTypeDataAPI {
    findOne: OneFilter => Promise<OneData>
}

export type OneFilter = {
    id: string
}

export type OneData = {
    desc: string
}

export type ProblemsTypeResolver = Resolver<ProblemResponse, OneArgs, ProblemsTypeResponse>
type OneArgs = {}
export type ProblemsTypeResponse = {
    desc: string
}

export class ProblemsTypes {

    static getProblemsType: ProblemsTypeResolver = async (parent, args, context) => {
        const {dataSources} = context
        const {db} = dataSources
        const {parentId} = parent
        if (!parentId) throw InstanceError.create("parentId")
        const problemsType = await db.problemsTypes.findOne({id: parentId})
        return ProblemsTypes.oneDataToResponse(problemsType)
    }

    static oneDataToResponse(data: OneData): ProblemsTypeResponse {
        const {desc} = data
        return {desc}
    }

    static get typeDefs(): DocumentNode {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            Problem: {
                problemsType: ProblemsTypes.getProblemsType
            }
        }
    }
}
