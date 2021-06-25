// @flow

import Loader from "../WebClient/Loader";
import Subscription from "../common/logic/Subscription";
import {DateTime} from "./DateTime";

export type ProfileProps = {
    +id: string,
    +access?: UserAccess,
    +name?: string | null,
    +email?: string | null,
    +isRestore?: boolean,
    +src?: ProfileSource | null,
    +checkCount?: number,
    +subscriptionEndTimeStamp?: ?number
}

export type UserAccess = "common" | "student" | "teacher"
export type ProfileSource = "Local" | "Google" | "VK"

type CheckInProps = {
    email: string,
    setProfile: Profile => void
}

export class Profile {

    _id: string
    _access: UserAccess
    _name: string | null
    _email: string | null
    _isRestore: boolean
    _src: ProfileSource | null
    _checkCount: number
    _subscriptionEndDate: DateTime | null

    constructor(props: ProfileProps) {
        this._id = props.id
        this._access = props.access || "common"
        this._name = props.name || null
        this._email = props.email || null
        this._isRestore = props.isRestore || false
        this._src = props.src || null
        this._checkCount = props.checkCount || 0
        this._subscriptionEndDate = props.subscriptionEndTimeStamp ?
            DateTime.create(props.subscriptionEndTimeStamp) : null
    }

    get replica(): ProfileProps {
        return {
            id: this._id,
            access: this._access,
            name: this._name,
            email: this._email,
            isRestore: this._isRestore,
            src: this._src,
            checkCount: this._checkCount,
            subscriptionEndTimeStamp: this._subscriptionEndDate && this._subscriptionEndDate.timeStamp
        }
    }

    get id(): string {
        return this._id
    }

    get name(): string | null {
        return this._name
    }

    get email(): string | null {
        return this._email
    }

    get access(): UserAccess {
        return this._access
    }

    get isTeacherAccess(): boolean {
        return this._access === "teacher"
    }

    get isStudentAccess(): boolean {
        return this._access === "student" || this._access === "teacher"
    }

    get src(): ProfileSource | null {
        return this._src
    }

    get isRestore(): boolean {
        return this._isRestore
    }

    get checkCount(): number {
        return this._checkCount
    }

    get subscriptionEndDate(): DateTime | null {
        return this._subscriptionEndDate
    }

    static create(props: ProfileProps): Profile {
        return new Profile(props)
    }

    static async loadIsSendingSolutionsAvailable(): Promise<boolean> {
        const query = `query Profile {
            profile {
                checkCount
                subscription
            }
        }`
        const {profile} = await Loader.requestBySchema({query})
        return Subscription.isActiveByTimeStampString(profile.subscription) || Boolean(profile.checkCount)
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
}