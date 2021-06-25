// @flow

import GraphQLObject from "./GraphQLObject";
import type {ProfileProps, ProfileSource, UserAccess} from "../../rules/Profile";
import type {Context, Resolve} from "./GraphQLObject";
import {Profile} from "../../rules/Profile";

const TYPES = `
type Profile {
    id: ID!
    name: String
    email: String
    access: String!
    src: ProfileSource
    isRestore: Boolean
    checkCount: Int
    subscription: String
}
enum ProfileSource {
    Local,
    VK,
    Google
}
enum UserAccess {
    common,
    student,
    teacher
}
`

export interface IProfileDataSource {
    getObject: ProfileFilterType => Promise<Profile>
}

export type ProfileFilterType = {
    id: string,
    ...ProfileDocumentType
}

type ResolverType = Resolve<VarsType, ProfileResponseType>

export type ProfileResponseType = {
    id: string,
    name: string | null,
    email: string | null,
    access: UserAccess,
    src: ProfileSource | null,
    isRestore: boolean | null,
    checkCount: number | null,
    subscription: string | null
}

type VarsType = {
    id?: string
}

export type ProfileDocumentType = {|
    name?: string,
    email?: string,
    access?: UserAccess,
    src?: ProfileSource,
    checkCount?: ?number,
    subscription?: ?string
|}

class GraphQLProfile extends GraphQLObject {
    
    static profile: ResolverType = async (vars, context) => {
        return GraphQLProfile.objectToResponse(await GraphQLProfile.getObject(vars, context))
    }

    static getObject(vars: VarsType, context: Context): Promise<Profile> {
        const {id} = vars
        const {dataSource, user} = context
        return dataSource.users.getObject({id: id || user.id})
    }

    static objectToResponse(profile: Profile): ProfileResponseType {
        return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            src: profile.src,
            access: profile.access,
            checkCount: profile.checkCount,
            subscription: profile.subscriptionEndDate && String(profile.subscriptionEndDate.timeStamp),
            isRestore: profile.isRestore
        }
    }

    static responseToProps(profile: ProfileResponseType): ProfileProps {
        const {id, name, email, access, src, isRestore} = profile
        return {
            id,
            access,
            name,
            email,
            isRestore: isRestore || false,
            src: src || "Local"
        }
    }

    static responseToObject(profile: ProfileResponseType): Profile {
        return Profile.create(GraphQLProfile.responseToProps(profile))
    }
    
    static root = {
        profile: GraphQLProfile.profile
    }

    static types = TYPES
}

export default GraphQLProfile