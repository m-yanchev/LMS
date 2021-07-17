// @flow

export class DateTime {

    _timeStamp: number

    constructor(timeStamp: number) {
        this._timeStamp = timeStamp
    }

    get date(): string {
        return `${this.day}.${this.month}.${this.year}`
    }

    static date(timeStamp: number): string {
        return DateTime.create(timeStamp).date
    }

    get time(): string {
        return `${this.hour}:${this.minute}`
    }

    get yyyymmdd(): string {
        return this.year + this.month + this.day
    }

    static time(timeStamp: number): string {
        return DateTime.create(timeStamp).time
    }

    get second(): string {
        return DateTime.twoNumb(new Date(this._timeStamp).getSeconds())
    }

    get minute(): string {
        return DateTime.twoNumb(new Date(this._timeStamp).getMinutes())
    }

    get hour(): string {
        return DateTime.twoNumb(new Date(this._timeStamp).getHours())
    }

    get day(): string {
        return DateTime.twoNumb(new Date(this._timeStamp).getDate())
    }

    get month(): string {
        return DateTime.twoNumb(new Date(this._timeStamp).getMonth() + 1)
    }

    get year(): string {
        return String(new Date(this._timeStamp).getFullYear())
    }

    static twoNumb(value: number): string {
        return value < 10 ? "0" + String(value) : String(value)
    }

    get timeStamp() {
        return this._timeStamp
    }

    get iso8601() {
        return (new Date(this._timeStamp)).toISOString()
    }

    get iso8601WithoutDiv() {
        return this.yyyymmdd + "T" + this.hour + this.minute + this.second + "Z"
    }

    get isFuture() {
        return Date.now() < this.timeStamp
    }

    incMonths(count: number): DateTime {
        const date = new Date(this._timeStamp)
        date.setMonth(date.getMonth() + count)
        this._timeStamp = date.getTime()
        return this
    }

    addSecs(numb: number): DateTime {
        const date = new Date(this._timeStamp)
        date.setSeconds(date.getSeconds() + numb)
        this._timeStamp = date.getTime()
        return this
    }

    oldest(dt: DateTime): boolean {
        return this._timeStamp < dt.timeStamp
    }

    static create(timeStamp: number): DateTime {
        return new DateTime(timeStamp)
    }

    static createNow(): DateTime {
        return new DateTime(Date.now())
    }
}