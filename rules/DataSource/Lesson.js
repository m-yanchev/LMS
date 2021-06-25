// @flow

import {ObjectDS} from "./ObjectDS";
import {InstanceError} from "../ErrorHandler/InstanceError";
import type {LessonProps} from "../Lesson";

export interface ILessonDS {
    lessonsUserData: LessonsUserDataQuery
}

export type LessonsUserDataQuery = LessonsUserDataArgs => Promise<Array<LessonProps>>

export type LessonsUserDataArgs = {
    id: string
}

export class LessonDS extends ObjectDS<{}> {

    _lessonsUserData: LessonsUserDataQuery | null

    constructor(props: ?ILessonDS) {
        super(props)
        this._lessonsUserData = props ? props.lessonsUserData : null
    }

    static create(props: ?ILessonDS): LessonDS {
        return new LessonDS(props)
    }

    async getLessonsUserData(args: LessonsUserDataArgs): Promise<Array<LessonProps>> {
        if (!this._lessonsUserData) throw InstanceError.create("userData")
        return await this._lessonsUserData(args)
    }
}