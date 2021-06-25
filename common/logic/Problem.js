// @flow

import Loader from "../../WebClient/Loader";

export type ProblemProps = {
    commonDesc: string | null,
    desc: string,
    solution: string | null,
    answer: string | null,
    key: string
}

class Problem {

    _commonDesc: string | null
    _desc: string
    _solution: string | null
    _answer: string | null
    _key: string

    constructor(props: ProblemProps) {
        this._commonDesc = props.commonDesc || null
        this._desc = props.desc
        this._solution = props.solution || null
        this._answer = props.answer || null
        this._key = props.key
    }

    get item(): ProblemProps {
        return {
            commonDesc: this._commonDesc,
            desc: this._desc,
            solution: this._solution,
            answer: this._answer,
            key: this._key
        }
    }

    get commonDesc(): string | null {
        return this._commonDesc
    }

    get desc(): string {
        return this._desc
    }

    get solution(): string | null {
        return this._solution
    }

    get answer(): string | null {
        return this._answer
    }

    get key(): string {
        return this._key
    }

    static fields = `
        commonDesc
        desc
        solution
        answer
        key
    `

    static query = `problem(id: ID!){
        ${Problem.fields}
    }`

    static async load(id: string): Promise<Problem> {
        return Problem.create(await Loader.requestBySchema({query: Problem.query, args: {id}}))
    }

    static create(props: ProblemProps): Problem {
        return new Problem(props)
    }
}

export default Problem