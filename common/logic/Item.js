//@flow
import React from "react"
import type {MakeResponse} from "../../server/Schema/Schema";

export type MakeItemProps = {
    id: ?string,
    makeResponse: MakeResponse
}

export type MakeItemVariables = {
    id: string
}

class Item {

    _id: string

    constructor(id: string) {
        this._id = id
    }

    get id(): string {
        return this._id
    }

    static async makeByQuery<T>(query: string, props: MakeItemProps): Promise<T> {
        if (!props.id) throw new Error("Ожидалось наличие значения id")
        return await props.makeResponse<MakeItemVariables, T>(query, {id: props.id})
    }
}

export default Item