// @flow

import {InstanceError} from "./ErrorHandler/InstanceError";

export type ProblemProps = {
    id?: ?string,
    key?: ?string,
    commonDesc?: ?string,
    desc?: string,
    solution?: ?string,
    answer?: ?string,
    typeId?: ?string
}

export class Problem {

    _id: string | null
    _key: string | null
    _commonDesc: string | null
    _desc: string
    _solution: string | null
    _answer: string | null
    _typeId: string | null

    constructor(props: ProblemProps) {
        this._id = props.id || null
        this._key = props.key || this._id
        this._commonDesc = props.commonDesc || null
        this._desc = props.desc || ""
        this._solution = props.solution || null
        this._answer = props.answer || null
        this._typeId = props.typeId || null
    }

    get replica(): ProblemProps {
        return {
            id: this.id,
            key: this._key,
            commonDesc: this._commonDesc,
            desc: this._desc,
            solution: this._solution,
            answer: this._answer,
            typeId: this._typeId
        }
    }

    get id(): string {
        if (!this._id) throw InstanceError.create("id")
        return this._id
    }

    get key(): string {
        if (!this._key) throw InstanceError.create("key")
        return this._key
    }

    set commonDesc(desc: string) {
        this._commonDesc = desc
    }

    get commonDesc(): string | null {
        return this._commonDesc
    }

    get desc(): string {
        return this._desc
    }

    get solution(): string | null {
        return this._solution
    }

    get answer(): string | null {
        return this._answer
    }

    get typeId(): string | null {
        return this._typeId
    }

    static create(props: ProblemProps): Problem {
        return new Problem(props)
    }
}