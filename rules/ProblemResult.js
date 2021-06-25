// @flow

import {InstanceError} from "./ErrorHandler/InstanceError";

export type ProblemResultProps = {
    id?: ?string,
    testProblemId: string,
    comment?: ?string,
    estimate?: number,
    answer?: string
}

export class ProblemResult {

    _id: string | null
    _testProblemId: string
    _comment: string
    _estimate: number
    _answer: string

    constructor(props: ProblemResultProps) {
        this._id = props.id || null
        this._testProblemId = props.testProblemId
        this._comment = props.comment ? props.comment : ""
        this._estimate = props.estimate || 0
        this._answer = typeof props.answer === "string" ? props.answer : ""
    }

    /*get replica(): ProblemResultProps {
        return {
            id: this._id,
            testProblemId: this._testProblemId,
            comment: this._comment,
            estimate: this._estimate,
            answer: this._answer
        }
    }*/

    get id(): string {
        if (!this._id) throw InstanceError.create("id")
        return this._id
    }

    set testProblemId(id: string) {
        this._testProblemId = id
    }

    get testProblemId(): string {
        return this._testProblemId
    }

    set estimate(value: number) {
        this._estimate = value
    }

    get estimate(): number {
        return this._estimate
    }

    set comment(value: string) {
        this._comment = value
    }

    get comment(): string {
        return this._comment
    }

    set answer(answer: string) {
        this._answer = answer
    }

    get answer(): string {
        return this._answer
    }

    static create(props: ProblemResultProps): ProblemResult {
        return new ProblemResult(props)
    }
}