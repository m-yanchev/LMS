// @flow

import {Profile} from "./Profile";
import {Course} from "./Course";

export class GraphQLData {

    _profile: Profile
    _course: Course

    constructor() {
        this._profile = Profile.create()
        this._course = Course.create()
    }

    static create() {
        return new GraphQLData()
    }

    get profile(): Profile {
        return this._profile
    }

    get course(): Course {
        return this._course
    }
}