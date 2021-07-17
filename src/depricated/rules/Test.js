// @flow

import type {TestProblemProps} from "./TestProblem";
import {TestProblem} from "./TestProblem";
import {InstanceError} from "./ErrorHandler/InstanceError";
import {ProblemResult} from "./ProblemResult";
import {Problem} from "./Problem";
import type {SolutionProps} from "./Solution";
import {Solution} from "./Solution";

export type TestProps = {
    id?: ?string,
    heading?: string,
    isPaid?: boolean,
    // fullTime?: ?number,
    // leftTime?: ?number,
    testProblems?: ?Array<TestProblemProps>,
    // curProblemIndex?: number,
    solution?: ?SolutionProps,
}

export class Test {

    _id: string | null
    _heading: string
    _isPaid: boolean
    // _fullTime: number | null
    // _leftTime: number | null
    _testProblems: Array<TestProblem> | null
    _curProblemIndex: number
    _onUpdateCurProblem: void => void
    _onFinishCurProblem: void => void
    _onFinish: void => void
    _solution: Solution | null

    constructor(props: TestProps) {
        this._id = props.id || null
        this._heading = props.heading || ""
        this._isPaid = props.isPaid || false
        // this._fullTime = props.fullTime || null
        // this._leftTime = props.leftTime || this._fullTime || null
        this.testProblems = props.testProblems ? props.testProblems.map(problem => TestProblem.create(problem)) : null
        this._curProblemIndex = /*props.curProblemIndex ||*/ -1
        this._onUpdateCurProblem = () => {}
        this._onFinishCurProblem = () => {}
        this._onFinish = () => {}
        this._solution = props.solution ? Solution.create(props.solution) : null
    }

    static create(props: TestProps): Test {
        return new Test(props)
    }

    get replica(): TestProps {
        return {
            id: this._id,
            heading: this._heading,
            isPaid: this._isPaid,
            // fullTime: this._fullTime,
            // leftTime: this._leftTime,
            testProblems: this._testProblems && this._testProblems.map(problem => problem.replica),
            // curProblemIndex: this._curProblemIndex,
            /*solution: this._solution && this._solution.replica,
            onStart: this._onStart,
            onStartNextProblem: this._onStartNextProblem,
            onFinishCurProblem: this._onFinishCurProblem,
            onFinish: this._onFinish*/
        }
    }

    get id(): string {
        if (!this._id) throw InstanceError.create("id")
        return this._id
    }

    get heading(): string {
        return this._heading
    }

    set solution(solution: Solution) {
        this._solution = solution
    }

    get solution(): Solution {
        if (!this._solution) throw InstanceError.create("solution")
        return this._solution
    }

    getSolution(): Solution | null {
        return this._solution
    }

    get isSentSolution(): boolean {
        return Boolean(this._solution)
    }

    get isPendingVerificationSolution(): boolean {
        const solution = this.getSolution()
        if (!solution) return false
        return this.isPaid && solution.isSent && !solution.isVerified
    }

    get isPaid(): boolean {
        return this._isPaid
    }

    get isSuccess(): boolean {
        const solution = this.getSolution()
        if (!solution || (this.isPaid && !solution.isVerified)) return false
        const SUCCESS_LIMIT = 2 / 3
        return Boolean(solution.estimate / this.highestEstimate > SUCCESS_LIMIT)
    }

    getIsSuccessByTestProblemId(id: string): boolean {
        const SUCCESS_LIMIT = 2 / 3
        const testProblem = this.testProblems.find(testProblem => testProblem.id === id)
        if (!testProblem) throw InstanceError.create("testProblem")
        const problemResult = this.getProblemResultByTestProblemId(id)
        if (!problemResult) throw InstanceError.create("problemResult")
        return Boolean(problemResult.estimate / testProblem.estimate > SUCCESS_LIMIT)
    }

    set curAnswer(value: string) {
        this.curResult.estimate = value === this.curProblem.answer ? this.curProblem.estimate : 0
        this.curResult.answer = value
    }

    static testProblemsTime(testProblems: Array<TestProblem>): number {
        return testProblems.reduce((time, testProblem) => time + testProblem.time, 0)
    }

    get fullTime(): number {
        return Test.testProblemsTime(this.testProblems)
    }

    get leftTime(): number {
        const index = this.didntSendProblemIndex
        if (index <= 0) return this.fullTime
        return Test.testProblemsTime(this.testProblems.slice(index))
    }

    get highestEstimate(): number {
        return this.testProblems.reduce((highestEstimate, testProblem) =>
            highestEstimate + testProblem.estimate, 0)
    }

    get problems(): Array<Problem> {
        return this.testProblems.map(testProblem => testProblem.problem)
    }

    set problems(testProblems: Array<TestProblemProps>) {
        this.testProblems.forEach(testProblem => {
            const testProblemProps = testProblems.find(({id, problem}) => {
                if (!id || !testProblem.id) throw InstanceError.create("id")
                return id === testProblem.id
            })
            if (!testProblemProps) throw InstanceError.create("testProblem")
            const {problem} = testProblemProps
            if (!problem) throw InstanceError.create("problem")
            testProblem.problem = Problem.create(problem)
        })
    }

    get isFirstProblem(): boolean {
        return this.curProblemIndex === 0
    }

    get isLastProblem(): boolean {
        return this.curProblemIndex + 1 === this.testProblems.length
    }

    set testProblems(testProblems: Array<TestProblem> | null) {
        this._testProblems = testProblems
        /*if (testProblems) {
            this._fullTime = testProblems.reduce((time, problem) =>
                problem.time + time, 0)
            this._leftTime = this.fullTime - testProblems.reduce((usedTime, testProblem) =>
                usedTime + (testProblem.isSolved ? testProblem.time : 0), 0)
        }*/
    }

    get testProblems(): Array<TestProblem> {
        if (!this._testProblems) throw InstanceError.create("testProblems")
        return this._testProblems
    }

    set results(results: Array<ProblemResult>) {
        this.curProblemIndex = -1
        this.testProblems.forEach((problem, i) => {
            const result = results.find(result => result.testProblemId === problem.id)
            if (result) {
                problem.result = result
                // this._leftTime = this.fullTime - problem.time
            } else {
                this.curProblemIndex = i
            }
        })
    }

    get isNotReceivedResults(): boolean {
        const solution = this.getSolution()
        if (!solution) return false
        return solution.isSent && !solution.isVerified
    }

    /*set curEstimate(estimate: number) {
        const problemResult = this.getCurResult()
        if (!problemResult) this.curProblem.makeResult()
        this.curResult.estimate = estimate
    }*/

    makeCurResult(): void {
        this.solution.addProblemResult(this.curProblem.id)
    }

    get curResult(): ProblemResult {
        const problemResult = this.getProblemResultByTestProblemId(this.curProblem.id)
        if (!problemResult) throw InstanceError.create("problemResult")
        return problemResult
    }

    getCurResult(): ProblemResult | null {
        return this.getProblemResultByTestProblemId(this.curProblem.id)
    }

    get estimate(): number {
        return this.testProblems.reduce((estimate, problem) =>
            problem.result ? problem.result.estimate + estimate : estimate, 0)
    }

    get curProblem(): TestProblem {
        return this.testProblems[this.curProblemIndex]
    }

    get curProblemIndex(): number {
        return this._curProblemIndex
    }

    set curProblemIndex(index: number) {
        if (this._curProblemIndex !== index) {
            if (this._curProblemIndex > -1) this._onFinishCurProblem()
            this._curProblemIndex = index
            if (index > -1) {
                if (!this.isPaid && !this.getCurResult()) this.makeCurResult()
            } else {
                this._onFinish()
            }
            this._onUpdateCurProblem()
        }
    }

    get curProblemNumber(): number {
        return this.curProblemIndex + 1
    }

    get curProblemLeftSeconds(): number {
        return this.curProblem.leftSeconds
    }

    decCurProblemLeftSeconds(): void {
        if (!this.curProblem.decLeftSeconds()) {
            if (this.goNextProblem()) this.curProblem.decLeftSeconds()
        }
    }

    set onUpdateCurProblem(callback: void => void) {
        this._onUpdateCurProblem = callback
    }
    set onFinishCurProblem(callback: void => void) {
        this._onFinishCurProblem = callback
    }
    set onFinish(callback: void => void) {
        this._onFinish = callback
    }

    goPrevProblem(): boolean {
        if (this.curProblemIndex > 0) {
            this.curProblemIndex--
            return true
        }
        return false
    }

    get didntSendProblemIndex(): number {
        const solution = this.getSolution()
        if (!solution) return 0
        return this.testProblems.findIndex(testProblem =>
            !Boolean(solution.problemResults.find(problemResult => testProblem.id === problemResult.testProblemId))
        )
    }

    start() {
        if (!this.isPaid) {
            this.curProblemIndex = this.didntSendProblemIndex
        } else {
            this.curProblemIndex = 0
        }
    }

    get isStarted(): boolean {
        return this.curProblemIndex > -1
    }

    stop() {
        this.curProblemIndex = -1
    }

    get isFinish(): boolean {
        return (!this.isUnresolvedProblems && !this.isPaid) && this.curProblemIndex === -1
    }

    get isUnresolvedProblems(): boolean {
        return this.didntSendProblemIndex > -1
    }

    goNextProblem(): boolean {
        if (this.curProblemIndex + 1 < this.testProblems.length) {
            this.curProblemIndex++
            return true
        }
        this.stop()
        return false
    }

    /*setActualLeftTime(): void {
        this._leftTime = this.testProblems.reduce((leftTime, testProblem, index) =>
            index < this.curProblemIndex ? leftTime - testProblem.time : leftTime, this.fullTime)
    }*/

    get problemResults(): Array<ProblemResult> {
        const results = this.testProblems.map(problem => problem.result).filter(result => result)
        return results.map(result => {
            if (!result) throw InstanceError.create("result")
            return result
        })
    }

    getProblemResultByTestProblemId(id: string): ProblemResult | null {
        const solution = this.getSolution();
        if (!solution) return null
        const problemResult = this.solution.problemResults.find(problemResult => problemResult.testProblemId === id)
        return problemResult || null
    }

    resetResults(): void {
        this.testProblems.forEach(testProblem => testProblem.resetResult())
        // this._leftTime = this._fullTime
    }
}