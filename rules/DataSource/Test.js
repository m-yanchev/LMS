// @flow

// import type {TestProps} from "../Test";
import {ObjectDS} from "./ObjectDS";
import {InstanceError} from "../ErrorHandler/InstanceError";
// import {Test} from "../Test";

export interface ITestDS {
    // get: GetTest
}

// type GetTest = GetTestProps => Promise<TestProps>
export type GetTestProps = {
     lessonId: string
}

export class TestDS extends ObjectDS<{}> {

    // _get: GetTest | null

    constructor(props: ?ITestDS) {
        super(props)
        // this._get = props ? props.get : null
    }

    static create(props: ?ITestDS) {
        return new TestDS(props)
    }

    // async get(props: GetTestProps): Promise<Test> {
    //     if (!this._get) throw InstanceError.create("get")
    //     return Test.create(await this._get(props))
    // }
}