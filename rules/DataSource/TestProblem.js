// @flow

import type {TestProblemProps} from "../TestProblem";
import {ObjectDS} from "./ObjectDS";
import {InstanceError} from "../ErrorHandler/InstanceError";

export interface ITestProblemDS {
    problems: ProblemsQuery
}

export type ProblemsQuery = ProblemsArgs => Promise<Array<TestProblemProps>>
type ProblemsArgs = {
    testId: string
}

export class TestProblemDS extends ObjectDS<{}> {

    _problems: ProblemsQuery | null

    constructor(props: ?ITestProblemDS) {
        super(props)
        this._problems = props ? props.problems : null
    }

    static create(props: ?ITestProblemDS): TestProblemDS {
        return new TestProblemDS(props)
    }

    problems: ProblemsQuery = async args => {
        if (!this._problems) throw InstanceError.create("problems")
        return await this._problems(args)
    }
}