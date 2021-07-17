// @flow

import GraphQLObject from "./GraphQLObject";
import type {Context, Insert, Resolve, Update} from "./GraphQLObject";
import GraphQLTest from "./Test";
import type {TestResponseType} from "./Test";
import GraphQLProfile from "./Profile";
import type {ProfileResponseType} from "./Profile";
import type {ProblemResultInputType} from "./ProblemResult";
import {DateTime} from "../../depricated/rules/DateTime";
import {Solution} from "../../depricated/rules/Solution";
import type {ResultsPostReportAttachments} from "../../depricated/rules/Solution";
import {ProblemResult} from "../../depricated/rules/ProblemResult";
import {getImagePath, getFileNamesFromImageFolder} from "../Uploader";
import PostTransport from "../PostTransport";
import GraphQLProblemResult from "./ProblemResult";
import {InstanceError} from "../../depricated/rules/ErrorHandler/InstanceError";

export interface ISolutionsDataSource {
    getObject: SolutionFilterType => Promise<Solution>,
    update: Update<SolutionUpdateType>,
    insert: Insert<SolutionInsertType>
}

export type SolutionFilterType = {
    id?: string,
    ...SolutionDocumentType
}

export type SolutionUpdateType = {
    id: string,
    ...SolutionDocumentType
}

export type SolutionInsertType = {
    ...SolutionDocumentType
}

type UpdateResultsResolverType = Resolve<UpdateResultsVarsType, boolean>
type ResolverType = Resolve<VarsType, SolutionResponseType>
type UpdateResolverType = Resolve<UpdateVarsType, boolean>
type InsertResolverType = Resolve<InsertVarsType, string>

export type SolutionResponseType = {
    id?: string | null,
    sentTimeStamp: string | null,
    comment: string | null,
    verifiedTimeStamp?: string,
    test?: TestResponseType,
    profile?: ProfileResponseType
}

type UpdateResultsVarsType = {
    solutionId: string,
    comment: string,
    problemResults: Array<ProblemResultInputType>
}

type VarsType = {
    testId?: string,
    isNotVerified?: boolean,
    isUserData?: boolean
}

type UpdateVarsType = {
    id: string,
    problemResults: Array<ProblemResultInputType>
}

type InsertVarsType = {
    testId: string,
    problemResults: Array<ProblemResultInputType>
}

type GetObjectOptionsType = {
    withoutTest?: boolean,
    withoutProfile?: boolean
}

export type SolutionDocumentType = {|
    testId?: string,
    userId?: string,
    verifiedTimeStamp?: number | null,
    comment?: ?string,
    date?: string
|}

class GraphQLSolution extends GraphQLObject {

    static updateResults: UpdateResultsResolverType = async (vars, context) => {
        try {
            const {comment, problemResults, solutionId} = vars
            const {dataSource} = context
            GraphQLObject.throwWhenIsNotTeacher(context)

            const testProblemsPromise = async (): Promise<{ solution: Solution, userId: string }> => {
                const solution = await GraphQLSolution.getObjectById(solutionId, context,
                    {withoutProfile: true})
                solution.comment = comment
                solution.test.results = problemResults.map(result => ProblemResult.create({
                    testProblemId: result.testProblemId, estimate: result.mark, comment: result.comment
                }))
                return {solution, userId: solution.profile.id}
            }

            const attachmentsPromise = async (solution: Solution): Promise<ResultsPostReportAttachments> => {
                return {
                    path: getImagePath(solution.pathArray),
                    fileNames: await getFileNamesFromImageFolder(solution.pathArray)
                }
            }

            const insertResultsPromise = (solution: Solution): Promise<Array<void>> => {
                const solutionId = solution.id
                if (!solutionId) throw InstanceError.create("solutionId")
                return Promise.all([
                    ...solution.test.problemResults.map((result: ProblemResult) => {
                        dataSource.problemResults.insert({
                            item: {
                                testProblemId: result.testProblemId,
                                mark: result.estimate,
                                comment: result.comment,
                                solutionId
                            }
                        })
                    })
                ])
            }

            const makePostReportPromise = async (solution: Solution, userId: string): Promise<void> => {
                const [profile, attachments] = await Promise.all([
                    GraphQLProfile.profile({id: userId}, context),
                    attachmentsPromise(solution)
                ])
                solution.profile = GraphQLProfile.responseToObject(profile)
                await solution.makePostReport({PostTransport, attachments})
            }

            const commonPromise = async (): Promise<void> => {
                const {solution, userId} = await testProblemsPromise()
                await Promise.all([
                    insertResultsPromise(solution),
                    makePostReportPromise(solution, userId)
                ])
            }

            await Promise.all([
                dataSource.solutions.update({
                    item: {id: solutionId, comment, verifiedTimeStamp: DateTime.createNow().timeStamp}
                }),
                commonPromise()
            ])

            return true

        } catch (e) {
            console.error(e)
            throw e
        }
    }

    static solution: ResolverType = async (vars, context) => {
        return GraphQLSolution.objectToResponse(await GraphQLSolution.getObject({
            ...vars, isNotVerified: true
        }, context))
    }

    static objectToResponse(solution: Solution): SolutionResponseType {
        const profile = solution.profile
        if (profile === null) throw InstanceError.create("profile")
        return {
            id: solution.id,
            sentTimeStamp: solution.stringSentTimeStamp,
            comment: solution.comment || null,
            test: GraphQLTest.objectToResponse(solution.test),
            profile: GraphQLProfile.objectToResponse(profile)
        }
    }

    static update: UpdateResolverType = async (vars, context) => {
        try {

            const {id, problemResults} = vars
            const {dataSource} = context

            const updateVerifiedTimeStamp = async (): Promise<void> => {
                const solution = await GraphQLSolution.getObjectById(id, context,
                    {withoutProfile: true, withoutTest: true})
                const testProblems = await dataSource.testProblems.getObjects({parentId: solution.test.id})
                if (testProblems.length === problemResults.length) await dataSource.solutions.update({
                    item: {
                        id, verifiedTimeStamp: DateTime.createNow().timeStamp
                    }
                })
            }

            const updateProblemResults = async (): Promise<void> => {
                const resultsFromDB = await Promise.all(problemResults.map(result =>
                    GraphQLProblemResult.getObject({solutionId: id, testProblemId: result.testProblemId}, context)
                ))
                await Promise.all(problemResults.map(result => {
                    const resultFromDB = resultsFromDB.find(resultFromDB =>
                        resultFromDB && (resultFromDB.testProblemId === result.testProblemId)
                    )
                    if (resultFromDB) {
                        return dataSource.problemResults.update({item: {id: resultFromDB.id, ...result}})
                    } else {
                        return dataSource.problemResults.insert({
                            item: {
                                solutionId: id,
                                testProblemId: result.testProblemId,
                                comment: result.comment,
                                mark: result.mark
                            }
                        })
                    }
                }))
            }

            await Promise.all([updateVerifiedTimeStamp(), updateProblemResults()])

            return true

        } catch (e) {
            console.error(e)
            throw e
        }
    }

    static insert: InsertResolverType = async (vars, context) => {
        try {

            const {testId, problemResults} = vars
            const {dataSource, user} = context

            const testProblems = await dataSource.testProblems.getObjects({parentId: testId})
            const verifiedTimeStamp = testProblems.length === problemResults.length ?
                DateTime.createNow().timeStamp : null
            const {id} = await dataSource.solutions.insert({item: {testId, userId: user.id, verifiedTimeStamp}})

            await Promise.all(problemResults.map(result =>
                dataSource.problemResults.insert({
                    item: {
                        solutionId: id,
                        testProblemId: result.testProblemId,
                        comment: result.comment,
                        mark: result.mark
                    }
                })
            ))

            return id

        } catch (e) {
            console.error(e)
            throw e
        }
    }

    static async getObjectById(id: string, context: Context, options?: GetObjectOptionsType) : Promise<Solution> {
        const {withoutTest, withoutProfile} = options || {}
        const {dataSource} = context
        const solution: Solution = await dataSource.solutions.getObject({id})
        if (!withoutTest) {
            solution.test = await GraphQLTest.getObject({id: solution.test.id}, context)
        }
        if (!withoutProfile) {
            solution.profile = await GraphQLProfile.getObject({id: solution.profile.id}, context)
        }
        return solution
    }

    static async getObject(vars: VarsType, context: Context, options?: GetObjectOptionsType): Promise<Solution> {
        const {testId, isUserData, isNotVerified} = vars
        const {dataSource, user} = context
        const {withoutTest, withoutProfile} = options || {}
        let solution: Solution =
            await dataSource.solutions.getObject(isNotVerified ? {
                testId, userId: user.id, verifiedTimeStamp: null
            } : {
                testId, userId: user.id
            })
        if (!solution) {
            if (!testId) throw InstanceError.create("testId")
            solution = Solution.create({test: {id: testId}})
        }
        if (!withoutTest) {
            if (!testId) throw InstanceError.create("testId")
            const solutionId = solution.id
            const vars = solutionId ? {id: testId, solutionId, isUserData} : {id: testId, isUserData: false}
            solution.test = await GraphQLTest.getObject(vars, context)
        }
        if (!withoutProfile) {
            solution.profile = await GraphQLProfile.getObject({}, context)
        }
        return solution
    }

    static root = {
        solution: GraphQLSolution.solution,
        updateSolution: GraphQLSolution.update,
        insertSolution: GraphQLSolution.insert,
        updateResults: GraphQLSolution.updateResults
    }

    static mutation = `
            updateSolution(id: ID, problemResults: [ProblemResultInput!]!): Boolean!
            insertSolution(testId: ID, problemResults: [ProblemResultInput!]!): ID!
            updateResults(solutionId: ID!, comment: String!, problemResults: [ProblemResultInput!]!): Boolean!
        `

    static query = `
            solution(testId: ID!): Solution!
        `

    static types = `
        type Solution {
            id: ID
            sentTimeStamp: String
            comment: String
            test: Test!
            profile: Profile!
        }`
}

export default GraphQLSolution