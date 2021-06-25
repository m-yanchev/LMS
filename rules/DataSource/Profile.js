// @flow

import {Profile} from "../Profile";
import type {ProfileSource, UserAccess} from "../Profile";
import {InstanceError} from "../ErrorHandler/InstanceError";
import {ObjectDS} from "./ObjectDS";
import type {IObjectDS} from "./ObjectDS";

export interface IProfileDS extends IObjectDS<ProfileData> {}

type ProfileData = {
    +id: string,
    +access?: UserAccess,
    +name?: string | null,
    +email?: string | null,
    +isRestore?: boolean,
    +src?: ProfileSource | null
}

export class ProfileDS extends ObjectDS<ProfileData> {

    constructor(props: ?IProfileDS) {
        super(props)
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
}