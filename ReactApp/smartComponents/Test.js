//@flow
import React, {Fragment, useEffect, useState} from "react"
import type {Element} from "react"
import {
    CardActionArea,
    CardActions,
    CardHeader,
    CardContent,
    Button,
    Typography,
    TextField,
    LinearProgress
} from "@material-ui/core";
import {FormDialog} from "../../common/components/Dialog";
import {Problem as ProblemComponent} from "../../common/components/Problem";
import {ButtonWithTooltip} from "../../common/components/ButtonWithTooltip";
import {B} from "../../common/components/Text";
import {graduationAfterNumerals} from "../../common/graduationsAfterNumerals";
import {SOLUTION_SENT_DESCRIPTION, SubmitSolutionsButton} from "./SubmitSolutions";
import type {FailProps} from "../../common/FailLogLoader";
import {Test} from "../../rules/Test";
import {LoadingProgress} from "../viewComponents/LoadingProgress";
import {ErrorInformer} from "../viewComponents/ErrorInformer";
import {useDataSourceContext, useLoggerClientContext} from "./AppProvider";
import ErrorHandler from "../../rules/ErrorHandler";
import type {IAppError, Variable} from "../../rules/ErrorHandler";
import {LoggerClient} from "../../rules/LoggerClient";

const MODULE_NAME = "TestComponents"
const GETTING_PROBLEMS_ERROR_MESSAGE = 'Возникла ошибка при попытке загрузить задания к самостоятельной работе. ' +
    'Попробуйте обновить страницу.'
const MAKING_SOLUTION_ERROR_MESSAGE = 'Возникла ошибка. ' +
    'Попробуйте обновить страницу.'
const PUTTING_PROBLEMS_ERROR_MESSAGE = 'Возникла ошибка при попытке сохранить результат. ' +
    'Попробуйте повторить тестирование позже.'
const PAID_TEST_DESC = 'Аккуратно оформите решения всех заданий самостоятельной работы на бумаге. Сделайте фото ' +
    'своих решений. Убедитесь, что все записи на полученных снимках хорошо читаются. Отправьте работу, ' +
    'воспользовавшись кнопкой "Отправить". Комментарии и оценки Вы получите на свою электронную почту'
const TEST_DESC = 'Выполнив все задания самостоятельной работы и заполнив поля редактирования полученными ответами, ' +
    'нажмите кнопку "Завершить"'

type TestCardContentProps = {
    id: string,
    content: ContentProps,
    onStart: string => void
}

type ContentProps = {
    heading: string,
    fullTime: number,
    leftTime: number,
    highestEstimate: number,
    prevEstimate: number | null
}

export function TestCardContent(props: TestCardContentProps): Element<typeof Fragment> {

    const {id, content, onStart} = props
    const {heading, fullTime, leftTime, highestEstimate, prevEstimate} = content
    const timeDesc = fullTime > leftTime ? {
        desc: "Оставшееся время выполнения", value: leftTime, button: "Продолжить"
    } : {
        desc: "Время выполнения", value: fullTime, button: "Начать"
    }

    return <>
        <CardActionArea onClick={handleStart}>
            <CardHeader title={heading} titleTypographyProps={{component: "h2", variant: "subtitle2"}}/>
            <CardContent>
                <TimeDesc desc={timeDesc.desc} value={timeDesc.value}/>
                {prevEstimate !== null ?
                    <PrevEstimateDesc highest={highestEstimate} prev={prevEstimate}/> :
                    <HighestEstimateDesc highest={highestEstimate}/>}
            </CardContent>
        </CardActionArea>
        <CardActions>
            <Button onClick={handleStart} color={"primary"}>{timeDesc.button}</Button>
        </CardActions>
    </>

    function handleStart(): void {
        onStart(id)
    }
}

type RunningDialogProps = {
    open: boolean,
    test: Test,
    onCloseCall: DialogName => void,
    onFail: FailProps => void
}

type DialogName = "submit-solutions-dialog" | "checks-payment-script" | "test-results" | "none"
type DialogButtonGroupClickEvent = "prev" | "next" | "finish" | "permit" | "send"

export function TestDialog(props: RunningDialogProps): Element<typeof FormDialog> {

    const {open, test, onCloseCall, onFail} = props
    const [loadingProblems, isGettingProblemsError] = useGetProblems(test)
    const [makingSolution, makeSolution, isMakingSolutionError] = useMakeSolution(test)
    const [putProblemResult, puttingProblemResultError] = usePutProblemResult(test)
    const [problemNumber, setProblemNumber] = useState<number>(0)

    const changeAnswer = (value: string) => {
        test.curAnswer = value
    }

    test.onUpdateCurProblem = () => {
        setProblemNumber(test.curProblemNumber)
        if (test.curProblemNumber) {
            putProblemResult()
        }
    }
    test.onFinishCurProblem = () => {
        putProblemResult(test.curResult.answer)
    }
    test.onFinish = () => {
        if (test.isUnresolvedProblems) onCloseCall("none")
        else onCloseCall("test-results")
    }

    if (open) {
        makeSolution()
        if (!loadingProblems && !test.isStarted && !test.isFinish) {
            test.start()
        }
    }
    const message = test.isPaid ? test.isNotReceivedResults ? SOLUTION_SENT_DESCRIPTION : PAID_TEST_DESC : TEST_DESC
    const errorMessage = isGettingProblemsError ? GETTING_PROBLEMS_ERROR_MESSAGE :
        isMakingSolutionError ? MAKING_SOLUTION_ERROR_MESSAGE :
            puttingProblemResultError ? PUTTING_PROBLEMS_ERROR_MESSAGE : null

    return <>
        {(loadingProblems || makingSolution) ? <LoadingProgress/> :
            <FormDialog open={open}
                        title={'Самостаятельная работа "' + test.heading + '"'}
                        message={message}
                        actions={<DialogButtonGroup onClick={handleClick} test={test} onFail={onFail}/>}
                        onClose={handleClose}>
                {test.curProblemNumber > 0 &&
                <TestProblem key={problemNumber} test={test} onAnswerChange={changeAnswer} onEnterUp={handleEnterUp}/>}
            </FormDialog>
        }
        <ErrorInformer message={errorMessage}/>
    </>

    function handleClick(event: DialogButtonGroupClickEvent): void {
        switch (event) {
            case "prev":
                test.goPrevProblem()
                setProblemNumber(test.curProblemNumber)
                break
            case "next":
                test.goNextProblem()
                break
            case "send":
                // handleSend()
                break
            case "permit":
                // handlePermit()
                break
            case "finish":
                handleClose()
                break
        }
    }

    /*function handlePermit() {
        //if (!solution) throw InstanceError.create("solution")
        test.finish()
        onCloseCall("checks-payment-script", test)
    }

    function handleSend() {
        //if (!solution) throw InstanceError.create("solution")
        solution.finish()
        onCloseCall("submit-solutions-dialog", solution)
    }
    */
    function handleEnterUp(): void {
        if (!test.goNextProblem()) handleClose()
        else setProblemNumber(problemNumber => problemNumber + 1)
    }

    function handleClose(): void {
        test.stop()
    }
}

type TestProblemProps = {
    test: Test,
    onAnswerChange: string => void,
    onEnterUp: void => void
}

function TestProblem(props: TestProblemProps) {
    const {test, onAnswerChange, onEnterUp} = props
    return <>
        {!test.isPaid &&
        <Timer key={"timer" + test.curProblem.key} onDecSec={handleTimerChange} value={test.curProblem.leftSeconds}/>}
        <ProblemComponent number={test.curProblemNumber}
                          problemKey={test.curProblem.key}
                          commonDesc={test.curProblem.commonDesc}
                          desc={test.curProblem.desc}/>
        {!test.isPaid &&
        <AnswerField onChange={onAnswerChange} onEnterUp={onEnterUp}/>}
    </>

    function handleTimerChange() {
        if (!test.isFinish) test.decCurProblemLeftSeconds()
    }
}

type TimerProps = {
    onDecSec: void => void,
    value: number
}

function Timer(props: TimerProps): Element<typeof LinearProgress> {

    const {onDecSec, value} = props
    const ONE_SEC = 1000
    const secAmount = value
    const STEP_COUNT = 100

    const [progress, setProgress] = useState<number>(secAmount)
    useEffect(() => {
        const timer = setInterval(decProgress, ONE_SEC)
        return () => {
            clearInterval(timer)
        }
    }, [])
    return <LinearProgress variant="determinate" value={progress * STEP_COUNT / secAmount}/>

    function decProgress(): void {
        setProgress(progress => progress - 1)
        onDecSec()
    }
}

type AnswerFieldProps = {
    onChange: string => void,
    onEnterUp: void => void
}

function AnswerField(props: AnswerFieldProps): Element<typeof TextField> {

    const {onChange, onEnterUp} = props
    const [value, setValue] = useState<string>("")

    return <TextField value={value} onChange={handleChange} onKeyUp={handleKeyUp}/>

    function handleChange(event: SyntheticInputEvent<HTMLInputElement>): void {
        const value = event.target.value
        setValue(value)
        onChange(value)
    }

    function handleKeyUp(event: SyntheticKeyboardEvent<HTMLInputElement>): void {

        if (event.key === "Enter") {
            onEnterUp()
        } else if (event.key === "Escape") {
            setValue("")
        }
    }
}

type DialogButtonGroupProps = {
    test: Test,
    onFail: FailProps => void,
    onClick: DialogButtonGroupClickEvent => void
}

function DialogButtonGroup(props: DialogButtonGroupProps): Element<typeof Fragment> {

    const {test, onClick, onFail} = props
    const closeColor = (!test.isPaid && test.isLastProblem) ? "primary" : "default"
    const submitColor = test.isLastProblem ? "primary" : "default"

    return <>
        {test.isPaid && <Button disabled={test.isFirstProblem} onClick={() => onClick("prev")}>Предыдущее</Button>}
        <Button disabled={test.isLastProblem} onClick={() => onClick("next")} color={"primary"}>Сдедующее</Button>
        {test.isPaid &&
        <SubmitSolutionsButton disabled={test.isNotReceivedResults} onClick={handleClick} onFail={onFail}
                               color={submitColor}/>}
        <ButtonWithTooltip desc="Завершить самостоятельную работу" onClick={() => onClick("finish")}
                           color={closeColor}>
            {"Завершить"}
        </ButtonWithTooltip>
    </>

    function handleClick(isAccess) {
        if (isAccess) onClick("send")
        else onClick("permit")
    }
}

type TimeDescProps = {
    desc: string,
    value: number
}

function TimeDesc(props: TimeDescProps): Element<typeof Fragment> {

    const {desc, value} = props

    return <>
        <Typography variant="caption" component="p" color="textSecondary">
            {desc}<br/><B>{makeTime(value)}</B>
        </Typography>
    </>

    function makeTime(value: number): string {
        return graduationAfterNumerals(value, ["минута", "минуты", "минут"])
    }
}

type PrevEstimateDescProps = {
    highest: number,
    prev: number
}

function PrevEstimateDesc(props: PrevEstimateDescProps): Element<typeof Fragment> {

    const {highest, prev} = props

    return <>
        <Typography variant="caption" component="p" color="textSecondary">
            {"В прошлый раз Вы получили"}<B>{markAfterNumerals(prev)}</B>{" из "}<B>{highest}</B>{" возможных"}
        </Typography>
    </>

    function markAfterNumerals(value: number): string {
        return graduationAfterNumerals(value, ["балл", "балла", "баллов"])
    }
}

type HighestEstimateDescProps = {
    highest: number
}

function HighestEstimateDesc(props: HighestEstimateDescProps): Element<typeof Fragment> {

    const {highest} = props

    return <>
        <Typography variant="caption" component="p" color="textSecondary">
            {"Максимальное количество баллов за тест: "}<B>{highest}</B>
        </Typography>
    </>
}

function useGetProblems(test: Test): [boolean, boolean] {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const dataSource = useDataSourceContext()
    const loggerClient = useLoggerClientContext()

    const sendGettingProblemsError = error => {
        sendError({error, method: "useGetProblems", vars: [{name: "testId", value: test.id}], loggerClient})
        setError(true)
    }

    const getProblems = () => {
        setLoading(true)
        dataSource.testProblemDS.problems({testId: test.id}).then(problems => {
            test.problems = problems
            setLoading(false)
        }).catch(error => sendGettingProblemsError(error))
    }

    useEffect(() => {getProblems()}, [test.id])

    return [loading, error]
}

function useMakeSolution(test: Test): [boolean, void => void, boolean] {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const dataSource = useDataSourceContext()
    const loggerClient = useLoggerClientContext()

    const sendMakingSolutionError = error => {
        sendError({error, method: "useMakeSolution", vars: [{name: "testId", value: test.id}], loggerClient})
        setError(true)
    }

    const make = () => {
        if ((test.getSolution() && test.isUnresolvedProblems) || !test.isFinish || loading) return
        setLoading(true)
        dataSource.solutionDS.make({testId: test.id}).then(solution => {
            test.solution = solution
            setLoading(false)
        }).catch(error => sendMakingSolutionError(error))
    }

    return [loading, make, error]
}

function usePutProblemResult(test: Test): [(string | void) => void, boolean] {

    const [error, setError] = useState(false)
    const dataSource = useDataSourceContext()
    const loggerClient = useLoggerClientContext()

    const sendPutProblemError = error => {
        sendError({
            error, method: "putProblemResult", vars: [
                {name: "solutionId", value: test.solution.id},
                {name: "testProblemsId", value: test.curProblem.id}
            ], loggerClient
        })
        setError(true)
    }

    const put = (answer?: string) => {
        if (test.isPaid) return
        dataSource.solutionDS.putProblemResult({
            testProblemId: test.curProblem.id, id: test.solution.id, answer
        }).catch(error => sendPutProblemError(error))
    }

    return [put, error]
}

type SendErrorProps = {
    error: IAppError,
    method: string,
    vars: Array<Variable>,
    loggerClient: LoggerClient
}

function sendError(props: SendErrorProps): void {
    const {error, method, vars, loggerClient} = props
    ErrorHandler.send({error, module: MODULE_NAME, method, vars, loggerClient})
}