import Topic from "./Topic";
import Webinar from "./Webinar";
import type {WebinarProps} from "./Webinar";
import type {TopicProps} from "./Topic";

export type CourseProps = {
    +id: string,
    +heading: string,
    +alias: string,
    +desc?: string,
    +topics?: Array<TopicProps>,
    +webinars?: Array<{webinar: WebinarProps}>
}

export class Course {

    constructor({id, heading, alias, topics, webinars, desc}) {
        this._id = id
        this._heading = heading
        this._alias = alias
        this._desc = desc || null

        this._topics = topics ? topics.map(topicProps => Topic.create(topicProps)) : null

        this._webinars = webinars ? webinars.map(({webinar}) => Webinar.create(webinar)) : null
    }

    get replica() {
        return {
            id: this._id,
            heading: this._heading,
            alias: this._alias,
            desc: this._desc,
            topics: this._topics && this._topics.map(topic => topic.replica),
            webinars: this._webinars && this._webinars.map(webinar => ({webinar: webinar.replica}))
        }
    }

    get desc() {
        return this._desc
    }

    get webinar() {
        if (!this._webinars) return null
        const index = this._webinars.findIndex(webinar => webinar.notStarted)
        if (index === -1) return null
        return this._webinars[index]
    }

    get topic() {
        if (!this._topics) return null
        const nextIndex = this._topics.findIndex(topic => topic.notStarted)
        if (nextIndex === 0) return null
        const topicIndex = nextIndex > 0 ? nextIndex - 1 : this._topics.length - 1
        return this._topics[topicIndex]
    }

    get heading() {
        return this._heading
    }

    get alias() {
        return this._alias
    }

    get id() {
        return this._id
    }

    static create({id, heading, alias, topics, webinars, desc}) {
        return new Course({id, heading, alias, topics, webinars, desc})
    }

    static path(alias: string): string {
        return `/kursy/${alias}/tema/`
    }
}