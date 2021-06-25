// @flow

import type {ProblemProps} from "./Problem";
import {Problem }from "./Problem";
import {InstanceError} from "./ErrorHandler/InstanceError";
import type {ProblemResultProps} from "./ProblemResult";
import {ProblemResult} from "./ProblemResult";

export type TestProblemProps = {
    id: string,
    time: number,
    estimate: number,
    problem?: ?ProblemProps,
    result?: ?ProblemResultProps,
    testId?: ?string,
    problemId?: ?string
}

const ONE_MINUTE_SECONDS = 60

export class TestProblem {

    _id: string
    _time: number
    _estimate: number
    _problem: Problem | null
    _leftSeconds: number
    _result: ProblemResult | null
    _testId: string | null
    _problemId: string | null

    constructor(props: TestProblemProps) {
        this._id = props.id
        this._time = props.time
        this._estimate = props.estimate
        this._problem = props.problem ? Problem.create(props.problem) : null
        this._leftSeconds = props.time * ONE_MINUTE_SECONDS
        if (props.result) this.result = ProblemResult.create(props.result)
        else this._result = null
        this._testId = props.testId || null
        this._problemId = props.problemId || null
    }

    get replica(): TestProblemProps {
        return {
            id: this._id,
            time: this._time,
            estimate: this._estimate,
            problem: this._problem && this._problem.replica,
            // result: this._result && this._result.replica,
            testId: this._testId,
            problemId: this._problemId
        }
    }

    get id(): string {
        return this._id
    }

    get time(): number {
        return this._time
    }

    get estimate(): number {
        return this._estimate
    }

    getEstimate(answer: string): number {
        if (answer === this.answer) return this.estimate
        else return 0
    }

    get testId(): string {
        if (!this._testId) throw InstanceError.create("testId")
        return this._testId
    }

    get problemId(): string {
        if (!this._problemId) throw InstanceError.create("problemId")
        return this._problemId
    }

    makeResult(): ProblemResult {
        if (!this._result) {
            this._result = ProblemResult.create({testProblemId: this.id, estimate: 0})
        }
        return this._result
    }

    set problem(problem: Problem) {
        this._problem = problem
    }

    get problem(): Problem {
        if (!this._problem) throw InstanceError.create("problem")
        return this._problem
    }

    get key(): string {
        return this.problem.key
    }

    get desc(): string {
        return this.problem.desc
    }

    get commonDesc(): string | null {
        return this.problem.commonDesc
    }

    set result(result: ProblemResult) {
        if (!result.testProblemId) result.testProblemId = this.id
        this._result = result
    }

    resetResult(): void {
        this._result = null
    }

    get result(): ProblemResult | null {
        return this._result
    }

    get isSuccess(): boolean {
        const SUCCESS_LIMIT = 2 / 3
        if (!this.result) throw InstanceError.create("problemResult")
        return Boolean(this.result.estimate / this.estimate > SUCCESS_LIMIT)
    }

    get isSolved(): boolean {
        return Boolean(this.result)
    }

    get answer(): string {
        if (!this.problem.answer) throw InstanceError.create("answer")
        return this.problem.answer
    }

    get solution(): string | null {
        return this.problem.solution
    }

    get leftSeconds(): number {
        return this._leftSeconds
    }

    decLeftSeconds(): boolean {
        if (this._leftSeconds > 0) {
            this._leftSeconds--
            return true
        }
        return false
    }

    static create(props: TestProblemProps): TestProblem {
        return new TestProblem(props)
    }
}