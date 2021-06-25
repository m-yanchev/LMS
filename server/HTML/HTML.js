// @flow

import {Course} from "./Course";

export class HTML {

    _course: Course

    constructor() {
        this._course = Course.create()
    }

    static create(): HTML {
        return new HTML()
    }

    get course(): Course {
        return this._course
    }
}