// @flow

import {Test} from "./Test";
import type {TestProps} from "./Test";
import {InstanceError} from "./ErrorHandler/InstanceError";
import {TestResult} from "./TestResult";

export type LessonProps = {
    id: string,
    videoLesson?: ?VideoLesson,
    //success?: boolean,
    tests?: Array<TestProps>
}

type VideoLesson = {
    heading: string,
    videoId: string,
    key: string
}

export type LessonUserDataProps = {
    test: ?TestProps,
    success: boolean
}

export class Lesson {

    _id: string
    _videoLesson: VideoLesson | null
    //_success: boolean
    _tests: Array<Test>

    constructor(props: LessonProps) {
        this._id = props.id
        this._videoLesson = props.videoLesson || null
        //this._success = Boolean(props.success)
        this._tests = props.tests ? props.tests.map(test => Test.create(test)) : []
    }

    get replica(): LessonProps {
        return {
            id: this._id,
            videoLesson: this._videoLesson,
            //success: this._success,
            tests: this._tests.map(test => test.replica)
        }
    }

    get test(): Test | null {
        const test1 = this._tests.find(test => test.isPaid && test.isSentSolution && !test.solution.isVerified)
        const test2 = this._tests.find(test => !test.isPaid && test.isUnresolvedProblems)
        const test3 = this._tests.find(test => !test.isSentSolution)
        const test4 = this._tests.reduce((oldestSolutionTest: Test | null, test: Test) =>
                (!oldestSolutionTest || test.solution.sentTime.oldest(oldestSolutionTest.solution.sentTime)) ?
                    test : oldestSolutionTest
            , null)
        return test1 || test2 || test3 || test4
    }

    get heading(): string {
        if (!this._videoLesson) throw InstanceError.create("videoLesson")
        return this._videoLesson.heading
    }

    get id(): string {
        return this._id
    }

    get videoLesson(): VideoLesson {
        if (!this._videoLesson) throw InstanceError.create("videoLessons")
        return this._videoLesson
    }

    get isSuccess(): boolean {
        return Boolean(this._tests.find(test => test.isSuccess))
    }

    /*set isSuccess(success: boolean) {
        this._success = success
    }*/

    set userData(userData: LessonProps) {
        if (!userData.tests) throw new InstanceError("tests")
        this._tests = userData.tests.map(test => Test.create(test))
    }

    get results(): Array<TestResult> {
        return []
    }

    static create(props: LessonProps) {
        return new Lesson(props)
    }
}