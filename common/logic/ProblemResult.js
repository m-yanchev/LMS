// @flow

export type ProblemResultProps = {|
    testProblemId: string,
    comment?: ?string,
    mark: number
|}

export type ProblemResultForFreeTestProps = {|
    testProblemId: string,
    mark: number
|}

class ProblemResult {

    _comment: string
    _mark: number
    _testProblemId: string

    constructor(props: ProblemResultProps) {
        this._comment = props.comment ? props.comment : ""
        this._mark = props.mark
        this._testProblemId = props.testProblemId
    }

    get item(): ProblemResultProps {
        return {
            comment: this._comment,
            mark: this._mark,
            testProblemId: this._testProblemId
        }
    }

    get itemForFreeTest(): ProblemResultForFreeTestProps {
        return {
            mark: this._mark,
            testProblemId: this._testProblemId
        }
    }

    get mark(): number {
        return this._mark
    }

    set mark(value: number | string) {
        this._mark = Number(value)
    }

    get comment(): string {
        return this._comment
    }

    set comment(value: string) {
        this._comment = value
    }

    static create(props: ProblemResultProps): ProblemResult {
        return new ProblemResult(props)
    }
}

export default ProblemResult