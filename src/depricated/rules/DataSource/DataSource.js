// @flow

import {Profile} from "../Profile";
import {ProfileDS} from "./Profile";
import type {IProfileDS} from "./Profile";
import {Course} from "../Course";
import {CourseDS} from "./Course";
import type {ICourseDS} from "./Course";
import {SolutionDS} from "./Solution";
import type {ISolutionDS} from "./Solution";
import {TopicDS} from "./Topic";
import type {ITopicDS} from "./Topic";
import {InstanceError} from "../ErrorHandler/InstanceError";
import type {ITestDS} from "./Test";
import {TestDS} from "./Test";
import {LessonDS} from "./Lesson";
import type {ILessonDS} from "./Lesson";
import type {ITestProblemDS} from "./TestProblem";
import {TestProblemDS} from "./TestProblem";
import type {IProblemResultDS} from "./ProblemResult"
import {ProblemResultDS} from "./ProblemResult"

interface IDataSource {
    +solution?: ISolutionDS,
    +profile?: IProfileDS,
    +course?: ICourseDS,
    +topic?: ITopicDS,
    +test?: ITestDS,
    +lesson?: ILessonDS,
    +testProblem?: ITestProblemDS,
    +problemResult?: IProblemResultDS
}

export class DataSource {

    _solutionDS: SolutionDS
    _profileDS: ProfileDS
    _courseDS: CourseDS
    _topicDS: TopicDS
    _testDS: TestDS
    _lessonDS: LessonDS
    _testProblemDS: TestProblemDS
    _problemResultDS: ProblemResultDS

    constructor(props: IDataSource) {
        this._solutionDS = SolutionDS.create(props.solution)
        this._profileDS = ProfileDS.create(props.profile)
        this._courseDS = CourseDS.create(props.course)
        this._topicDS = TopicDS.create(props.topic)
        this._testDS = TestDS.create(props.test)
        this._lessonDS = LessonDS.create(props.lesson)
        this._testProblemDS = TestProblemDS.create(props.testProblem)
        this._problemResultDS = ProblemResultDS.create(props.problemResult)
    }

    static create(props: IDataSource): DataSource {
        return new DataSource(props)
    }

    get solutionDS(): SolutionDS {
        if (!this._solutionDS) throw InstanceError.create("solutionDS")
        return this._solutionDS
    }

    get profileDS(): ProfileDS {
        if (!this._profileDS) throw InstanceError.create("profileDS")
        return this._profileDS
    }

    get profile(): Profile {
        return this.profileDS.profile
    }

    get courseDS(): CourseDS {
        if (!this._courseDS) throw InstanceError.create("courseDS")
        return this._courseDS
    }

    get course(): Course {
        return this.courseDS.course
    }

    get topicDS(): TopicDS {
        if (!this._topicDS) throw InstanceError.create("courseDS")
        return this._topicDS
    }

    get lessonDS(): LessonDS {
        return this._lessonDS
    }

    get testProblemDS(): TestProblemDS {
        return this._testProblemDS
    }
}