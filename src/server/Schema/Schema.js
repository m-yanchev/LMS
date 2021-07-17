import TestResult from "../../depricated/common/logic/TestResult";
import PostTransport from "../PostTransport";

const {graphql, buildSchema} = require('graphql');
const {graphqlHTTP} = require('express-graphql');
const dbClient = require("../dbClient");
const Uploader = require("../Uploader");
const {getAliases} = require("../../depricated/common/helpers");

import {getImagePath} from "../Uploader";
import type {ProfileProps} from "../../depricated/common/logic/Profile";
import Subscription from "../../depricated/common/logic/Subscription";
import DB from "../MongoDBDataSource/DB";
import GraphQLLesson from "./Lesson";
import GraphQLTopic from "./Topic";
import GraphQLTest from "./Test";
import GraphQLSolution from "./Solution";
import GraphQLTestProblem from "./TestProblem";
import GraphQLProblem from "./Problem";
import GraphQLProblemResult from "./ProblemResult";
import GraphQLProfile from "./Profile";

export async function sendResponse(req, res) {
    try {
        const {files, user} = req
        const db = await DB.open()
        const baseGraphQL = new BaseGraphQL(db)
        await graphqlHTTP({
            schema: baseGraphQL.schema,
            rootValue: baseGraphQL.root,
            graphiql: true,
            context: {dataSource: db, files, user, reqPublic: true}
        })(req, res);
        db.close()
    } catch (e) {
        console.error("Schema.sendResponse: e = %o", e)
    }
}

export type MakeResponse<T, ResT> = (string, ?T, ?ProfileProps) => Promise<ResT>

export async function makeResponse(query, variables, user) {
    const db = await DB.open()
    const context = {dataSource: db, user, reqPublic: false}
    const baseGraphQL = new BaseGraphQL(db)
    const response = await graphql(baseGraphQL.schema, query, baseGraphQL.root, context, variables)
    db.close()
    if (response.errors) {
        throw new Error(response.errors[0])
    } else {
        return response.data
    }
}

class BaseGraphQL {

    constructor(DB) {
        this._DB = DB
        this._items = [
            GraphQLLesson,
            GraphQLTopic,
            GraphQLTest,
            GraphQLSolution,
            GraphQLTestProblem,
            GraphQLProblem,
            GraphQLProblemResult,
            GraphQLProfile
        ]
        this._schema = buildSchema(this.query + this.mutation + this.types)
    }

    get query() {
        return `type Query { 
            ${this._items.reduce((query, item) => query + item.query, this._query)}
        }`
    }

    get mutation() {
        return `type Mutation {
            ${this._items.reduce((mutation, item) => mutation + item.mutation, this._mutation)}
        }`
    }

    get types() {
        return this._items.reduce((types, item) => types + item.types, this._types)
    }

    get DB() {
        return this._DB
    }

    get schema() {
        return this._schema
    }

    get root() {
        const DB = this.DB
        return this._items.reduce((root, item) => ({...root, ...item.root}),
        {
            "solutionStatus": (data, context) => tryDoASTeacher(data, context, solutionStatus),
            solutions: (data, context) => tryDoASTeacher(data, context, solutions),
            "sendSolution": sendSolution,
            "insertWebinarRegistration": (args, context) => tryDoAsPrivate(args, context, insertWebinarRegistration),
            "webinarRegistration": webinarRegistration,
            "updateUser": (args, context) => tryDoAsPrivate(args, context, updateUser),
            "incChecks": (args, context) => tryDoAsPrivate(args, context, incChecks),
            "decCheck": decCheck,
            "updatePayment": (args, context) => tryDoAsPrivate(args, context, updatePayment),
            "insertPayment": (args, context) => tryDoAsPrivate(args, context, insertPayment),
            "insertProfile": insertProfile,
            "removeProfile": removeProfile,
            "subscription": subscription,
            "handleSolutionCheck": (data, context) => tryDoASTeacher(data, context, handleSolutionCheck),
            "courseSolutionsAdmin": courseSolutionsAdmin,
            "insertCourseSolution": insertCourseSolution,
            "serviceRegistration": (filter) => DB.serviceRegistrations.findOne(filter),
            "course": getCourse,
            "list": list,
            "topic": topic,
            "webinar": webinar,
            "videoLesson": videoLesson,
            "courseTopics": courseTopics,
            "courseWebinars": courseWebinars,
            "courseVideoLessons": courseVideoLessons,
            "updatePendingStatusForWebinarRegisters": (args, context) =>
                tryDoAsPrivate(args, context, updateWebinarRegsStatus),
            "updatePendingStatusForCourseRegisters": (args, context) =>
                tryDoAsPrivate(args, context, updateCourseRegsStatus),
            "registerUserForService": (data, {user}) => DB.serviceRegistrations.insert({...data, userId: user.id}),
            "payment": ({id}) => DB.payments.findOne({id}),
            "mutationPayment": (args, {user}) => dbClient({model: "payments", task: "insert", data: args, user}),
            "legal": ({type}) => type,
            content,
            "imageCount": ({key}) => Uploader.getImageCount(key),
            testResults: (args, {user}) => find("testResults", {}, user),
            tests,
            test: getTest,
            testProblems,
            problem,
            "problemSearchLists": () => find("problem-list"),
            "updateHeading": ({item}, {user}) => update("headings", item, user),
            "removeHeading": ({id}, {user}) => remove("headings", id, user),
            "replaceHeading": (data, {user}) => {
                return replace("headings", data, user)
            },
            "insertHeading": ({item}, {user}) => {
                return insert("headings", item, user)
            },
            "updateVideoLesson": async ({item}, {files, user}) => {
                try {
                    const {key, ...rest} = item
                    await Uploader.savePoster({files, key, prefix: "video"})
                    return update("videoLessons", rest, user)
                } catch (e) {
                    console.error("item = %o, error = %o", item, e)
                    throw e
                }
            },
            "removeVideoLesson": async ({id}, {user}) => {
                const {key, ...result} = await remove("videoLessons", id, user)
                await Uploader.removePoster({key, prefix: "video"})
                return result
            },
            "replaceVideoLesson": (data, {user}) => {
                return replace("videoLessons", data, user)
            },
            "insertVideoLesson": async ({item}, {files, user}) => {
                try {
                    const idPair = await insert("videoLessons", item, user)
                    await Uploader.savePoster({files, key: idPair.key, prefix: "video"})
                    return idPair
                } catch (e) {
                    console.error("item = %o, error = %o", item, e)
                    throw e
                }
            },
            "updateProblemType": ({item}, {user}) => {
                return update("headings", item, user)
            },
            "removeProblemType": ({id}, {user}) => {
                return remove("problemTypes", id, user)
            },
            "replaceProblemType": (data, {user}) => {
                return replace("problemTypes", data, user)
            },
            "insertProblemType": ({item}, {user}) => {
                return insert("headings", item, user)
            },
            "updateWebinar": ({item}, {user}) => {
                return update("webinars", item, user)
            },
            "removeWebinar": ({id}, {user}) => {
                return remove("webinars", id, user)
            },
            "replaceWebinar": (data, {user}) => {
                return replace("webinars", data, user)
            },
            "insertWebinar": ({item}, {user}) => {
                return insert("webinars", item, user)
            },
            "updateCourse": (data, context) => tryDoASTeacher(data, context, updateCourse),
            "removeCourse": removeCourse,
            "insertCourse": (data, context) => tryDoASTeacher(data, context, insertCourse),
            "replaceCourse": (data, context) => tryDoASTeacher(data, context, data => DB.courses.replace(data)),
            "updateCourseTopic": (data, context) => tryDoASTeacher(data, context, data => DB.courseTopics.update(data)),
            "removeCourseTopic": (data, context) => tryDoASTeacher(data, context, removeCourseTopic),
            "insertCourseTopic": (data, context) => tryDoASTeacher(data, context, data => DB.courseTopics.insert(data)),
            "updateCourseWebinar": (data, context) => tryDoASTeacher(data, context, data => DB.courseWebinars.update(data)),
            "removeCourseWebinar": (data, context) => tryDoASTeacher(data, context, data => DB.courseWebinars.remove(data)),
            "insertCourseWebinar": (data, context) => tryDoASTeacher(data, context, data => DB.courseWebinars.insert(data)),
            "updateCourseVideoLesson": (data, context) => tryDoASTeacher(data, context, data => DB.courseVideoLessons.update(data)),
            "removeCourseVideoLesson": (data, context) => tryDoASTeacher(data, context, data => DB.courseVideoLessons.remove(data)),
            "insertCourseVideoLesson": (data, context) => tryDoASTeacher(data, context, data => DB.courseVideoLessons.insert(data)),
            "replaceCourseVideoLesson": (data, context) => tryDoASTeacher(data, context, data => DB.courseVideoLessons.replace(data)),
            "updateCourseTest": (data, context) => tryDoASTeacher(data, context, data => DB.courseTests.update(data)),
            "removeCourseTest": (data, context) => tryDoASTeacher(data, context, data => DB.courseTests.remove(data)),
            "insertCourseTest": (data, context) => tryDoASTeacher(data, context, data => DB.courseTests.insert(data)),
            "replaceCourseTest": (data, context) => tryDoASTeacher(data, context, data => DB.courseTests.replace(data)),
            "updateProblem": async ({item}, {files, user}) => {
                try {
                    const {imageMap, ...rest} = item
                    if (!user || user.access !== "teacher") return false
                    await Uploader.saveProblemImages({files: files, imageMap})
                    return await dbClient({model: "tasks", task: "update", data: rest})
                } catch (e) {
                    console.error("item = %o, error = %o", item, e)
                    throw e
                }
            },
            "removeProblem": async ({id}, {user}) => {
                const {key, ok, message} = await remove("problem", id, user)
                if (ok) await Uploader.removeProblemImages(key)
                return {ok, message}
            },
            "replaceProblem": (data, {user}) => {
                return replace("problem", data, user)
            },
            "insertProblem": async ({item}, {user, files}) => {
                try {
                    const {imageMap, ...rest} = item
                    if (!user || user.access !== "teacher") return false
                    const idPair = await dbClient({model: "tasks", task: "insert", data: rest})
                    if (!imageMap) return idPair
                    const {key} = idPair
                    const props = {
                        files,
                        imageMap: {imageItems: imageMap.imageItems, key}
                    }
                    await Uploader.saveProblemImages(props)
                    return idPair
                } catch (e) {
                    console.error("item = %o, error = %o", item, e)
                    throw e
                }
            },
            "updateTestHeading": ({item}, {user}) => {
                return update("headings", item, user)
            },
            "removeTestHeading": ({id}, {user}) => {
                return remove("tests", id, user)
            },
            "replaceTestHeading": (data, {user}) => {
                return replace("tests", data, user)
            },
            "insertTestHeading": ({item}, {user}) => {
                return insert("headings", item, user)
            },
            "updateTestProblem": ({item}, {user}) => {
                return update("testProblems", item, user)
            },
            "removeTestProblem": ({id}, {user}) => {
                return remove("testProblems", id, user)
            },
            "replaceTestProblem": (data, {user}) => {
                return replace("testProblems", data, user)
            },
            "insertTestProblem": ({item}, {user}) => {
                return insert("testProblems", item, user)
            },
            insertProblemCheck: ({problemId, testId}, {user}) => {
                return dbClient({model: "problemChecks", task: "insert", data: {problemId, testId}, user})
            },
            "updateProblemCheck": ({problemId, testId}, {user}) => {
                return dbClient({model: "problemChecks", task: "update", data: {problemId, testId}, user})
            },
            "insertTestResult": ({testId}, {user}) => {
                return dbClient({model: "testResults", task: "insert", data: {testId}, user: user})
            }
        })

        function solutionStatus(data, context) {
            const {user} = context
            const {testId} = data
            return DB.solutions.findOne({testId, userId: user.id})
        }

        async function solutions() {
            try {
                const solutions = await DB.solutions.find({verifiedTimeStamp: null}, {revers: true})
                const [tests, profiles] = await Promise.all([
                    Promise.all(solutions.map(solution => getTest({id: solution.testId}))),
                    Promise.all(solutions.map(solution => DB.users.findOne({id: solution.userId})))
                ])
                return solutions.map((solution, index) => {
                    const {date, ...rest} = solution
                    return {
                        sentTimeStamp: date,
                        ...rest,
                        test: tests[index],
                        profile: profiles[index]
                    }
                })
            } catch (e) {
                console.error(e)
                throw e
            }
        }

        async function sendSolution(data, context) {
            await Promise.all([
                insertSolution(data, context),
                decCheck(data, context)
            ])
            return true
        }

        async function insertSolution(data, context) {
            try {
                const {testId} = data
                const {user, files} = context
                const {id} = await DB.solutions.insert({item: {testId, userId: user.id, date: Date.now()}})
                await Uploader.saveSolutions({key: id, files})
                return true
            } catch (e) {
                console.error(e)
                throw e
            }
        }

        async function getTest(data) {
            const test = await DB.tests.findOne(data)
            const testProblems = await DB.testProblems.find({parentId: test.id})
            const problems = await Promise.all(testProblems.map(testProblem =>
                DB.problems.findOne({id: testProblem.problemId})))
            return {
                ...test,
                testProblems: testProblems.map((testProblem, index) => ({...testProblem, problem: problems[index]}))
            }
        }

        async function insertWebinarRegistration(data) {
            await DB.webinarRegistrations.insert({item: data})
            return true
        }

        async function webinarRegistration(data, context) {
            try {
                const {webinarId} = data
                const {user} = context
                return Boolean(await DB.webinarRegistrations.findOne({userId: user.id, webinarId}))
            } catch (e) {
                console.error(e)
                throw e
            }
        }

        async function updateUser(data) {
            await DB.users.update({item: {id: data.id, subscription: data.subscription}})
            return true
        }

        async function incChecks(data) {
            await DB.users.updateChecks({id: data.userId, number: data.count})
            return true
        }

        async function decCheck(data, context) {
            const user = await DB.users.findOne({id: context.user.id})
            const subscription = Subscription.create(user.subscription)
            if (subscription.isActive) return true
            await DB.users.updateChecks({id: context.user.id, number: -1})
            return true
        }

        async function updatePayment(data) {
            await DB.payments.update({item: data})
            return true
        }

        async function insertPayment(data) {
            await DB.payments.insert({item: data})
            return true
        }

        async function insertProfile(data) {

        }

        async function removeProfile(data) {
            await DB.users.remove(data)
            return true
        }

        function subscription(data, context) {
            const {user} = context
            return DB.subscriptions.findOne({userId: user.id})
        }

        async function problem(data) {
            const problem = await DB.problems.findOne(data);
            const type = await DB.headings.findOne({id: problem.parentId});
            return {commonDesc: type.taskDesc, ...problem}
        }

        async function insertCourse(data, {files}) {
            const idPair = await DB.courses.insert(data)
            await Uploader.savePoster({files, key: idPair.id, prefix: "course"})
            return idPair
        }

        async function updateCourse(data, {files}) {
            const key = data.item.id
            await Uploader.savePoster({files, key, prefix: "course"})
            return DB.courses.update(data)
        }

        async function handleSolutionCheck({solutionId, comment, marks}) {

            try {

                const solution = await DB.courseSolutions.findOne({id: solutionId})
                const courseTest = await getCourseTest({id: solution.courseTestId})
                const user = await DB.users.findOne({id: solution.userId})
                const testProblems = await DB.testProblems.find({parentId: courseTest.test.id})
                const testResult = TestResult.create({userId: user.id, test: courseTest.test})
                testResult.makeEarnedMark(marks)
                testResult.makeFullMark(testProblems)

                await saveResultsToDB({userId: user.id, marks, courseTest, testResult})
                await sendToUser({courseTest, user, solutionId, marks, comment, testProblems, testResult})

            } catch (e) {
                console.error(e)
                throw e
            }

            async function saveResultsToDB({userId, marks, courseTest, testResult}) {
                await Promise.all(marks.map(mark => DB.problemResults.insert({item: {userId, ...mark}})))
                await DB.testResults.insert({item: testResult.item})
                await DB.courseSolutions.updateStatus({userId, courseTestId: courseTest.id})
            }

            async function sendToUser({courseTest, user, solutionId, marks, comment, testProblems, testResult}) {
                const lesson = await DB.courseVideoLessons.findOne({id: courseTest.parentId})
                const topic = await DB.courseTopics.findOne({id: lesson.parentId})
                const course = await DB.courses.findOne({id: topic.parentId})
                const registration = await getCourseRegistration({userId: user.id, parentId: course.id})
                const path = ["solutions", solutionId, TestResult.folder]
                const attachments = {
                    path: getImagePath(path),
                    fileNames: await Uploader.getFileNamesFromImageFolder(path)
                }
                const subject = "Результаты проверки самостоятельной работы"
                const list = marks.reduce((string, {comment, mark, testProblemId}, i) => {
                    const {rating} = testProblems.find(({id}) => id === testProblemId)
                    return string +
                        `<li>задание №${i + 1}: оценка <b>${mark}</b> из <b>${rating}</b>, "${comment}";</li>`
                }, ``)
                const html = `` +
                    `<p>Добрый день, ${user.name}!</p>` +
                    `<p>` +
                    `Спешу проинформировать Вас, что решения заданий самостоятельной работы ` +
                    `<b>"${courseTest.test.heading}"</b> проверены.` +
                    `</p>` +
                    `${testResult.isSuccess ? "<p>Поздравляю, самостоятельная работа <b>зачтена</b>.</p>" :
                        "<p>Увы, <b>результаты плохие</b>, но Вы не отчаивайтесь. Изучите комментарии, устраните пробелы и " +
                        "попробуйте ещё раз.</p>"}` +
                    `<h4>Комментарии и оценки к решениям заданий:</h4>` +
                    `<ul>${list}</ul>` +
                    `<h4>Общий комментарий:</h4>` +
                    `<p>"${comment}"</p>` +
                    `<p><b><i>Подробности проверки смотрите в прикрепленных к письму файлах.</i></b></p>`
                await PostTransport.send({email: registration.email, subject, html, attachments})
            }
        }

        async function getCourseTest(filter) {
            const {testId, ...courseTest} = await DB.courseTests.findOne(filter)
            return {
                ...courseTest,
                test: await DB.tests.findOne({id: testId})
            }
        }

        function getCourseRegistration(filter) {
            return DB.serviceRegistrations.findOne({...filter, service: "course"})
        }

        async function courseSolutionsAdmin() {

            const _topics = await courseTopics({})
            const _lessons = await listByParent({parentList: _topics, childFunc: courseVideoLessons})
            const _tests = await listByParent({parentList: _lessons, childFunc: courseTests})
            const _solutions = await listByParent({
                parentList: _tests,
                childFunc: courseSolutions,
                filterFieldName: "courseTestId",
                filter: {status: "sent"}
            })
            const _users = await Promise.all(_solutions.map(solution => DB.users.findOne({id: solution.userId})));
            return _solutions.map(({courseTestId, ...solution}) => ({
                ...solution,
                courseTest: _tests.find(test => test.id === courseTestId),
                user: _users.find(user => user.id === solution.userId)
            }))

            async function listByParent({parentList, childFunc, filterFieldName, filter}) {
                return (await Promise.all((parentList || []).map(({id}) => {
                    const _filterByField = {[filterFieldName || "parentId"]: id}
                    const _filter = filter ? {..._filterByField, ...filter} : _filterByField
                    return childFunc(_filter)
                }))).reduce((lessonArray, chunk) =>
                    lessonArray.concat(chunk), [])
            }
        }

        function courseSolutions(filter) {
            return DB.courseSolutions.find(filter)
        }

        async function list({name}) {
            try {
                return await DB[name].find()
            } catch (e) {
                console.error(e)
                throw e
            }
        }

        function videoLesson({id}) {
            return DB.videoLessons.findOne({id})
        }

        async function insertCourseSolution({courseTestId}, {user, files}) {
            try {
                const {id} = await DB.courseSolutions.insert({item: {courseTestId, userId: user.id, status: "sent"}})
                await Uploader.saveSolutions({key: id, files})
                return true
            } catch (e) {
                console.error(e)
            }
        }

        function tryDoASTeacher(data, context, mutation) {
            if (context.user.access !== "teacher") throw new Error("Access denied")
            return mutation(data, context)
        }

        function tryDoAsPrivate(data, {reqPublic}, mutation) {
            if (reqPublic) throw new Error("Access denied")
            return mutation(data)
        }

        function updateWebinarRegsStatus({userId}) {
            return updateServiceRegsStatus({userId, serviceName: "webinar", serviceCollectionName: "webinars"})
        }

        async function updateCourseRegsStatus({userId}) {
            return updateServiceRegsStatus({userId, serviceName: "course", serviceCollectionName: "courses"})
        }

        async function updateServiceRegsStatus({userId, serviceName, serviceCollectionName}) {
            const registration = await DB.serviceRegistrations.updatePendingStatus({userId, serviceName})
            const service = await DB[serviceCollectionName].findOne({id: registration.parentId}, {revers: true})
            const user = await DB.users.findOne({id: userId})
            return {[serviceName]: service, registration, user}
        }

        async function getCourse(filter) {
            try {
                const course = await DB.courses.findOne(filter)
                if (!course) return null
                const [topics, webinars] = await Promise.all([
                    courseTopics({parentId: course.id}),
                    courseWebinars({parentId: course.id})
                ])
                return {...course, topics, webinars}
            } catch (e) {
                console.error("Schema.course: filter = %o, error = %o", filter, e)
                throw e
            }
        }

        async function courseTopics(filter) {
            const courseTopics = await DB.courseTopics.find(filter, {revers: true})
            return Promise.all(courseTopics.map(async ({id, topicId, ...rest}) => ({
                id, ...rest,
                topic: await topic({id: topicId}),
                videoLessons: await courseVideoLessons({parentId: id}),
            })))
        }

        function topic(filter) {
            return DB.topics.findOne(filter)
        }

        async function courseWebinars(filter) {
            try {
                const {date, ...rest} = filter
                const courseWebinarsWithId = await DB.courseWebinars.find(rest)
                const courseWebinars = await Promise.all(courseWebinarsWithId.map(async ({webinarId, ...rest}) => ({
                    webinar: await webinar({id: webinarId}),
                    ...rest
                })))
                const dateNow = Date.now()
                return (!date ? courseWebinars : courseWebinars.filter(({webinar}) =>
                    dateNow < webinar.date && webinar.date < date
                )).sort((cw1, cw2) => cw1.webinar.date - cw2.webinar.date)
            } catch (e) {
                console.error(e)
                throw e
            }
        }

        function webinar(filter) {
            return DB.webinars.findOne(filter)
        }

        async function courseVideoLessons(filter) {
            const courseVideoLessons = await DB.courseVideoLessons.find(filter)
            return Promise.all(courseVideoLessons.map(async ({id, videoLessonId, ...rest}) => ({
                videoLesson: await DB.videoLessons.findOne({id: videoLessonId}),
                tests: await courseTests({parentId: id}),
                id, ...rest
            })))
        }

        async function courseTests(filter, {user} = {}) {
            const courseTests = await DB.courseTests.find(filter)
            return Promise.all(courseTests.map(async ({id, testId, ...rest}) => ({
                solution: user && user.id && await DB.courseSolutions.findOne({userId: user.id, courseTestId: id}),
                test: await getTest({id: testId}, {user}),
                id, ...rest
            })))
        }

        async function removeCourse({id}, context) {
            const failResult = getChildrenFail(await Promise.all([
                DB.courseTopics.find({parentId: id}),
                DB.courseWebinars.find({parentId: id})
            ]))
            return failResult ? failResult : tryDoASTeacher({id}, context, async data => {
                await Uploader.removePoster({key: id, prefix: "course"})
                return DB.courses.remove(data)
            })
        }

        async function removeCourseTopic({id}) {
            try {
                const failResult = getChildrenFail([await DB.courseVideoLessons.find({parentId: id})])
                return failResult ? failResult : DB.courseTopics.remove({id})
            } catch (e) {
                console.error(e)
                throw e
            }
        }

        async function testProblems({testId}, {user}) {
            try {

                const [testProblems, {heading}, lastCheckProblem] = await Promise.all([
                    DB.testProblems.find({parentId: testId}),
                    DB.headings.findOne({id: testId}),
                    DB.problemChecks.findOne({testId, userId: user.id})
                ])

                return {problems: testProblems, startIndex: getStartIndex(), heading}

                function getStartIndex() {
                    const nextIndex = lastCheckProblem ? testProblems.findIndex(item =>
                        item.problemId === lastCheckProblem.problemId) + 1 : 0
                    return nextIndex < testProblems.length ? nextIndex : 0
                }

            } catch (e) {
                console.error("Schema.testProblems: testId = %o, user = %o, error = %o", testId, user, e)
                throw e
            }
        }

        async function tests({parentId}, {user}) {
            try {
                const lessons = await getLessons({parentId, testsOnly: true, user})
                return lessons.tests
            } catch (e) {
                console.error("Schema.tests: parentId = %o, user = %o, error = %o", parentId, user, e)
                throw e
            }
        }

        async function content({path}, {user}) {

            const aliases = getAliases(path)
            const catProps = await getCategoryProps(aliases)
            if (!catProps) return null
            const level = aliases.length
            const views = ["sections", "topics", "topic", "type-problems", "problem"]
            const {parentId, lessonsParentId, categoryPath, breadCrumbs} = catProps

            const problemBook =
                level === 2 ? await getProblemTypes(parentId) :
                    level === 3 ? await getTypeProblems(parentId) :
                        level === 4 ? await getProblem(parentId) : null
            const {headings, videoLessons, ...restLessons} = await getLessons({
                parentId: lessonsParentId, catPath: categoryPath, user
            })

            return {
                view: getView(),
                categoryId: parentId,
                breadCrumbs,
                categories: level === 0 || level === 1 ? headings : null,
                problemTypes: problemBook && problemBook["problemTypes"],
                problems: problemBook && problemBook["problems"],
                videoLessons: level === 3 && !problemBook ? replaceToEnd(videoLessons, parentId) : videoLessons,
                ...restLessons,
                courses: DB.courses.find()
            }

            function replaceToEnd(items, id) {
                const itemIndex = items.findIndex(item => item.id === id)
                const item = items.splice(itemIndex, 1)
                return items.concat(item)
            }

            async function getProblem(id) {
                const problem = await DB.problems.findOne({id})
                const problemType = await DB.headings.findOne({id: problem.parentId})
                return {problemTypes: [problemType], problems: [problem]}
            }

            async function getProblemTypes(parentId) {
                const problemTypes = await DB.headings.find({parentId, type: undefined})
                const promises = problemTypes.map(({id}) => DB.problems.find({parentId: id, isExample: true}))
                const problemsByType = await Promise.all(promises)
                const problems = problemsByType.reduce((prevArray, problems) => prevArray.concat(problems), [])
                return {problemTypes, problems}
            }

            async function getTypeProblems(parentId) {
                const problemType = await DB.headings.findOne({id: parentId, type: undefined})
                if (!problemType) return
                const problems = await DB.problems.find({parentId})
                return {problemTypes: [problemType], problems}
            }

            async function getCategoryProps(aliases, props = {
                level: 0, parentId: "0", breadCrumbs: [], lesParentId: "0", lesRootPath: ""
            }) {
                const alias = aliases[props.level]
                let item
                let categoryId = props.level <= 2 ? props.parentId : props.lesParentId
                let categoryPath = props.lesRootPath
                if (alias) {
                    if (props.level <= 1) {
                        categoryPath += '/' + alias
                    }
                    if (props.level <= 2) {
                        item = await DB.headings.findOne({parentId: props.parentId, alias})
                    }
                    if (props.level === 2 && !item) {
                        item = await DB.videoLessons.findOne({parentId: props.parentId, alias})
                    }
                    if (props.level === 3) {
                        item = await DB.problems.findOne({parentId: props.parentId, key: alias})
                    }
                    if (!item) return null
                    const heading = props.level < 3 ? item.heading : item.key || item.id
                    return getCategoryProps(aliases, {
                        level: props.level + 1,
                        parentId: item.id,
                        breadCrumbs: props.breadCrumbs.concat([{heading, alias}]),
                        lesParentId: categoryId,
                        lesRootPath: categoryPath
                    });
                }
                return {
                    parentId: props.parentId,
                    lessonsParentId: categoryId,
                    breadCrumbs: props.breadCrumbs,
                    categoryPath
                }
            }

            function getView() {
                if (level === 3 && !problemBook) {
                    return "video-lesson"
                }
                return views[level]
            }
        }

        async function getLessons({parentId, user, catPath, testsOnly}) {

            const headings = await DB.headings.find({parentId})

            const lessonsPromises = headings.map(item =>
                getLessons({parentId: item.id, user, catPath: catPath + '/' + item.alias, testsOnly})
            )
            const lessons = await Promise.all(lessonsPromises)

            return testsOnly ? {
                tests: await getItemsByMethod(testsSearchMethod, "tests", parentId)
            } : {
                headings,
                videoLessons: await getItemsByMethod(videoLessonsSearchMethod, "videoLessons", parentId),
                tests: await getItemsByMethod(testsSearchMethod, "tests", parentId),
                paidTests: await getItemsByMethod(paidTestsSearchMethod, "paidTests", parentId),
                webinars: await getItemsByModelName(DB.webinars, "webinars", parentId)
            }

            async function testsSearchMethod(parentId) {
                return getTests({user, parentId, type: "test"})
            }

            async function paidTestsSearchMethod(parentId) {
                return getTests({user, parentId, type: "paid-test"})
            }

            async function videoLessonsSearchMethod(parentId) {
                const videoLessons = await DB.videoLessons.find({parentId})
                videoLessons.forEach(item => item.path = catPath)
                return videoLessons
            }

            async function getItemsByModelName(Model, fieldName, parentId) {
                return getItemsByMethod(parentId => Model.find({parentId}), fieldName, parentId)
            }

            async function getItemsByMethod(method, fieldName, parentId) {
                const firstItems = await method(parentId)
                return lessons.reduce((prevItems, lessons) => prevItems.concat(lessons[fieldName]), firstItems)
            }
        }

        async function getTests({user, ...filter}) {

            const headings = await DB.headings.find(filter)

            const testProblemsPromises = headings.map(item => {
                return DB.testProblems.find({parentId: item.id})
            })
            const problemChecksPromises = user ? headings.map(item => {
                return DB.problemChecks.find({testId: item.id, userId: user.id})
            }) : []
            const lastTestResultPromises = user ? headings.map(item => {
                return DB.testResults.findOne({testId: item.id, userId: user.id})
            }) : []

            const [testProblemsList, problemChecksList, lastTestResultList] = await Promise.all([
                Promise.all(testProblemsPromises),
                Promise.all(problemChecksPromises),
                Promise.all(lastTestResultPromises)
            ])

            return headings.map((heading, i) => {

                const {fullTime, highestMark} = testProblemsList[i].reduce((previousValue, testProblem) => {
                    const fullTime = previousValue.fullTime + testProblem.time
                    const highestMark = previousValue.highestMark + testProblem.rating
                    return {fullTime, highestMark}
                }, {fullTime: 0, highestMark: 0})

                const {leftTime, prevMark} = user ? getTestState() : {leftTime: fullTime, prevMark: -1}

                return {...heading, fullTime, highestMark, leftTime, prevMark}

                function getTestState() {
                    try {
                        const testProblems = testProblemsList[i]
                        const lastTestResult = lastTestResultList[i]
                        const prevMark = lastTestResult ? lastTestResult.earnedMark : -1
                        const {problemChecks} = getUnfinishedTest()

                        const leftTime = problemChecks.reduce((prevValue, problemCheck, i, checks) => {
                            return prevValue - testProblems[checks.length - i - 1].time
                        }, fullTime)

                        return {prevMark, leftTime}

                        function getUnfinishedTest() {
                            const problemChecks = problemChecksList[i]
                            const startIndex = problemChecks.findIndex(problemCheck => {
                                return problemCheck.problemId === testProblems[testProblems.length - 1].problemId
                            })
                            if (startIndex >= testProblems.length ||
                                (startIndex === -1 && problemChecks.length >= testProblems.length)) {
                                return {problemChecks: []}
                            }
                            return {
                                problemChecks: startIndex > -1 ?
                                    problemChecks.slice(0, startIndex) :
                                    problemChecks
                            }
                        }
                    } catch (e) {
                        console.error("Schema.getTests.getTestState: problemChecksList[i] = %o, testProblemsList[i] = %o, " +
                            "lastTestResultList[i] = %o", problemChecksList[i], testProblemsList[i], lastTestResultList[i])
                        throw e
                    }
                }
            })
        }

        function getChildrenFail(lists = []) {
            let fail = false
            lists.forEach(list => {
                if (list.length) fail = true
            })
            return fail ? {ok: false, message: "Звучит дико, но сначала надо убить детей."} : null
        }

        function update(model, data, user) {
            return makeMutation({model, task: "update", data, user})
        }

        function remove(model, id, user) {
            if (!user || user.access !== "teacher") return {ok: false}
            return dbClient({model, task: "remove", data: {id}, user})
        }

        function replace(model, data, user) {
            return makeMutation({model, task: "replace", data, user})
        }

        function insert(model, data, user) {
            return makeMutation({model, task: "insert", data, user})
        }

        function makeMutation({model, task, data, user}) {
            if (!user || user.access !== "teacher") return false
            return dbClient({model, task, data})
        }

        function find(model, data = {}, user) {
            return dbClient({model, task: "find", data, user})
        }
    }

    _query = `
                lessonTest(parentId: ID): Test
                solutions: [Solution!]!
                solutionStatus(testId: ID!): Solution
                webinarRegistration(webinarId: ID!): Boolean!
                subscription: Subscription
                courseSolutionsAdmin: [CourseSolution!]!
                serviceRegistration(    userId: ID!,
                service: Service!,
                parentId: ID!,
                date: String!,
                status: PaymentStatus!): ServiceRegistration
                course(alias: String, id: ID): Course
                courseTopic(id: ID!): CourseTopic!
                topic(id: ID!): Topic!
                webinar(id: ID!): Webinar!
                videoLesson(id: ID!): VideoLesson!
                list(name: List!): [Heading!]!
                courseTopics(parentId: ID): [CourseTopic!]!
                courseWebinars(parentId: ID, date: String): [CourseWebinar!]!
                courseVideoLessons(parentId: ID): [CourseVideoLesson!]!
                payment(id: ID!): Payment
                imageCount(key: ID!): Int!
                tests(parentId: ID!): [Test!]!
                testProblems(testId: ID): TestProblems!
                testResults: [TestResult!]!
                problem(id: ID!): Problem!
                problemSearchLists: ProblemSearchLists!
                legal(type: String!): String!
                content(path: String!): Content
                profile(id: ID): Profile!
    `

    _mutation = `
                sendSolution(testId: ID!) :Boolean!
                insertWebinarRegistration(userId: ID!, webinarId: ID!): Boolean!
                updateUser(id: ID!, subscription: String): Boolean!
                incChecks(userId: ID!, count: Int!): Boolean!
                decCheck: Boolean!
                updatePayment(id: ID!, status: PaymentStatus!): Boolean!
                insertPayment(id: ID!, 
                              userId: ID!,
                              status: PaymentStatus!, 
                              price: Int!, 
                              service: Service!, 
                              serviceId: ID,
                              count: Int): Boolean!
                insertProfile(email: String!): Boolean!
                removeProfile(email: String!, src: ProfileSource!): Boolean!
                handleSolutionCheck(solutionId: ID!, comment: String!, marks: [SolutionMark!]!): Boolean!
                insertCourseSolution(courseTestId: ID!) :Boolean!
                updatePendingStatusForCourseRegisters(userId: ID!): CourseUser!
                updatePendingStatusForWebinarRegisters(userId: ID!): WebinarUser!
                registerUserForService(parentId: ID!, email: String!, service: String!): Boolean!
                mutationPayment(id: ID!, status: String!, amountValue: Int!, service: String, number: Int): Boolean!
                updateHeading(item: HeadingItemInput!): Boolean!
                updateVideoLesson(item: VideoLessonItemInput!): Boolean!
                updateProblemType(item: ProblemTypeItemInput!): Boolean!
                updateProblem(item: ProblemItemInput!): Boolean!
                updateTestHeading(item: TestHeadingItemInput!): Boolean!
                updateTestProblem(item: TestProblemItemInput!): Boolean!
                updateWebinar(item: WebinarItemInput!): Boolean!
                updateCourse(item: CourseItemInput!): Boolean!
                updateCourseTopic(item: CourseTopicItemInput!): Boolean!
                updateCourseWebinar(item: CourseWebinarItemInput!): Boolean!
                updateCourseVideoLesson(item: CourseVideoLessonItemInput!): Boolean!
                updateCourseTest(item: CourseTestItemInput!): Boolean!
                removeHeading(id: ID!): Result!
                removeVideoLesson(id: ID!): Result!
                removeProblemType(id: ID!): Result!
                removeProblem(id: ID!): Result!
                removeTestHeading(id: ID!): Result!
                removeTestProblem(id: ID!): Result!
                removeWebinar(id: ID!): Result!
                removeCourse(id: ID!): Result!
                removeCourseTopic(id: ID!): Result!
                removeCourseWebinar(id: ID!): Result!
                removeCourseVideoLesson(id: ID!): Result!
                removeCourseTest(id: ID!): Result!
                insertHeading(item: HeadingItemInserted!): idPair!
                insertVideoLesson(item: VideoLessonItemInserted!): idPair!
                insertProblemType(item: ProblemTypeItemInserted!): idPair!
                insertProblem(item: ProblemItemInserted!): idPair!
                insertTestHeading(item: TestHeadingItemInserted!): idPair!
                insertTestProblem(item: TestProblemItemInserted!): idPair!
                insertWebinar(item: WebinarItemInserted!): idPair!
                insertCourse(item: CourseItemInserted!): idPair!
                insertCourseTopic(item: CourseTopicItemInserted!): idPair!
                insertCourseWebinar(item: CourseWebinarItemInserted!): idPair!
                insertCourseVideoLesson(item: CourseVideoLessonItemInserted!): idPair!
                insertCourseTest(item: CourseTestItemInserted!): idPair!
                replaceHeading(id: ID!, parentId: ID!, number: Int!): Boolean!
                replaceVideoLesson(id: ID!, parentId: ID!, number: Int!): Boolean!
                replaceProblemType(id: ID!, parentId: ID!, number: Int!): Boolean!
                replaceProblem(id: ID!, parentId: ID!, number: Int!): Boolean!
                replaceTestHeading(id: ID!, parentId: ID!, number: Int!): Boolean!
                replaceTestProblem(id: ID!, parentId: ID!, number: Int!): Boolean!
                replaceWebinar(id: ID!, parentId: ID!, number: Int!): Boolean!
                replaceCourse(id: ID!, number: Int!): Boolean!
                replaceCourseVideoLesson(id: ID!, number: Int!): Boolean!
                replaceCourseTest(id: ID!, number: Int!): Boolean!
                insertProblemCheck(problemId: ID!, testId: ID!): Boolean!
                updateProblemCheck(problemId: ID!, testId: ID!): Boolean!
                insertTestResult(testId: ID!): Boolean!       
    `
    _types = `
            type Subscription {
                date: String
            }
            type CourseLesson {
                videoLesson: VideoLesson!
                tests: [CourseTest!]!
            }
            type CourseSolution {
                id: ID!
                date: String!
                courseTestID: ID!
                courseTest: CourseTest!
                status: SolutionStatus!
                user: Profile!
            }
            type ServiceRegistration {
                id: ID!
                email: String!
            }
            type CourseUser {
                course: Course!
                registration: WebinarRegistration!
                user: Profile!
            }
            type WebinarUser {
                webinar: Webinar!
                registration: WebinarRegistration!
                user: Profile!
            }
            type WebinarRegistration {
                email: String!
            }
            type Payment {
                id: ID!
                price: Int!
                service: Service!
                serviceId: ID
                status: PaymentStatus!
                count: Int!
                userId: ID!
            }
            enum SolutionStatus {
                sent,
                verified,
                didntSend
            }
            enum PaymentStatus {
                pending
                waiting_for_capture
                succeeded
                canceled
            }
            enum Service {
                checks
                webinar
                subscription
            }
            enum List {
                webinars
                topics
                videoLessons
                tests
            }
            type Result {
                ok: Boolean!
                message: String
            }
            type idPair {
                id: ID!
                key: ID!
            }
            type Content {
                view: String!
                categoryId: ID!
                breadCrumbs: [HeadingContent!]!
                categories: [HeadingItem!]
                problemTypes: [ProblemTypeItem!]
                problems: [ProblemItem!]
                videoLessons: [VideoLesson!]!
                tests: [Test!]!
                paidTests: [Test!]!
                webinars: [Webinar!]!
                courses: [Course!]!
            }
            type ActiveService {
                id: ID!
                name: String!
                isActivated: Boolean
            }
            type ProblemSearchLists {
                headings: [Heading!]!
                problems: [Problem!]!
            }
            type Heading {
                id: ID!
                parentId: ID!
                heading: String!
            }
            type HeadingItem {
                id: ID!
                heading: String!
                alias: String!
            }
            input HeadingItemInput {
                id: ID!
                heading: String!
                alias: String!
            }
            input HeadingItemInserted {
                number: Int!
                parentId: ID!
                heading: String!
                alias: String!
            }
            type HeadingContent {
                heading: String!
                alias: String!
            }
            type ProblemTypeItem {
                id: ID!
                heading: String!
                alias: String!
                taskDesc: String                 
            }
            input ProblemTypeItemInput {
                id: ID!
                heading: String!
                alias: String!
                taskDesc: String                 
            }
            input ProblemTypeItemInserted {
                number: Int!
                parentId: ID!
                heading: String!
                alias: String!
                taskDesc: String
            }
            type ProblemItem {
                id: ID!
                key: ID!
                parentId: ID
                desc: String!
                solution: String
                answer: String
                isExample: Boolean!
                src: String
                srcNumb: String
            }
            input ProblemItemInput {
                id: ID!
                desc: String!
                solution: String
                answer: String
                isExample: Boolean!
                src: String
                srcNumb: String
                imageMap: ImageMap            
            }
            input ProblemItemInserted {
                number: Int!
                parentId: ID!
                desc: String!
                solution: String
                answer: String
                isExample: Boolean!
                src: String
                srcNumb: String
                imageMap: ImageMap
            }
            input ImageMap {
                key: ID
                imageItems: [ImageItem!]!
            }
            input ImageItem {
                type: String!
                index: Int!
            }
            type VideoLesson {
                id: ID!
                key: ID!
                videoId: ID!
                heading: String!
                alias: String!
                path: String!
            }
            input VideoLessonItemInput {
                id: ID!
                key: ID!
                videoId: ID!
                heading: String!
                alias: String!
            }
            input VideoLessonItemInserted {
                number: Int!
                parentId: ID!
                videoId: ID!
                heading: String!
                alias: String!
            }
            input TestHeadingItemInput {
                id: ID!
                heading: String!
                type: String!
            }
            input TestHeadingItemInserted {
                number: Int!
                parentId: ID!
                heading: String!
                type: String!
            }
            type Webinar {
                id: ID!
                heading: String!
                date: String!
                link: String!
            }
            type Course {
                id: ID!
                heading: String!
                alias: String!
                desc: String!
                topics: [CourseTopic!]!
                webinars: [CourseWebinar!]!
            }
            type CourseTopic {
                id: ID!
                parentId: ID!
                topic: Topic! 
                date: String!
                videoLessons: [CourseVideoLesson!]!              
            }
            type CourseWebinar {
                id: ID!
                parentId: ID!
                webinar: Webinar!               
            }
            type Topic {
                id: ID!
                heading: String!
            }
            type CourseVideoLesson {
                id: ID!
                parentId: ID!
                videoLesson: VideoLesson!
                tests: [CourseTest!]!              
            }
            type CourseTest {
                id: ID!
                parentId: ID!
                test: Test!    
                solution: CourseSolution         
            }
            type HeadingTimeLine {
                heading: String!
                date: String!
            }
            type IdTimeLine {
                id: ID!
                date: String!
            }
            input SolutionMark {
                testProblemId: ID!
                mark: Int!
                comment: String!
            }
            input WebinarItemInput {
                id: ID!
                heading: String!
                date: String!
                link: String!
            }
            input WebinarItemInserted {
                number: Int!
                parentId: ID!
                heading: String!
                date: String!
                link: String!
            }
            input CourseItemInput {
                id: ID!
                heading: String!
                alias: String!
                desc: String!
            }
            input CourseItemInserted {
                number: Int!
                heading: String!
                alias: String!
                desc: String!
                parentId: ID!
            }
            input CourseTopicItemInput {
                id: ID!
                topicId: ID!
                date: String!
            }
            input CourseWebinarItemInput {
                id: ID!
                webinarId: ID!
            }
            input CourseVideoLessonItemInput {
                id: ID!
                videoLessonId: ID!
            }
            input CourseTestItemInput {
                id: ID!
                testId: ID!
            }
            input CourseTopicItemInserted {
                number: Int!
                topicId: ID!
                date: String!
                parentId: ID!
            }
            input CourseWebinarItemInserted {
                number: Int!
                webinarId: ID!
                parentId: ID!
            }
            input CourseVideoLessonItemInserted {
                number: Int!
                videoLessonId: ID!
                parentId: ID!
            }
            input CourseTestItemInserted {
                number: Int!
                testId: ID!
                parentId: ID!
            }
            type TestResult {
                date: String!
                name: String!
                earnedMark: Int!
                fullMark: Int!
            }
            type TestProblems {
                heading: String!
                problems: [TestProblem!]!
                startIndex: Int!
            }
            input TestProblemItemInput {
                id: ID!
                problemId: ID!
                rating: Int!
                time: Int!
            }
            input TestProblemItemInserted {
                number: Int!
                parentId: ID!
                problemId: ID!
                rating: Int!
                time: Int!
            }
    `
}

export default BaseGraphQL


