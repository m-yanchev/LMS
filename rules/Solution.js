// @flow

import {Test} from "./Test";
import {Profile} from "./Profile";
import type {TestProps} from "./Test";
import type {ProfileProps} from "./Profile";
import {InstanceError} from "./ErrorHandler/InstanceError";
import {TestResult} from "./TestResult";
import {ProblemResult} from "./ProblemResult";
import type {TestResultProps} from "./TestResult";
import Loader from "../WebClient/Loader";
import {DateTime} from "./DateTime";
import {Solutions} from "./Solutions";
import type {PostTransportInterface} from "../server/PostTransport";
import type {ProblemResultProps} from "./ProblemResult";

export type SolutionProps = {
    id?: ?string,
    sentTimeStamp?: ?number,
    verifiedTimeStamp?: ?number,
    comment?: ?string,
    problemResults?: Array<ProblemResultProps>,
    test?: ?TestProps,
    result?: ?TestResultProps,
    profile?: ?ProfileProps,
    isSent?: ?boolean,
    isVerified?: ?boolean
}

type MakePostReport = {
    PostTransport: PostTransportInterface,
    attachments: ResultsPostReportAttachments
}

export type ResultsPostReportAttachments = {
    path: string,
    fileNames: Array<string>
}

type PathArray = [string, string, string]

export class Solution {

    _id: string | null
    _sentTimeStamp: number | null
    _verifiedTimeStamp: number | null
    _comment: string
    _problemResults: Array<ProblemResult>
    _test: Test | null
    _profile: Profile | null
    _result: TestResult | null
    _isSent: boolean
    _isVerified: boolean

    constructor(props: SolutionProps) {
        this._id = props.id ? props.id : null
        this._sentTimeStamp = props.sentTimeStamp ? props.sentTimeStamp : null
        this._verifiedTimeStamp = props.verifiedTimeStamp ? props.verifiedTimeStamp : null
        this._comment = props.comment || ""
        this._problemResults = props.problemResults ? props.problemResults.map(problemResult =>
                ProblemResult.create(problemResult)
            ) : []
        this._test = props.test ? Test.create(props.test) : null
        this._profile = props.profile ? Profile.create(props.profile) : null
        this._result = props.result ? TestResult.create(props.result) : null
        this._isSent = Boolean(props.id || props.sentTimeStamp || props.verifiedTimeStamp || props.isSent ||
            props.isVerified || props.result)
        this._isVerified = Boolean(props.verifiedTimeStamp || props.isVerified || props.result)
    }

    static create(props: SolutionProps): Solution {
        return new Solution(props)
    }

    /*get replica(): SolutionProps {
        return {
            id: this._id,
            sentTimeStamp: this._sentTimeStamp,
            verifiedTimeStamp: this._verifiedTimeStamp,
            comment: this._comment,
            problemResults: this._problemResults.map(problemResult => problemResult.replica),
            test: this._test && this._test.replica,
            profile: this._profile && this._profile.replica,
            result: this._result && this._result.replica,
            isSent: this._isSent,
            isVerified: this._isVerified
        }
    }*/

    /*get copy(): Solution {
        return Solution.create(this.replica)
    }*/

    get id(): string {
        if (!this._id) throw InstanceError.create("id")
        return this._id
    }

    addProblemResult(testProblemId: string): void {
        this.problemResults.push(ProblemResult.create({testProblemId}))
    }

    get sentTimeStamp(): number | null {
        return this._sentTimeStamp
    }

    get stringSentTimeStamp(): string | null {
        return this._sentTimeStamp !== null ? String(this._sentTimeStamp) : null
    }

    get verifiedTimeStamp(): number {
        if (!this._verifiedTimeStamp) throw InstanceError.create("verifiedTimeStamp")
        return this._verifiedTimeStamp
    }

    get day(): string {
        if (!this.sentTimeStamp) throw InstanceError.create("sentTimeStamp")
        return DateTime.date(this.sentTimeStamp)
    }

    get time(): string {
        if (!this.sentTimeStamp) throw InstanceError.create("sentTimeStamp")
        return DateTime.time(this.sentTimeStamp)
    }

    get sentTime(): DateTime {
        if (!this._sentTimeStamp) throw InstanceError.create("sentTimeStamp")
        return DateTime.create(this._sentTimeStamp)
    }

    get profile(): Profile {
        if(!this._profile) throw InstanceError.create("profile")
        return this._profile
    }

    set profile(profile: Profile) {
        return this._profile = profile
    }

    get test(): Test {
        if (!this._test) throw InstanceError.create("test")
        return this._test
    }

    set test(test: Test) {
        this._test = test
    }

    get curProblemNumber(): number {
        return this.test.curProblemIndex + 1
    }

    get curProblemLeftSeconds(): number {
        return this.test.curProblemLeftSeconds
    }
    get result(): TestResult {
        if (!this._result) throw InstanceError.create("result")
        return this._result
    }

    set result(result: TestResult) {
        this._result = result
        this._isSent = true
        this._isVerified = true
    }

    get comment(): string {
        return (this._result && this._result.comment) ? this._result.comment : ""
    }

    set comment(comment: string) {
        if (!this._result) this.result = TestResult.create({comment})
        else this.result.comment = comment
    }

    start(): void {
        if (this.test.curProblemIndex === -1) this.test.start()
        if (!this.test.isPaid) this._isSent = true
    }

    get isStarted(): boolean {
        return this.test.isStarted
    }

    finish(): void {
        this.test.stop()
        if (!this.test.isPaid) this._isVerified = true
    }

    get isFinish(): boolean {
        return this.test.isFinish
    }

    decCurProblemLeftSeconds(): void {
        this.test.decCurProblemLeftSeconds()
    }

    goPrevProblem(): boolean {
        return this.test.goPrevProblem()
    }

    goNextProblem(): boolean {
        return this.test.goNextProblem()
    }

    getComment(index: number): string {
        const result = this.test.testProblems[index].result
        return result ? result.comment : ""
    }

    setComment(index: number, comment: string): void {
        this.test.testProblems[index].makeResult().comment = comment
    }

    getEstimate(index: number): number {
        const result = this.test.testProblems[index].result
        return result ? result.estimate : 0
    }

    setEstimate(index: number, estimate: number): void {
        this.test.testProblems[index].makeResult().estimate = estimate
    }

    get isSuccess(): boolean {
        const SUCCESS_LIMIT = 2 / 3
        return Boolean(this.test.estimate / this.test.highestEstimate > SUCCESS_LIMIT)
    }

    get estimate(): number {
        return this._problemResults.reduce((estimate, problemResult) => problemResult.estimate + estimate, 0)
    }

    get isVerified(): boolean {
        return this._isVerified
    }

    get isSent(): boolean {
        return this._isSent
    }

    get problemResults(): Array<ProblemResult> {
        return this._problemResults
    }

    get pathArray(): PathArray {
        if (!this.id) throw InstanceError.create("id")
        return [Solutions.folder, this.id, TestResult.folder]
    }

    /*async save(dataSource: DataSource): Promise<void> {
        const problemResults = this.problemResults.map(result => result.replica)
        if (this._id) {
            await dataSource.solutionDS.update({id: this._id, problemResults})
        } else {
            this._id = await dataSource.solutionDS.insert({testId: this.test.id, problemResults})
        }
    }*/

    async send(files: Array<File>): Promise<void> {
        const query = `mutation SendSolution($testId: ID!) {
                        sendSolution(testId: $testId)
                    }`
        await Loader.requestBySchema({query, args: {testId: this.test.id}, files})
        this._isSent = true
    }

    /*async saveResults(): Promise<void> {
        const query = `mutation UpdateResults($solutionId: ID!, 
                                              $comment: String!,
                                              $problemResults: [ProblemResultInput!]!) {
                    updateResults(solutionId: $solutionId, 
                                  comment: $comment,
                                  problemResults: $problemResults)
                }`
        const args = {
            solutionId: this.id,
            comment: this.comment,
            problemResults: this.problemResults.map(result => {
                const {testProblemId, estimate, comment} = result.replica
                return {testProblemId, mark: estimate, comment}
            })
        }
        await Loader.requestBySchema({query, args})
    }*/

    async makePostReport(props: MakePostReport): Promise<void> {
        const {PostTransport, attachments} = props
        const subject = "Результаты проверки самостоятельной работы"
        const list = this.test.problemResults.reduce((reduceList, result, index) => {
            if (!result) throw new Error ("Ожидается наличие result")
            return reduceList +
                `<li>` +
                `задание №${index + 1}: оценка ` +
                `<b>${result.estimate}</b> из <b>${this.test.testProblems[index].estimate}</b>, ` +
                `"${result.comment}";` +
                `</li>`
        }, ``)
        if (!this.profile) throw InstanceError.create("profile")
        if (!this.profile.name) throw InstanceError.create("name")
        const html = `` +
            `<p>Добрый день, ${this.profile.name}!</p>` +
            `<p>` +
            `Спешу проинформировать Вас, что решения заданий самостоятельной работы ` +
            `<b>"${this.test.heading}"</b> проверены.` +
            `</p>` +
            `${this.isSuccess ? "<p>Поздравляю, самостоятельная работа <b>зачтена</b>.</p>" :
                "<p>Увы, <b>результаты плохие</b>, но Вы не отчаивайтесь. Изучите комментарии, устраните пробелы и " +
                "попробуйте ещё раз.</p>"}` +
            `<h4>Комментарии и оценки к решениям заданий:</h4>` +
            `<ul>${list}</ul>` +
            `<h4>Общий комментарий:</h4>` +
            `<p>"${this.comment}"</p>` +
            `<p><b><i>Подробности проверки смотрите в прикрепленных к письму файлах.</i></b></p>`
        if (!this.profile.email) throw InstanceError.create("email")
        await PostTransport.send({email: this.profile.email, subject, html, attachments})
    }
}