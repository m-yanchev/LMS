// @flow

import type {ProblemProps} from "./Problem";
import Problem from "./Problem";

export type TestProblemProps = {
    id: string,
    time: number,
    rating: number,
    problem?: ?ProblemProps
}

class TestProblem {

    _id: string
    _time: number
    _rating: number
    _problem: Problem | null
    _leftTime: number

    constructor(props: TestProblemProps) {
        this._id = props.id
        this._time = props.time
        this._rating = props.rating
        this._problem = props.problem ? Problem.create(props.problem) : null
        this._leftTime = props.time * 60
    }

    get item(): TestProblemProps {
        return {
            id: this._id,
            time: this._time,
            rating: this._rating,
            problem: this._problem && this._problem.item
        }
    }

    get id(): string {
        return this._id
    }

    get problem(): Problem {
        if (!this._problem) throw new Error('Ожидалось наличие problem')
        return this._problem
    }

    get commonDesc(): string | null {
        return this.problem.commonDesc
    }

    get desc(): string {
        return this.problem.desc
    }

    get solution(): string | null {
        return this.problem.solution
    }

    get answer(): string | null {
        return this.problem.answer
    }

    get key(): string {
        return this.problem.key
    }

    get mark(): number {
        return this._rating
    }

    get time(): number {
        return this._time
    }

    decLeftTime(): boolean {
        if (this._leftTime > 0) {
            this._leftTime--
            return true
        }
        return false
    }

    static create(props: TestProblemProps): TestProblem {
        return new TestProblem(props)
    }
}

export default TestProblem