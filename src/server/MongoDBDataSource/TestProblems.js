// @flow

import DB from "./DB";
import {TestProblem} from "../../depricated/rules/TestProblem";
import type {TestProblemsFilterType} from "../Schema/TestProblem";
import {NumbItems} from "./Items";
import {InstanceError} from "../../depricated/rules/ErrorHandler/InstanceError";
import type {GetObject, Record} from "../ApolloServer/TestProblems";
import type {TestProblemProps} from "../../depricated/rules/TestProblem";

export class TestProblems extends NumbItems {

    constructor(db: DB) {
        super("testProblems", db);
    }

    getObject: GetObject = async ({id}) => {
        const testProblem = await super.findOne({id})
        if (!testProblem) throw InstanceError.create("testProblem")
        return TestProblem.create(TestProblems.dataToObjectProps(testProblem))
    }

    async getObjects(filter: TestProblemsFilterType): Promise<Array<TestProblem>> {
        const testProblems = await super.find(filter)
        return testProblems.map(testProblem => {
            const {id, time, problemId, rating} = testProblem
            if (!id) throw InstanceError.create("id")
            if (!time) throw InstanceError.create("time")
            if (!rating) throw InstanceError.create("rating")
            return TestProblem.create({id, time, estimate: rating, problem: {id: problemId}})
        })
    }

    static dataToObjectProps(data: Record): TestProblemProps {
        const {id, rating, time, parentId, problemId} = data
        return {id, estimate: rating, time, testId: parentId, problemId}
    }
}