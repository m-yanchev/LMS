// @flow

import Loader from "../../WebClient/Loader";
import type {MakeResponse} from "../../server/Schema/Schema";
import Subscription from "./Subscription";
import type {MakeItemProps} from "./Item";
import Item from "./Item";

export type ProfileProps = {
    id: ?string,
    access: UserAccess,
    name: ?string,
    email: ?string,
    isRestore: ?boolean,
    src: ?ProfileSource
}

type IncChecksProps = {
    makeResponse: MakeResponse,
    ...IncChecksVariables
}

type IncChecksVariables = {|
    userId: string,
    count: number
|}

type SubscriberProfileProps = {
    userId: string,
    makeResponse: MakeResponse
}

type LoadSubscriberProfile = {
    ...PersonData,
    subscription: number | null
}

type SubscriberProfile = {
    ...PersonData,
    subscription: string | null
}

type PersonData = {|
    name: string,
    email: string
|}

type UpdateSubscriptionProps = {
    ...UpdateSubscriptionVariables,
    makeResponse: MakeResponse
}

type UpdateSubscriptionVariables = {|
    userId: string,
    timeStamp: number
|}

type CheckInProps = {
    email: string,
    setProfile: Profile => void
}

export type UserAccess = "common" | "student" | "teacher"
export type ProfileSource = "Local" | "Google" | "VK"


class Profile {

    _id: ?string
    _access: UserAccess
    _name: ?string
    _email: ?string
    _isRestore: boolean
    _src: ProfileSource

    constructor(props: ?ProfileProps) {
        this._id = props && props.id ? props.id : null
        this._access = props && props.access ? props.access : "common"
        this._name = props && props.name ? props.name : null
        this._email = props && props.email ? props.email : null
        this._isRestore = Boolean(props && props.isRestore)
        this._src = props && props.src ? props.src : "Local"
    }

    get item(): ProfileProps {
        return {
            id: this._id,
            access: this._access,
            name: this._name,
            email: this._email,
            isRestore: this._isRestore,
            src: this._src
        }
    }

    get id(): ?string {
        return this._id
    }

    get name(): string {
        return this._name || ""
    }

    get email(): string {
        return this._email || ""
    }

    get access(): string {
        return this._access || "common"
    }

    get isTeacherAccess(): boolean {
        return this._access === "teacher"
    }

    get isStudentAccess(): boolean {
        return Boolean((this._access === "student" || this._access === "teacher") && this._name)
    }

    get isRestore(): boolean {
        return this._isRestore
    }

    get src(): string {
        return this._src
    }

    serialize(): string {
        return JSON.stringify(this.item)
    }

    static fields = `
        id
        access
        name
        email
        isRestore
        src
    `

    static query = `query Profile($id: ID) {
        profile(id: $id) {
            ${Profile.fields}
        }
    }`

    static async updateSubscription(props: UpdateSubscriptionProps): Promise<void> {
        const {userId, timeStamp, makeResponse} = props
        const query = `mutation UpdateUser($id: ID!, $subscription: String) {
            updateUser(id: $id, subscription: $subscription) 
        }`
        const variables = {id: userId, subscription: String(timeStamp)}
        await makeResponse<UpdateSubscriptionVariables, boolean>(query, variables)
    }

    static deserialize(data: string): Profile {
        return new Profile(JSON.parse(data))
    }

    static create(props: ProfileProps): Profile {
        return new Profile(props)
    }

    static async load(): Promise<Profile> {
        const {profile} = await Loader.requestBySchema({query: Profile.query})
        return Profile.create(profile)
    }
    
    static async loadCheckCount(): Promise<number> {
        const query = `query Profile {
            profile {
                checkCount
            }
        }`
        const {profile} = await Loader.requestBySchema({query})
        return profile.checkCount
    }

    static async loadIsWebinarAvailable(webinarId: string): Promise<boolean> {
        const query = `query WebinarAvailable($webinarId: ID!) {
            profile {
                subscription
            }
            webinarRegistration(webinarId: $webinarId)
        }`
        const {profile, webinarRegistration} = await Loader.requestBySchema({query, args: {webinarId}})
        return Subscription.isActiveByTimeStampString(profile.subscription) || webinarRegistration
    }

    static async incChecks(props: IncChecksProps): Promise<void> {
        const {userId, count, makeResponse} = props
        const query = `mutation IncChecks($userId: ID!, $count: Int!) {
            incChecks(userId: $userId, count: $count)
        }`
        const variables = {userId, count}
        await makeResponse<IncChecksVariables, void>(query, variables)
    }

    static async checkIn(props: CheckInProps): Promise<boolean> {
        try {
            const {email, setProfile} = props
            const profile = new Profile((await Loader.request({email}, "/api/access/checkIn")).profile)
            setProfile(profile)
            return true
        } catch (e) {
            if (e.status === 401) return false
            else throw e
        }
    }

    static async loadSubscriber(props: SubscriberProfileProps): Promise<LoadSubscriberProfile> {
        const {userId, makeResponse} = props
        const query = `query Profile($id: ID!) {
            profile(id: $id) {
                name
                email
                subscription
            }
        }`
        const {profile} = await makeResponse<{id: string}, SubscriberProfile>(query, {id: userId})
        return {
            name: profile.name,
            email: profile.email,
            subscription: Subscription.toNumber(profile.subscription)
        }
    }

    static async make(props: MakeItemProps): Promise<Profile> {
        const {profile} = await Item.makeByQuery<{profile: ProfileProps}>(Profile.query, props)
        return new Profile(profile)
    }
}

export default Profile