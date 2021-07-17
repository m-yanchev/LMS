// @flow

import {InstanceError} from "../ErrorHandler/InstanceError";

export interface IObjectDS<DataT> {
    +data?: DataT
}

export class ObjectDS<DataT> {

    _data: DataT | null

    constructor(props?: IObjectDS<DataT>) {
        if (props && props.data) this.copyData(props.data)
        else this._data = null
    }

    copyData(data: DataT): void{
        this._data = {...data}
    }

    get data(): DataT {
        if (!this._data) throw InstanceError.create("data")
        return this._data
    }
}