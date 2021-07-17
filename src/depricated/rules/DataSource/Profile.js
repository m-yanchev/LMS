// @flow

import {Profile} from "../Profile";
import type {ProfileSource, UserAccess} from "../Profile";
import {InstanceError} from "../ErrorHandler/InstanceError";
import {ObjectDS} from "./ObjectDS";
import type {IObjectDS} from "./ObjectDS";

export interface IProfileDS extends IObjectDS<ProfileData> {
    getSendingSolutionsAvailable?: GetSendingSolutionsAvailable
}

export type GetSendingSolutionsAvailable = void => Promise<boolean>

type ProfileData = {
    +id: string,
    +access?: UserAccess,
    +name?: string | null,
    +email?: string | null,
    +isRestore?: boolean,
    +src?: ProfileSource | null
}

export class ProfileDS extends ObjectDS<ProfileData> {

    _getSendingSolutionsAvailable: GetSendingSolutionsAvailable | null

    constructor(props: ?IProfileDS) {
        super(props)
        this._getSendingSolutionsAvailable = (props && props.getSendingSolutionsAvailable) ?
            props.getSendingSolutionsAvailable : null
    }

    static create(props: ?IProfileDS): ProfileDS {
        return new ProfileDS(props)
    }

    copyData(data: ProfileData): void {
        this._data = {
            id: data.id,
            access: data.access,
            name: data.name,
            email: data.email,
            isRestore: data.isRestore,
            src: data.src
        }
    }
    
    get profile(): Profile {
        if (!this._data) throw InstanceError.create("data")
        return Profile.create({
            id: this.data.id,
            access: this.data.access,
            name: this.data.name,
            email: this.data.email,
            isRestore: this.data.isRestore,
            src: this.data.src
        })
    }

    getSendingSolutionsAvailable: GetSendingSolutionsAvailable = async () => {
        if (!this._getSendingSolutionsAvailable) throw InstanceError.create("getSendingSolutionsAvailable")
        return await this._getSendingSolutionsAvailable()
    }
}