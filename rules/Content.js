// @flow

import {Course} from "./Course";
import Webinar from "./Webinar";
import type {CourseProps} from "./Course";
import type {WebinarProps} from "./Webinar";
import type {TestProps} from "./Test";
import {Test} from "./Test";

export type ContentProps = {
    view: View,
    categoryId?: ?string,
    breadCrumbs?: ?BreadCrumbs,
    categories?: ?Categories,
    problemTypes?: ?ProblemTypes,
    problems?: ?Problems,
    videoLessons?: ?VideoLessons,
    tests?: ?Array<TestProps>,
    paidTests?: ?Array<TestProps>,
    webinars?: ?Array<WebinarProps>,
    courses: Courses
}

export type View = "sections" | "topics" | "topic" | "type-problems" | "problem" | "video-lesson" | "course"
type BreadCrumbs = Array<{heading: string, alias: string}>
type Categories = Array<{id: string, heading: string, alias: string}>
type ProblemTypes = Array<ProblemType>
type ProblemType = {id: string, heading: string, alias: string, taskDesc: ?string}
type Problems = Array<Problem>
type Problem = {
    id: string,
    key: string,
    parentId: string,
    commonDesc?: ?string,
    desc: string,
    solution: ?string,
    answer: ?string,
    isExample: boolean,
    src: ?string,
    srcNumb: ?string
}
type VideoLessons = Array<VideoLesson>
type VideoLesson = {id: string, key: string, videoId: string, heading: string, alias: string, path: string}
type Tests = Array<Test>
type Courses = Array<Course>

class Content {

    _view: View
    _categoryId: ?string
    _breadCrumbs: ?BreadCrumbs
    _categories: ?Categories
    _problemTypes: ?ProblemTypes
    _problems: ?Problems
    _videoLessons: ?VideoLessons
    _tests: ?Tests
    _paidTests: ?Tests
    _webinars: ?Array<Webinar>
    _courses: Courses

    constructor(props: ContentProps) {
        this._view = props.view
        this._categoryId = props.categoryId || null
        this._breadCrumbs = props.breadCrumbs || null
        this._categories = props.categories || null
        this._problemTypes = props.problemTypes || null
        this._problems = props.problems || null
        this._videoLessons = props.videoLessons || null
        this._tests = props.tests ? props.tests.map(test => Test.create(test)) : null
        this._paidTests = props.paidTests ? props.paidTests.map(test => Test.create(test)) : null
        this._webinars = props.webinars ? props.webinars.map(webinar => Webinar.create(webinar)) : null
        this._courses = props.courses.map(course => Course.create(course))
    }

    get replica(): ContentProps {
        return {
            view: this._view,
            categoryId: this._categoryId,
            breadCrumbs: this._breadCrumbs,
            categories: this._categories,
            problemTypes: this._problemTypes,
            problems: this._problems,
            videoLessons: this._videoLessons,
            tests: this._tests && this._tests.map(test => test.replica),
            paidTests: this._paidTests && this._paidTests.map(test => test.replica),
            webinars: this._webinars && this._webinars.map(webinar => webinar.replica),
            courses: this._courses.map(course => course.replica)
        }
    }

    get view(): View {
        return this._view
    }

    get categoryId(): ?string {
        return this._categoryId
    }

    get breadCrumbs(): ?BreadCrumbs {
        return this._breadCrumbs
    }

    get categories(): ?Categories {
        return this._categories
    }

    get isCategoryView(): boolean {
        return (this._view === 'sections' || this._view === 'topics') &&
            (this._categories ? this._categories.length > 0 : false)
    }

    get rootIdForLessons(): ?string {
        return this._view === "topic" ? this._categoryId : null
    }

    get videoLesson(): ?VideoLesson {
        return (this._view === "video-lesson" && this._videoLessons) ?
            this._videoLessons[this._videoLessons.length - 1] : null
    }

    get videoLessons(): ?VideoLessons {
        return this._videoLessons ?
            this._view === "video-lesson" ?
                this._videoLessons.slice(0, this._videoLessons.length - 1) : this._videoLessons
            : null
    }

    videoLessonsVisible(editModeOn: boolean): boolean {
        return (editModeOn && this._view === "topic") || this.videoLessonLength > 0
    }

    get videoLessonLength(): number {
        return this._videoLessons ?
            this._view === "video-lesson" ? this._videoLessons.length - 1 : this._videoLessons.length : -1
    }

    get problemTypes(): ?$ReadOnlyArray<ProblemType | Problem> {
        return this._problemTypes ?
            this._problems ? this._problemTypes.concat(this._problems) : this._problemTypes :
            null
    }

    problemTypesVisible(editModeOn: boolean): boolean {
        return this._view === "topic" && (editModeOn || (this._problemTypes ? this._problemTypes.length > 0 : false))
    }

    get problems(): ?Problems {
        return this._problems
    }

    problemsVisible(): boolean {
        return this._problems ? this._view === "type-problems" : false
    }

    get problemCommonDesc(): ?string {
        return this._problemTypes && this._problemTypes[0] && this._problemTypes[0].taskDesc
    }

    get problem(): ?Problem {
        return (this._problems && this._view === "problem") ?
            {commonDesc: this.problemCommonDesc, ...this._problems[0]} : null
    }

    get problemTypeHeader(): ?string {
        return (this._problemTypes && this._problemTypes.length === 1) ? this._problemTypes[0].heading : null
    }

    get tests(): ?Array<TestProps> {
        return this._tests && this._tests.map(test => test.replica)
    }

    testsVisible(editModeOn: boolean): boolean {
        return this.tests ? (editModeOn && this._view === "topic") || this.tests.length > 0 : false
    }

    get paidTests(): ?Array<TestProps> {
        return this._paidTests && this._paidTests.map((test: Test) => test.replica)
    }

    paidTestsVisible(editModeOn: boolean): boolean {
        return this.paidTests ? (editModeOn && this._view === "topic") || this.paidTests.length > 0 : false
    }

    get webinars(): ?Array<WebinarProps> {
        return this._webinars && this._webinars.map(webinar => webinar.replica)
    }

    webinarsVisible(editModeOn: boolean): boolean {
        return this.webinars ? (editModeOn && this._view === "topic") || this.webinars.length > 0 : false
    }

    get courses(): Array<CourseProps> {
        return this._courses.map(course => course.replica)
    }

    coursesVisible(editModeOn: boolean): boolean {
        return editModeOn || this.courses.length > 0
    }

    get course() :Course {
        if (this._view !== "course") throw new Error("Метод не используется для view != course")
        if (!this._courses[0]) throw new Error("Для view == course ожидалается обязательное наличие одного Course")
        return this._courses[0]
    }

    static create(props: ContentProps): Content {
        return new Content(props)
    }

    static getCourseContentProps(courseProps: CourseProps): ContentProps {
        return {view: "course", courses: [courseProps]}
    }
}

export default Content