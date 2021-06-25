// @flow

import Loader from "../../WebClient/Loader";
import {DateTime} from "../../rules/DateTime";

class Subscription {

    _timeStamp: number | null

    constructor(timeStamp: number | null) {
        this._timeStamp = timeStamp
    }

    get dateTime(): DateTime | null {
        if (!this._timeStamp) return null
        const subDateTime = DateTime.create(this._timeStamp)
        if (!subDateTime.isFuture) return null
        if (!this._timeStamp) throw new Error("timeStamp не существует")
        return DateTime.create(this._timeStamp)
    }

    get isActive(): boolean {
        return Boolean(this.dateTime)
    }

    addOneMonth(): number {
        const dateTime = this.dateTime
        if (!dateTime) {
            this._timeStamp = DateTime.createNow().incMonths(1).timeStamp
        } else {
            this._timeStamp = dateTime.incMonths(1).timeStamp
        }
        if (!this._timeStamp) throw new Error ("timeStamp не существует")
        return this._timeStamp
    }

    static async load(): Promise<Subscription> {
        const query = `query Profile{
            profile {
                subscription
            }
        }`
        const {profile} = await Loader.requestBySchema({query})
        return new Subscription(Subscription.toNumber(profile.subscription))
    }

    static async loadIsActive(): Promise<boolean> {
        const subscription = await Subscription.load()
        return subscription.isActive
    }

    static create(timeStamp: number | null): Subscription {
        return new Subscription(timeStamp)
    }

    static toNumber(timeStamp: string | null): number | null {
        return timeStamp ? Number(timeStamp) : null
    }

    static isActiveByTimeStampString(timeStamp: string | null): boolean {
        return Subscription.create(Subscription.toNumber(timeStamp)).isActive
    }

    static addOneMonthByTimeStamp(timeStamp: number | null): number {
        return Subscription.create(timeStamp).addOneMonth()
    }
}

export default Subscription