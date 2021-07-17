// @flow

import type {LessonsUserDataQuery} from "../rules/DataSource/Lesson";
import type {LessonProps} from "../rules/Lesson";
import {TestClient} from "./Test";
import {gql} from "@apollo/client/core";
import {WebClient} from "./WebClient";
import type {LessonResponse} from "../../server/ApolloServer/Lessons";
import ErrorHandler from "../rules/ErrorHandler";

const LESSONS_USER_DATA_QUERY = gql`
    query LessonsUserData($id: ID!) {
        lessons(topicId: $id) {
            id
            tests {
                id
                heading
                isPaid
                testProblems {
                    id
                    estimate
                    time
                }
                solution {
                    id
                    sentTimeStamp
                    verifiedTimeStamp
                    comment
                    problemResults {
                        testProblemId
                        estimate
                        comment
                    }
                }
            }
        }
    }`

export class LessonClient {

    static getLessonsUserData: LessonsUserDataQuery = async vars => {
        try {
            const client = WebClient.create()
            const {lessons} = (await client.query({query: LESSONS_USER_DATA_QUERY, variables: vars})).data
            return LessonClient.lessonsResponseToProps(lessons)
        } catch (e) {
            throw ErrorHandler.create({
                error: e,
                props: {module: "LessonClient", method: "getLessonUserData", vars: [{name: "topicId", value: vars.id}]}
            })
        }
    }

    static lessonsResponseToProps(lessons: Array<LessonResponse>): Array<LessonProps> {
        return lessons.map(lesson => LessonClient.oneResponseToProps(lesson))
    }

    static oneResponseToProps(lesson: LessonResponse): LessonProps {
        const {id, tests} = lesson
        return {
            id,
            tests: tests.map(test => TestClient.oneResponseToProps(test))
        }
    }
}