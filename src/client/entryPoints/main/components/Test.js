import React, {useState, useRef, useEffect} from 'react'
import {
    ButtonGroup,
    Button,
    LinearProgress,
    CardContent, CardActions,CardActionArea
} from '@material-ui/core';
import {ProblemById} from "../../../../depricated/common/components/Problem";
import {
    FormDialog,
    InformDialog,
    ItemField,
    ActiveServiceDialog
} from "../../../../depricated/common/components/Dialog";
import {graduationAfterNumerals} from "../../../../depricated/common/graduationsAfterNumerals";
import {Rating} from "./common/Rating";
import {Time} from "./common/Time";
import {EditorShell, HeadingGrid} from "./editable/EditableLists";
import {BackDropDataRequest} from "../../../../depricated/common/components/DataRequest";
import Loader from "../../../../depricated/WebClient/Loader";
import {Description, GreatInfo, ItemCardHeader} from "./common/Boxes";
import {TestProblemsData} from "./editable/EditableItems";
import {EditableItem} from "./editable/EditableBoxes";
import {SolutionSendingButton, TestCheckPaymentButton} from "./TestCheckPayment";

export const AUTH_MESSAGE = "Для выполнения теста и сохранения результатов Вам нужно войти на сайт"
const TEST_RUN_SERVICE_NAME = "testRun"

export default function Test(props) {

    const {id, content, userProps, type} = props
    const {heading, fullTime, leftTime, highestMark, prevMark} = content
    const {onAuth} = userProps
    const [view, setView] = useState("base")

    return <>
        <CardActionArea onClick={handleStart}>
            <ItemCardHeader title={heading}/>
            <CardContent>
                <RunTime/>
                <Mark/>
            </CardContent>
        </CardActionArea>
        {type === "paid-test" ?
            <CardActions>
                <SolutionSendingButton userModeProps={userProps} testId={id} testHeading={heading}/>
                <TestCheckPaymentButton userModeProps={userProps} testId={id}/>
            </CardActions> : undefined}
        <RunningTestDialog open={view === "run"}
                           id={id}
                           heading={heading}
                           type={type}
                           activeService={userProps.activeService}
                           service={TEST_RUN_SERVICE_NAME}
                           onClose={handleClose}/>
    </>

    function handleStart() {
        onAuth({
            callback: () => setView("run"),
            activeService: {name: TEST_RUN_SERVICE_NAME, id},
            message: AUTH_MESSAGE
        })
    }

    function handleClose() {
        setView("base")
    }

    function Mark() {

        if (prevMark === -1 || prevMark === undefined) {
            return <Rating rating={highestMark || 0}/>
        } else {
            return (<>
                <Description>{"В прошлый раз Вы получили"}<br/></Description>
                <GreatInfo>{markAfterNumerals(prevMark)}</GreatInfo>
                <Description>{" из "}</Description>
                <GreatInfo>{highestMark}</GreatInfo>
                <Description>{" возможных"}</Description>
            </>)
        }

        function markAfterNumerals(number) {
            return graduationAfterNumerals(number, ["балл", "балла", "баллов"])
        }
    }

    function RunTime() {
        const isStarted = isStartedTest()
        const time = !isStarted ? fullTime : leftTime
        const title = isStarted ? "Оставшееся время выполнения:" : null
        return <Time time={time || 0} title={title}/>
    }

    function isStartedTest() {
        return fullTime !== leftTime && type !== "paid-test"
    }
}

function RunningTestDialog(props) {

    return <ActiveServiceDialog WrappedDialog={WrappedDialog} {...props}/>

    function WrappedDialog(props) {

        const {open, type, onClose, heading} = props
        const testId = props.id

        return <TestProblemsDataRequest WrappedComponent={RunningTestByResponse} {...props}/>

        function RunningTestByResponse(props) {

            const {content} = props
            const {problems, startIndex} = content.testProblems

            return <>
                {type === "test" ?
                    <RunningAutoTestByItems problems={problems} startIndex={startIndex}/> : undefined}
                {type === "paid-test" ?
                    <RunningPaidTestByItems problems={problems}/> : undefined}
            </>
        }

        function RunningPaidTestByItems(props) {

            const {problems} = props
            const [index, setIndex] = useState(0)
            const {problemId} = problems[index]
            const isLastProblem = index + 1 === problems.length
            const ButtonGroup =
                <RunningTestButtonGroup onClick={handleClick} first={index === 0} last={isLastProblem}/>

            return (
                <FormDialog open={open}
                            title={'Самостаятельная работа "' + heading + '"'}
                            actions={ButtonGroup}>
                    {open &&
                    <ProblemById problemId={problemId} answerNotVisible/>}
                </FormDialog>
            )

            function handleClick(event) {

                const {name} = event

                switch (name) {
                    case "prev":
                        handlePrev()
                        break
                    case "next":
                        handleNext()
                        break
                    case "finish":
                        handleFinish()
                        break
                }
            }

            function handlePrev() {
                setIndex(oldIndex => --oldIndex)
            }

            function handleNext() {
                setIndex(oldIndex => ++oldIndex)
            }

            function handleFinish() {
                onClose()
            }
        }

        function RunningAutoTestByItems(props) {

            const {problems, startIndex} = props
            let studentAnswer = ""
            let problemAnswer = ""
            const progress = useRef(0)
            const [state, setState] = useState({index: startIndex, finish: false})
            const {problemId, time} = !state.finish ? problems[state.index] : {}

            useEffect(() => {
                if (!state.finish) nextProblem()
            }, [state.index])

            return (<>
                <TestDialog open={open && !state.finish}/>
                <InformDialog open={open && state.finish && !state.error}
                              onClose={handleCloseFinishDialog}
                              title="Итоги тестирования"
                              message={finishMessage()}/>
                <InformDialog open={open && Boolean(state.error)}
                              onClose={handleCloseFinishDialog}
                              title="Ошибка сохранения результатов"
                              message={state.error}/>
            </>)

            function TestDialog(props) {

                const {open} = props;

                return (
                    <FormDialog open={open}
                                title={'Самостаятельная работа "' + heading + '"'}
                                actions={<RunningTestButtonGroup onClick={handleClick} last={isLastProblem()}/>}>
                        <Clock start={!state.finish} time={time} onFinish={handleNext}/>
                        {open &&
                        <ProblemById problemId={problemId} answerNotVisible onLoad={handleProblemLoad}/>}
                        <AnswerField autoFocus
                                     value=""
                                     onChange={handleChange}
                                     onConfirm={handleNext}
                                     onClose={handleFinish}/>
                    </FormDialog>
                )
            }

            function handleProblemLoad(answer) {
                problemAnswer = answer
            }

            function handleChange(value) {
                studentAnswer = value
            }

            async function handleClick(event) {
                try {
                    const {name} = event
                    const check = studentAnswer === problemAnswer;
                    if (check) await updateCheckProblem()
                    if (isLastProblem()) await insertTestResult()

                    switch (name) {
                        case "next":
                            handleNext()
                            break
                        case "finish":
                            handleFinish()
                            break
                    }
                } catch (e) {
                    console.error(e)
                    handleSaveResultError()
                }
            }

            function handleNext() {
                setState((oldState) => {
                    const newIndex = oldState.index + 1
                    if (newIndex < problems.length) {
                        return {index: newIndex, finish: false}
                    } else {
                        return getFinish(oldState)
                    }
                })
            }

            function handleFinish() {
                setState(getFinish)
            }

            function getFinish(oldState) {
                return {index: oldState.index, finish: true}
            }

            function handleCloseFinishDialog() {
                onClose()
            }

            function nextProblem() {
                progress.current = 0
                insertCheckProblem().then(result => {
                    if (!result["insertProblemCheck"]) handleSaveResultError()
                })
            }

            function insertCheckProblem() {
                const query = `mutation InsertProblemCheck($problemId: ID!, $testId: ID!) {
                        insertProblemCheck(problemId: $problemId, testId: $testId)
                    }`
                const args = {problemId, testId}
                return Loader.requestBySchema({query, args})
            }

            function updateCheckProblem() {
                const query = `mutation UpdateProblemCheck($problemId: ID!, $testId: ID!) {
                        updateProblemCheck(problemId: $problemId, testId: $testId)
                    }`
                const args = {problemId, testId}
                return Loader.requestBySchema({query, args})
            }

            function insertTestResult() {
                const query = `mutation InsertTestResult($testId: ID!) {
                        insertTestResult(testId: $testId)
                    }`
                const args = {testId}
                return Loader.requestBySchema({query, args})
            }

            function handleSaveResultError() {
                setState({
                    finish: true,
                    error: "Извините, не получается сохранять результаты. Попробуйте сделать работу позже."
                })
            }

            function isLastProblem() {
                return state.index === (problems.length - 1)
            }

            function finishMessage() {

                const finishProblemCount = state.index + 1
                const testProblemCount = problems.length
                const notFinishProblemCount = testProblemCount - finishProblemCount

                if (testProblemCount !== finishProblemCount) {
                    return `Выполнено ${problemAfterNumerals(finishProblemCount)}, осталось сделать ${problemAfterNumerals(notFinishProblemCount)}. Статистику и разбор ошибок Вы можете увидеть после полного завершения теста.`
                } else {
                    return `Тест полностью выполнен. Статистику по этому и другим законченным тестам Вы можете найти в личном кабинете.`
                }

                function problemAfterNumerals(number) {
                    return graduationAfterNumerals(number, ["задание", "задания", "заданий"])
                }
            }

            function Clock(props) {

                const [progress, setProgress] = useState(0)

                useEffect(() => {
                    if (props.start) {
                        const step = timeStep()
                        const timer = setInterval(() => setProgress(incProgress), step)
                        return () => {
                            clearInterval(timer)
                        }
                    }
                }, [])

                return <LinearProgress variant="determinate" value={progress}/>

                function timeStep() {
                    return props.time * 600
                }

                function incProgress(oldProgress) {
                    if (oldProgress === 100) props.onFinish()
                    return oldProgress + 1
                }
            }

            function AnswerField(props) {
                const {onChange} = props
                return <ItemField {...props} onChange={onChange} type="text" label="Ответ"/>
            }
        }

        function RunningTestButtonGroup(props) {
            const {onClick, first, last} = props
            return (
                <ButtonGroup>
                    <Button onClick={() => onClick({name: "finish"})}>Закончить</Button>
                    {first || first === undefined ? undefined :
                        <Button onClick={() => onClick({name: "prev"})}>Предыдущее</Button>}
                    {last ? undefined :
                        <Button onClick={() => onClick({name: "next"})}>Следующее</Button>}
                </ButtonGroup>)
        }
    }
}

export function EditableTest(props) {

    const {onClose, id} = props

    return <TestProblemsDataRequest WrappedComponent={EditableTestByResponse} {...props}/>

    function EditableTestByResponse(props) {

        const {content, avatarRootDiv, modalRootDiv} = props
        const {heading, problems} = content.testProblems

        return (
            <EditableItem title="Редактирование самостоятельной работы:" desc={heading} onClose={onClose}>
                <ProblemList/>
            </EditableItem>
        )

        function ProblemList() {

            const testProblemsData = new TestProblemsData({rootId: id, items: problems})

            return <EditorShell EditingComponent={HeadingGrid}
                                avatarRootDiv={avatarRootDiv}
                                modalRootDiv={modalRootDiv}
                                contentData={testProblemsData}
                                userModeProps={{isEditMode: true}}/>
        }
    }
}

export function TestProblemsDataRequest(props) {

    const {open, id, ...rest} = props
    const query = `
                query TestProblems($testId: ID!) {
                    testProblems(testId: $testId) {
                        startIndex
                        heading
                        problems {
                            id
                            problemId
                            rating
                            time
                        }
                    }
                }`
    const args = {testId: id}

    return <>{open ?
        <BackDropDataRequest {...rest} query={query} args={args}/> : undefined
    }</>
}