// @flow

import type {LessonUserDataProps} from "../Lesson";
import {ObjectDS} from "./ObjectDS";

export interface ITopicDS {
    userData: UserDataQueryType
}

type UserDataQueryType = TopicUserDataArgsType => Promise<Array<LessonUserDataProps>>

export type TopicUserDataArgsType = {
    id: string
}

export class TopicDS extends ObjectDS<{}> {

    _userData: UserDataQueryType | null

    constructor(props: ?ITopicDS) {
        super(props)
        this._userData = props ? props.userData : null
    }

    static create(props: ?ITopicDS) {
        return new TopicDS(props)
    }
}