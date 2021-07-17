// @flow

import {makeResponse} from "../Schema";
import type {TopicProps} from "../../../depricated/rules/Topic";
import type {WebinarProps} from "../../../depricated/rules/Webinar";
import {InstanceError} from "../../../depricated/rules/ErrorHandler/InstanceError";

type CourseData = {
    id: string,
    heading: string,
    alias: string,
    desc: string,
    topics: Array<TopicProps>,
    webinars: Array<{webinar: WebinarProps}>
}

export class Course {

    _data: CourseData | null

    constructor() {
        this._data = null
    }

    static create(): Course {
        return new Course()
    }

    async load(alias: string): Promise<boolean> {
        const query = `query Course($alias: String!) {
                course(alias: $alias) {
                    id
                    heading
                    alias
                    desc
                    topics {
                        id
                        date
                        topic {
                            id
                            heading
                        }
                        videoLessons {
                            id
                            videoLesson {
                                id
                                key
                                heading
                                videoId
                            }
                        }
                    }
                    webinars {
                        id
                        webinar {
                            id
                            heading
                            date
                            link
                        }
                    }
                }
            }`
        const {course} = await makeResponse(query, {alias: alias})
        if (course) {
            this._data = {
                id: course.id,
                heading: course.heading,
                alias: course.alias,
                desc: course.desc,
                topics: course.topics,
                webinars: course.webinars
            }
            return true
        } else {
            return false
        }
    }

    get data(): CourseData {
        if (!this._data) throw InstanceError.create("data")
        return this._data
    }
}