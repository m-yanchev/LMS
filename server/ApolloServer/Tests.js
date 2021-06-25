// @flow

import type {Resolver} from "./index";
import type {LessonResponse} from "./Lessons";
import type {TestProblemResponse} from "./TestProblems";
import {gql} from "@apollo/client/core";
import type {SolutionResponse} from "./Solutions";

const TYPE_DEFS = gql`
    extend type Lesson {
        tests: [Test!]!
    }
    type Test {
        id: ID!
        heading: String!
        isPaid: Boolean!
    }
`

export interface ITestsDataAPI {
    findOne: TestFilter => Promise<TestData>
}
export interface ICourseTestsDataAPI {
    find: CourseTestsFilter => Promise<Array<CourseTestData>>
}
type TestFilter = {
    id: string
}
type CourseTestsFilter = {
    parentId: string
}
type TestData = {
    id: string,
    heading: string,
    isPaid: boolean
}
type CourseTestData = {
    testId: string
}

export type TestsResolver = Resolver<LessonResponse, ListArgs, Array<TestResponse>>
type ListArgs = {}
export type TestResponse = {
    id: string,
    heading: string,
    isPaid: boolean,
    testProblems: Array<TestProblemResponse>,
    solution: SolutionResponse | null
}

export class Tests {

    static getTests: TestsResolver = async (parent, args, context) => {
        const {id} = parent
        const {dataSources} = context
        const {db} = dataSources
        const courseTests = await db.courseTests.find({parentId: id})
        const tests = await Promise.all(courseTests.map(courseTest =>
            db.tests.findOne({id: courseTest.testId})))
        return Tests.testsDataToResponse(tests)
    }

    static testsDataToResponse(tests: Array<TestData>): Array<TestResponse> {
        return tests.map(test => Tests.dataToResponse(test))
    }

    static dataToResponse(test: TestData): TestResponse {
        const {id, heading, isPaid} = test
        return {id, heading, isPaid, testProblems: [], solution: null}
    }

    static get typeDefs(): string {
        return TYPE_DEFS
    }

    static get resolvers() {
        return {
            Lesson: {
                tests: Tests.getTests
            }
        }
    }
}
