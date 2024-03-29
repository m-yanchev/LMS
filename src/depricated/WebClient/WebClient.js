// @flow

import {SolutionClient} from "./Solution";
import {Profile} from "./Profile";
import {Course} from "./Course";
import {LessonClient} from "./Lesson";
import {ApolloClient, InMemoryCache} from "@apollo/client";
import {LoggerClient} from "./Logger";
import {TestProblemClient} from "./TestProblem";

const URI = "/api/v1"
const NAME = "api"
const VER = "1.0"

export class WebClient {

    static root = {
        solution: {
            make: SolutionClient.make,
            putProblemResult: SolutionClient.putProblemResult,
            send: SolutionClient.send
        },
        profile: {
            data: Profile.get(),
            getSendingSolutionsAvailable: Profile.getSendingSolutionsAvailable
        },
        course: {
            data: Course.get()
        },
        lesson: {
            lessonsUserData: LessonClient.getLessonsUserData
        },
        testProblem: {
            problems: TestProblemClient.getProblems
        }
    }

    static logger = {
        write: LoggerClient.write
    }

    static create(): ApolloClient {
        return new ApolloClient({
            uri: URI,
            cache: new InMemoryCache(),
            name: NAME,
            version: VER,
            ssrMode: true
        })
    }
}