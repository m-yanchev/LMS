// @flow

import {Lesson} from "./Lesson";
import type {LessonProps} from "./Lesson";
import {DateTime} from "./DateTime";

export type TopicProps = {
    id: string,
    date: string,
    topic: {heading: string},
    videoLessons: Array<LessonProps>
}

class Topic {

    _id: string
    _date: DateTime
    _heading: string
    _lessons: Array<Lesson>

    constructor(props: TopicProps) {
        this._id = props.id
        this._date = DateTime.create(Number(props.date))
        this._heading = props.topic.heading
        this._lessons = props.videoLessons.map(videoLesson => Lesson.create(videoLesson))
    }

    static create(props: TopicProps) {
        return new Topic(props)
    }

   get replica(): TopicProps {
        return {
            id: this._id,
            date: String(this._date.timeStamp),
            topic: {heading: this._heading},
            videoLessons: this._lessons.map(lesson => lesson.replica)
        }
    }

    /*get copy(): Topic {
        return Topic.create(this.item)
    }*/

    get id(): string {
        return this._id
    }

    get lessons(): Array<Lesson> {
        return this._lessons
    }

    set userData(userData: Array<LessonProps>) {
        userData.forEach(lessonUserData => {
            const lesson = this.lessons.find(lesson => lesson.id === lessonUserData.id)
            if (lesson) lesson.userData = lessonUserData
        })
    }

    get heading(): string {
        return this._heading
    }

    get notStarted(): boolean {
        return this._date.isFuture
    }

    get actualLessonIndex(): number {
        return this._lessons.findIndex(lesson => !lesson.isSuccess)
    }
}

export default Topic