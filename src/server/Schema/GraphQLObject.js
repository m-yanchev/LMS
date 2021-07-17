// @flow

import {Profile} from "../../depricated/rules/Profile";
import type {ITestsDataSource} from "./Test";
import type {ITestProblemsDataSource} from "./TestProblem";
import type {ISolutionsDataSource} from "./Solution";
import type {IProfileDataSource} from "./Profile";
import type {IProblemResultsDataSource} from "./ProblemResult";
import type {IProblemsDataSource} from "./Problem";

export interface IDataSource {
    courseVideoLessons: IDataSourceItems<any, any, any, any, any>,
    courseTests: IDataSourceItems<any, any, any, any, any>,
    solutions: ISolutionsDataSource,
    tests: ITestsDataSource,
    testProblems: ITestProblemsDataSource,
    problems: IProblemsDataSource,
    headings: IDataSourceItems<any, any, any, any, any>,
    problemResults: IProblemResultsDataSource,
    users: IProfileDataSource
}

interface IDataSourceItems<FilterForOneT, FilterForMostT, T, InsertedT, UpdatedT> {
    find: FilterForMostT => Promise<Array<T>>,
    findOne: FilterForOneT => Promise<T>,
    insert: ({item: InsertedT}) => Promise<{id: string}>,
    update: ({item: UpdatedT}) => Promise<void>
}

export type Context = {
    user: Profile,
    dataSource: IDataSource
}

export type Insert<VarsT> = ({item: VarsT}) => Promise<{id: string}>
export type Update<VarsT> = ({item: VarsT}) => Promise<boolean>
export type Resolve<VarsT, ResponseT> = (VarsT, Context) => Promise<ResponseT>

class GraphQLObject {

    static query = ""

    static mutation = ""

    static types =""

    static root = {}

    static throwWhenIsNotTeacher(context: Context) {
        if (context.user.access !== "teacher") throw new Error("Access denied")
    }
}

export default GraphQLObject