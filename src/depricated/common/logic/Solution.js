// @flow

import Loader from "../../WebClient/Loader";
import Test from "./Test";
import Profile from "./Profile";
import type {TestProps} from "./Test";
import type {ProfileProps} from "./Profile";
import Results from "./Results";
import type {ResultsProps} from "./Results";
import {DateTime} from "../../rules/DateTime";
import type {MakeItemProps} from "./Item";
import Item from "./Item";
import TestClient from "../WebClient/Test";
import {InstanceError} from "./Error";

export type SolutionProps = {
    id?: ?string,
    timeStamp?: ?number,
    test: TestProps,
    profile?: ?ProfileProps,
    results?: ?ResultsProps,
    curProblemIndex?: number
}

type SolutionStatus = "verified" | "sent" | "didntSend"

class Solution {

    _id: string | null
    _timeStamp: number | null
    _test: Test
    _profile: Profile | null
    _results: Results | null
    _curProblemIndex: number
    _changeCurProblemEventCallback: void => void
    _finishTestEventCallback: void => void

    constructor(props: SolutionProps) {
        this._id = props.id ? props.id : null
        this._timeStamp = props.timeStamp ? Number(props.timeStamp) : null
        this._test = Test.create(props.test)
        this._profile = props.profile ? Profile.create(props.profile) : null

        if (!props.test.testProblems) throw new InstanceError("testProblems")
        this._results = props.results ?
            Results.create(props.results, props.test.testProblems) : null

        this._test.isVerified = this.isVerified
        this._test.isSent = this.isSent
        this._curProblemIndex = props.curProblemIndex ?
            props.curProblemIndex :
            this._results ? this._results.madeProblemCount : 0
        this._changeCurProblemEventCallback = () => {}
        this._finishTestEventCallback = () => {}
    }

    get item(): SolutionProps {
        return {
            id: this._id,
            timeStamp: this._timeStamp,
            test: this._test.item,
            profile: this._profile && this._profile.item,
            results: this._results && this._results.item,
            curProblemIndex: this._curProblemIndex
        }
    }

    get copy(): Solution {
        return new Solution(this.item)
    }

    get id(): string {
        if (!this._id) throw new Error('Ожидалось наличие id')
        return this._id
    }

    get timeStamp(): number {
        if (!this._timeStamp) throw new Error('Ожидалось наличие timeStamp')
        return this._timeStamp
    }

    get day(): string {
        return DateTime.date(this.timeStamp)
    }

    get time(): string {
        return DateTime.time(this.timeStamp)
    }

    get profile(): Profile {
        if (!this._profile) throw new Error('Ожидалось наличие profile')
        return this._profile
    }

    get test(): Test {
        return this._test
    }

    get results(): Results {
        if (!this._results) throw new Error('Ожидалось наличие results')
        return this._results
    }

    get comment(): string {
        return this._results ? this._results.comment : ""
    }

    getComment(index: number): string {
        return (this._results && this._results.problemResults[index]) ? this._results.problemResults[index].comment : ""
    }

    get isSuccess(): boolean {
        const LIMIT = 2 / 3
        return Boolean( this._results && ((this._results.mark / this.test.mark) > LIMIT))
    }

    get isVerified(): boolean {
        return Boolean(this._results && this._results.isReceived)
    }

    get isSent(): boolean {
        return Boolean(this._timeStamp)
    }

    set results(props: ResultsProps) {
        this._results = Results.create(props)
    }

    static fields = `
        id
        timeStamp
        ${TestClient.query}
        profile {
            ${Profile.fields}
        }
    `
    static statusFields = `
        verifiedTimeStamp
    `

    static query = `
        query Solution($id: ID!) {
            solutions(id: $id) {
                ${Solution.fields}
            }
        }
    `

    static async make(props: MakeItemProps): Promise<Solution> {
        const {solution} = await Item.makeByQuery<{ solution: SolutionProps }>(Solution.query, props)
        return new Solution(solution)
    }

    static async loadStatus(testId: string): Promise<SolutionStatus> {
        const query = `query SolutionStatus($testId: ID!) {
            solutionStatus(testId: $testId) {
                ${Solution.statusFields}
            }
        }`
        const {solutionStatus} = await Loader.requestBySchema({query, args: {testId}})
        return solutionStatus ? solutionStatus.verifiedTimeStamp !== null ? "verified" : "sent" : "didntSend"
    }

    static create(props: SolutionProps) {
        return new Solution(props)
    }
}

export default Solution