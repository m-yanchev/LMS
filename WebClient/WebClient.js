// @flow

import {SolutionClient} from "./Solution";
import {Profile} from "./Profile";
import {Course} from "./Course";
// import {TestClient} from "./Test";
import {LessonClient} from "./Lesson";
import {ApolloClient, InMemoryCache} from "@apollo/client";
import {LoggerClient} from "./Logger";
import {TestProblemClient} from "./TestProblem";
import {ProblemResultClient} from "./ProblemResult";

const URI = "/api/v1"
const NAME = "api"
const VER = "1.0"

export class WebClient {

    static root = {
        solution: {
            // get: SolutionClient.get,
            // update: SolutionClient.update,
            // insert: SolutionClient.insert
            make: SolutionClient.make,
            putProblemResult: SolutionClient.putProblemResult
        },
        profile: {
            data: Profile.get()
        },
        course: {
            data: Course.get()
        },
        /*test: {
            get: TestClient.get
        },*/
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

    /*static Solution = {
        load: SolutionClient.get,
        update: SolutionClient.update,
        insert: SolutionClient.insert
    }*/

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