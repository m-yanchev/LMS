// @flow

import GraphQLObject from "./GraphQLObject";
import type {Resolve} from "./GraphQLObject";
import GraphQLTest from "./Test";
import type {TestResponseType} from "./Test";
import {Solutions} from "../../rules/Solutions";
import GraphQLSolution from "./Solution";

type UserDataResolverType = Resolve<UserDataVarsType, LessonUserDataResponseType>

export type LessonUserDataResponseType = {
    test: TestResponseType | null,
    success: boolean
}
export type LessonResponseType = {
    tests: Array<TestResponseType>
}

type UserDataVarsType = {
    id: string
}

class GraphQLLesson extends GraphQLObject {

    static getUserData: UserDataResolverType = async (vars, context) => {

        const {id} = vars
        const {dataSource} = context

        const courseTests = await dataSource.courseTests.find({parentId: id})

        const solutionArray = await Promise.all(courseTests.map(courseTest =>
            GraphQLSolution.getObject({testId: courseTest.testId, isUserData: true}, context)
        ))
        const solutions = Solutions.createFromObjectArray(solutionArray)

        return {
            test: solutions.actualTest ? GraphQLTest.objectToResponse(solutions.actualTest) : null,
            success: solutions.isSuccess
        }
    }

    static root = {
        lessonUserData: GraphQLLesson.getUserData,
    }

    static query = `
            lessonUserData(id: ID!): LessonUserData!
        `

    static types = `
            type LessonUserData {
                test: Test
                success: Boolean!
            }
        `
}

export default GraphQLLesson