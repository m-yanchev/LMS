// @flow

import TestProblem from "./TestProblem";
import type {TestProblemProps} from "./TestProblem";
import {InstanceError} from "./Error"

export type TestProps = {
    id: string,
    heading: string,
    testProblems?: ?Array<TestProblemProps>,
    fullTime?: ?number,
    completedProblemsTime?: ?number,
    highestEstimate?: ?number,
    prevEstimate?: ?number,
    isPaid: boolean,
    isVerified?: ?boolean,
    isSent?: ?boolean
}

class Test {

    _id: string
    _heading: string
    _testProblems: Array<TestProblem> | null
    _isPaid: boolean
    _isVerified: boolean | null
    _isSent: boolean | null
    _fullTime: number | null
    _completedProblemsTime: number
    _highestEstimate: number | null
    _prevEstimate: number | null

    constructor(props: TestProps) {
        this._id = props.id
        this._heading = props.heading
        this._isPaid = props.isPaid
        this._isVerified = typeof props.isVerified === "boolean" ? props.isVerified : null
        this._isSent = typeof props.isSent === "boolean" ? props.isSent : null
        this._fullTime = typeof props.fullTime === "number" ? props.fullTime : null
        this._completedProblemsTime = props.completedProblemsTime || 0
        this._highestEstimate = typeof props.highestEstimate === "number" ? props.highestEstimate : null
        this._prevEstimate = typeof props.prevEstimate === "number" ? props.prevEstimate : null
    }

    get item(): TestProps {
        return {
            id: this._id,
            heading: this._heading,
            testProblems: this._testProblems && this._testProblems.map(prob => prob.item),
            isPaid: this._isPaid,
            isVerified: this._isVerified,
            isSent: this._isSent,
            fullTime: this._fullTime,
            completedProblemsTime: this._completedProblemsTime,
            highestEstimate: this._highestEstimate,
            prevEstimate: this._prevEstimate
        }
    }

    get fullTime(): number {
        if (!this._fullTime) throw new InstanceError("fullTime")
        return this._fullTime
    }

    get heading(): string {
        return this._heading
    }

    get problems(): Array<TestProblem> {
        if (!this._testProblems) throw new Error('Ожидалось наличие problems')
        return this._testProblems
    }

    get id(): string {
        return this._id
    }

    get isPaid(): boolean {
        return this._isPaid
    }

    get isVerified(): boolean {
        if (this._isVerified === null) throw new Error('Ожидалось наличие isVerified')
        return this._isVerified
    }

    get mark(): number {
        return this.problems.reduce((mark, testProblem) => testProblem.mark + mark, 0)
    }

    set isVerified(isVerified: boolean) {
        this._isVerified = isVerified
    }

    set isSent(isSent: boolean) {
        this._isSent = isSent
    }

    get testProblems(): Array<TestProblem> {
        if (!this._testProblems) throw new InstanceError("testProblems")
        return this._testProblems
    }

    serialize(): string {
        return JSON.stringify(this.item)
    }

    static deserialize(data: string): Test {
        return new Test(JSON.parse(data))
    }

    static create(props: TestProps): Test {
        return new Test(props)
    }
}

export default Test