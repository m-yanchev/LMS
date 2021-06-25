// @flow

import ProblemResult from "./ProblemResult";
import {InstanceError} from "./Error";
import type {ProblemResultForFreeTestProps, ProblemResultProps} from "./ProblemResult";
import type {TestProblemProps} from "./TestProblem";

export type ResultsProps = {|
    comment?: ?string,
    problemResults: Array<?ProblemResultProps>,
    verifiedTimeStamp?: ?number
|}

class Results {

    _comment: string | null
    _problemResults: Array<ProblemResult | null>
    _verifiedTimeStamp: number | null

    constructor(props: ?ResultsProps) {
        this._comment = (props && props.comment) ? props.comment : null
        this._problemResults = (props && props.problemResults) ?
            props.problemResults.map(res => res ? ProblemResult.create(res) : null) : []
        this._verifiedTimeStamp = (props && props.verifiedTimeStamp) ? props.verifiedTimeStamp : Date.now()
    }

    addDefaultProblemResult(index: number, testProblemId: string): void {
        this.problemResults[index] = ProblemResult.create({testProblemId, comment: "", mark: 0})
    }

    get madeProblemCount(): number {
        return this.problemResults.reduce((count, result) => result ? count + 1 : count, 0)
    }

    get problemResults(): Array<ProblemResult | null> {
        return this._problemResults
    }

    get problemResultsItemForFreeTest(): Array<ProblemResultForFreeTestProps> {
        return this._problemResults ? this._problemResults.filter(result => Boolean(result)).map(result => {
            if (!result) throw new InstanceError("result")
            return result.itemForFreeTest
        }) : []
    }

    getProblemResult(index: number): ProblemResult {
        if (!this.problemResults[index]) throw new Error("Ожидается наличие problemResult")
        return this.problemResults[index]
    }

    get comment(): string {
        if (!this._comment) throw new Error('Ожидалось наличие comment')
        return this._comment
    }

    get mark(): number {
        return this.problemResults.reduce((mark, result) => result ? result.mark + mark : mark, 0)
    }

    get verifiedTimeStamp(): number | null {
        return this._verifiedTimeStamp
    }

    get isReceived(): boolean {
        return this.problemResults.findIndex(res => res === null) === -1
    }

    set comment(str: string) {
        this._comment = str
    }

    get item(): ResultsProps {
        return {
            comment: this._comment,
            problemResults: this._problemResults.map(res => res && res.item),
            verifiedTimeStamp: this._verifiedTimeStamp
        }
    }

    static folder = "results"

    static createBySize(size: number): Results {
        return new Results({problemResults: (new Array(size)).map(() => null)})
    }

    static create(props: ResultsProps, testProblems?: Array<TestProblemProps>) {
        const {problemResults, ...restResults} = props
        if (testProblems) {
            const sortProblemResults = problemResults ? testProblems.map(problem =>
                problemResults.find(result => result && result.testProblemId === problem.id)
            ) : []
            return new Results({problemResults: sortProblemResults, ...restResults})
        } else {
            return new Results(props)
        }
    }
}

export default Results