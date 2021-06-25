// @flow

import type {SolutionProps} from "../Solution";
import {Solution} from "../Solution";
// import type {ProblemResultProps} from "../ProblemResult";
import {ObjectDS} from "./ObjectDS";
import {InstanceError} from "../ErrorHandler/InstanceError";

export interface ISolutionDS {
    // get: GetSolutionProps => Promise<SolutionProps>,
    // update: UpdateSolutionProps => Promise<void>,
    // insert: InsertSolutionProps => Promise<string>,
    make: Make,
    putProblemResult: ProblemResultMutation
}

export type Make = MakeVars => Promise<SolutionProps>
export type MakeDS = MakeVars => Promise<Solution>
export type MakeVars = {
    testId: string
}

export type ProblemResultMutation = PutProblemResultVars => Promise<SolutionProps>
export type ProblemResultDS = PutProblemResultVars => Promise<Solution>
export type PutProblemResultVars = {
    id: string,
    testProblemId: string,
    answer?: string
}

/*export type GetSolutionProps = {
    testId: string
}

export type UpdateSolutionProps = {
    id: string,
    problemResults: Array<ProblemResultProps>
}

export type InsertSolutionProps = {
    testId: string,
    problemResults: Array<ProblemResultProps>
}*/

export class SolutionDS extends ObjectDS<{}> {

    // _get: (GetSolutionProps => Promise<SolutionProps>) | null
    // _update: (UpdateSolutionProps => Promise<void>) | null
    // _insert: (InsertSolutionProps => Promise<string>) | null
    _make: Make | null
    _putProblemResult: ProblemResultMutation | null

    constructor(props: ?ISolutionDS) {
        super(props)
        // this._get = props ? props.get : null
        // this._insert = props ? props.insert : null
        // this._update = props ? props.update : null
        this._make = props ? props.make : null
        this._putProblemResult = props ? props.putProblemResult : null
    }

    static create(props: ?ISolutionDS) {
        return new SolutionDS(props)
    }

    make: MakeDS = async ({testId}) => {
        if (!this._make) throw InstanceError.create("make")
        return Solution.create(await this._make({testId}))
    }

    putProblemResult: ProblemResultDS = async props => {
        if (!this._putProblemResult) throw InstanceError.create("putProblemResult")
        return Solution.create(await this._putProblemResult(props))
    }

    /*async get(testId: string): Promise<Solution> {
        if (!this._get) throw InstanceError.create("get")
        return Solution.create(await this._get({testId}))
    }*/

    /*async insert(data: InsertSolutionProps): Promise<string> {
        if (!this._insert) throw InstanceError.create("insert")
        return this._insert({testId: data.testId, problemResults: data.problemResults})
    }*/

    /*async update(data: UpdateSolutionProps): Promise<void> {
        if (!this._update) throw InstanceError.create("update")
        return this._update({id: data.id, problemResults: data.problemResults})
    }*/
}