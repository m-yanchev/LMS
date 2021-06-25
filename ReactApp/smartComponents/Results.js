//@flow

import React from "react"
import {Test} from "../../rules/Test";
import {Table} from "../viewComponents/Table";
import {InstanceError} from "../../rules/ErrorHandler/InstanceError";
import {Link} from "@material-ui/core";
import {TestResult} from "../../rules/TestResult";

type ResultsViewMode = "with-estimates" | "without-estimates"

type TestResultsTableProps = {
    mode: ResultsViewMode,
    test: Test
}

export function TestResultsTable(props: TestResultsTableProps) {

    const {mode, test} = props

    return (
        <ProblemResultsTable mode={mode} test={test}/>
    )
}

type ProblemResultsProps = {
    mode: ResultsViewMode,
    test: Test
}

export function ProblemResultsTable(props: ProblemResultsProps) {

    const {mode, test} = props
    const commonHeaders = ["№ задачи", "Статус"]
    const headers = mode === "with-estimates" ?
        [...commonHeaders, "Получено баллов", "Из возможных"] :
        [...commonHeaders, "Ваш ответ", "Правильный ответ", "Решение"]
    const rows = test.testProblems.map((testProblem, i) => {
        const result = test.getProblemResultByTestProblemId(testProblem.id)
        if (!result) {
            const commonRow = {
                ["№ задачи"]: i + 1,
                ["Статус"]: "-"
            }
            return mode === "with-estimates" ? {
                ...commonRow,
                ["Получено баллов"]: "не проверено",
                ["Из возможных"]: testProblem.estimate
            } : {
                ...commonRow,
                ["Ваш ответ"]: "не решено",
                ["Правильный ответ"]: "-",
                ["Решение"]: "-"
            }
        } else {
            const isSuccess = test.getIsSuccessByTestProblemId(testProblem.id)
            const commonRow = {
                ["№ задачи"]: i + 1,
                ["Статус"]: isSuccess ? "Зачёт" : "Не зачёт"
            }
            return mode === "with-estimates" ? {
                ...commonRow,
                ["Получено баллов"]: result.estimate,
                ["Из возможных"]: testProblem.estimate
            } : {
                ...commonRow,
                ["Ваш ответ"]: result.answer,
                ["Правильный ответ"]: testProblem.answer,
                ["Решение"]: testProblem.solution ? <Link>Посмотреть</Link> : "-"
            }
        }
    })

    return (
        <Table headers={headers} rows={rows}/>
    )
}

type TestResultsProps = {
    results: Array<TestResult>
}

export function TestResults(props: TestResultsProps) {
    const {/*results*/} = props
    return (
        <></>
    )
}