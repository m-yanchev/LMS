// @flow

import type {TopicProps} from "../Topic";
import type {WebinarProps} from "../Webinar";
import {ObjectDS, IObjectDS} from "./ObjectDS";
import {Course} from "../Course";

export interface ICourseDS extends IObjectDS<CourseData> {}

type CourseData = {
    id: string,
    heading: string,
    alias: string,
    desc: string,
    topics: Array<TopicProps>,
    webinars: Array<{webinar: WebinarProps}>
}

export class CourseDS extends ObjectDS<CourseData>{

    constructor(props: ?ICourseDS) {
        super(props)
    }

    static create(props: ?ICourseDS): CourseDS {
        return new CourseDS(props)
    }

    copyData(data: CourseData): void {
        this._data = {
            id: data.id,
            heading: data.heading,
            alias: data.alias,
            desc: data.desc,
            topics: data.topics,
            webinars: data.webinars
        }
    }

    get course(): Course {
        return Course.create({
            id: this.data.id,
            heading: this.data.heading,
            alias: this.data.alias,
            desc: this.data.desc,
            topics: this.data.topics,
            webinars: this.data.webinars
        })
    }
}
