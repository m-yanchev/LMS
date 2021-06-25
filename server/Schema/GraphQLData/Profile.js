// @flow

import type {ProfileSource, UserAccess} from "../../../rules/Profile";
import type {ProfileProps} from "../../../rules/Profile";
import {InstanceError} from "../../../rules/ErrorHandler/InstanceError";

type ProfileData = {
    id: string,
    access: UserAccess,
    name: string | null,
    email: string | null,
    isRestore: boolean,
    src: ProfileSource
}

export class Profile {

    _data: ProfileData | null

    constructor() {
        this._data = null
    }

    static create(): Profile {
        return new Profile()
    }

    set(profile: ProfileProps) {
        this._data = {
            id: profile.id,
            access: profile.access || "common",
            name: profile.name || null,
            email: profile.email || null,
            isRestore: profile.isRestore || false,
            src: profile.src || "Local"
        }
    }

    get data(): ProfileData {
        if (!this._data) throw InstanceError.create("data")
        return this._data
    }
}