// @flow

import Item from "../common/logic/Item";
import type {MakeItemProps} from "../common/logic/Item";
import {DateTime} from "./DateTime";

export type WebinarProps = {|
    id: string,
    heading: string,
    date: number,
    link: string,
|}

class Webinar extends Item{

    _heading: string
    _date: number
    _link: string

    constructor(props: WebinarProps) {
        super(props.id)
        this._heading = props.heading
        this._date = Number(props.date)
        this._link = props.link
    }

    get replica() {
        return {
            id: this._id,
            heading: this._heading,
            date: this._date,
            link: this._link
        }
    }

    get heading(): string {
        return this._heading
    }

    get link(): string {
        return this._link
    }

    get day(): string {
        return DateTime.date(this._date)
    }

    get time(): string {
        return DateTime.time(this._date)
    }

    get notStarted(): boolean {
        const currentDate = (new Date()).getTime()
        return this._date > currentDate
    }

    static create(props: WebinarProps): Webinar {
        return new Webinar(props)
    }

    static async make(props: MakeItemProps): Promise<Webinar> {

        const query = `query Webinar($id: ID!) {
            webinar(id: $id) {
                id
                heading,
                date,
                link
            }
        }`
        const {webinar} = await Item.makeByQuery<{webinar: WebinarProps}>(query, props)
        return new Webinar(webinar)
    }
}

export default Webinar