// @flow

import {gql} from "@apollo/client/core";
import type {Resolver} from "./index";
import {IResolvers} from "graphql-tools";

const TYPE_DEFS = gql`
    extend type Query {
        profile: Profile
    }
    type Profile {
        checkCount: Int,
        subscription: TimeStamp
    }
`

export interface IUsersDataAPI {
    findOne: Filter => Promise<Data>
}
type Filter = {
    id: string
}
type Data = {
    checkCount?: ?number,
    subscription?: ?number
}

export type ProfileResolver = Resolver<Parent, Vars, Response>
type Parent = {}
type Vars = {}
type Response = {
    checkCount: number,
    subscription: number | null
}

export class Profiles {

    static getProfile: ProfileResolver = async (parent, args, context) => {
        const {dataSources, user} = context
        const {db} = dataSources
        if (!user) return {checkCount: 0, subscription: null}
        const profile = await db.users.findOne({id: user.id})
        return {checkCount: profile.checkCount || 0, subscription: profile.subscription || null}
    }

    static get typeDefs(): string {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            Query: {
                profile: Profiles.getProfile
            }
        }
    }
}