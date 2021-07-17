// @flow

export type TestResultProps = {
    estimate?: ?number,
    comment?: ?string,
    prevEstimate?: ?number
}

export class TestResult {

    _estimate: number
    _comment: string | null
    _prevEstimate: number | null

    constructor(props: TestResultProps) {
        this._estimate = props.estimate || 0
        this._comment = props.comment || null
        this._prevEstimate = typeof props.prevEstimate === "number" ? props.prevEstimate : null
    }

    static create(props: TestResultProps) {
        return new TestResult(props)
    }

    replica(): TestResultProps {
        return {
            estimate: this._estimate,
            comment: this._comment,
            prevEstimate: this._prevEstimate
        }
    }

    set estimate(estimate: number) {
        this._estimate = estimate
    }

    get estimate(): number {
        return this._estimate
    }

    set comment(comment: string) {
        this._comment = comment
    }

    get comment(): string | null {
        return this._comment
    }

    static folder = "results"
}