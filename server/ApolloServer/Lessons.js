// @flow

import type {Resolver} from "./index";
import type {TestResponse} from "./Tests";
import {gql} from "@apollo/client/core";
import {IResolvers} from "graphql-tools";

const TYPE_DEFS = gql`
    type Query {
        lessons(topicId: ID!): [Lesson!]!
    }
    type Lesson {
        id: ID!
    }
`

export interface ICourseVideoLessonsDataAPI {
    find: ListFilter => Promise<Array<OneData>>
}
type ListFilter = {
    parentId: string
}
type OneData = {
    id: string
}

export type LessonsResolver = Resolver<any, ListArgs, LessonsResponse>
type ListArgs = {
    topicId: string
}
type LessonsResponse = Array<LessonResponse>
export type LessonResponse = {
    id: string,
    tests: Array<TestResponse>
}

export class Lessons {

    static getLessons: LessonsResolver = async (parent, args, context) => {
        const {topicId} = args
        const {dataSources} = context
        const {db} = dataSources
        const courseVideoLessons = await db.courseVideoLessons.find({parentId: topicId})
        return Lessons.lessonsDataToResponse(courseVideoLessons)
    }

    static lessonsDataToResponse(data: Array<OneData>): Array<LessonResponse> {
        return data.map(lesson => Lessons.dataToResponse(lesson))
    }

    static dataToResponse(data: OneData): LessonResponse {
        const {id} = data
        return {id, tests: []}
    }

    static get typeDefs(): string {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            Query: {
                lessons: Lessons.getLessons
            }
        }
    }
}