// @flow

import GraphQLObject from "./GraphQLObject";
import type {Resolve} from "./GraphQLObject";
import GraphQLLesson from "./Lesson";
import type {LessonResponseType, LessonUserDataResponseType} from "./Lesson";

type UserDataResolverType = Resolve<UserDataVarsType, TopicUserDataResponseType>
type UserDataVarsType = {
    id: string
}

export type TopicUserDataResponseType = Array<LessonUserDataResponseType>
export type TopicResponseType = {
    lessons: Array<LessonResponseType>
}

class GraphQLTopic extends GraphQLObject {

    static getUserData: UserDataResolverType = async (vars, context) => {
        try {
            const {id} = vars
            const {dataSource} = context
            const lessons = await dataSource.courseVideoLessons.find({parentId: id})
            return await Promise.all(lessons.map(lesson => GraphQLLesson.getUserData({id: lesson.id}, context)))
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    static root = {
        topicUserData: GraphQLTopic.getUserData
    }

    static query = `
            topicUserData(id: ID!): [LessonUserData!]!
        `
}

export default GraphQLTopic