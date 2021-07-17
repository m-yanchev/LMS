import React, {useEffect, useState} from 'react';
import {Button, ButtonGroup} from "@material-ui/core";
import {SimpleText, Title} from "../../../depricated/common/components/Text";
import ErrorView from "../../../depricated/common/components/ErrorView";
import {LessonPaper} from "../main/components/common/Paper";
import {Problem} from "../../../depricated/common/components/Problem";
import {FormTextField} from "../../../depricated/common/components/Dialog";
import MainContainer from "../../../depricated/common/components/MainContainer";
import {makeStyles} from "@material-ui/core/styles";
import {Solutions} from "../../../depricated/rules/Solutions";
import BackDropSpinner from "../../../depricated/common/components/BackDropSpinner";

const useStyles = makeStyles(theme => ({
    "container": {
        backgroundColor: "#eeeeee",
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(3, 1),
        },
        [theme.breakpoints.up('md')]: {
            padding: theme.spacing(6, 8),
        }
    }
}))

export default function CourseSolutionAdmin(props) {

    const {userModeProps} = props
    const classes = useStyles()
    const [solutions, setSolutions] = useState(null)
    const [error, setError] = useState(null)
    let isInstance = true

    useEffect(() => {

        Solutions.load().then(solutions => {
            if (isInstance) setSolutions(solutions)
        }).catch(e => {
            console.error(e)
            if (isInstance) setError(e)
        })
        userModeProps.onTeacherAuth()
        return () => isInstance = false
    }, [])

    return <>{solutions ?
        <MainContainer className={classes["container"]}>
            <SolutionsView solutions={solutions}/>
        </MainContainer> : error ?
        <ErrorView/> :
        <BackDropSpinner/>}
    </>

    function SolutionsView(props) {

        const [index, setIndex] = useState(0)
        const [solutions, setSolutions] = useState(props.solutions)
        const solution = solutions.getItem(index)

        return <>
            {solution ?
                <>
                    <User user={solution.profile}/>
                    <Test solution={solution}/>
                    <Solution solution={solution}/>
                    <ButtonGroup>
                        <Button onClick={handleGetSolutions}>Получить решения</Button>
                        <Button onClick={handleSendResult}>Отправить результат</Button>
                    </ButtonGroup>
                    <ControlButtons index={index}
                                    length={solutions.length}
                                    setIndex={setIndex}/>
                </> :
                <SimpleText>Решения никто не пресылал</SimpleText>
            }
        </>

        function handleGetSolutions() {

        }

        async function handleSendResult() {

            if (userModeProps.onTeacherAuth()) {
                await handleSolutionCheck()
            }

            async function handleSolutionCheck() {
                await solution.saveResults()
                if (!isInstance) return
                setIndex(solutions.delete(index))
                setSolutions(solutions.copy)
            }
        }

        function User(props) {
            const {user} = props
            return <>
                <Title variant="body1" component="p" title="Id ученика">
                    {user.id}
                </Title>
                <Title variant="body1" component="p" title="Имя ученика">
                    {user.name}
                </Title>
            </>
        }

        function Test(props) {

            const {solution} = props

            return <>
                <Title variant="h6" component="h6" title="Самостоятельная работа">
                    {solution.test.heading}
                </Title>
                <TestView solution={solution}/>
            </>

            function TestView(props) {

                const {solution} = props
                const [index, setIndex] = useState(0)
                const [mark, setMark] = useState(solution.getEstimate(index) || 0)
                const [comment, setComment] = useState(solution.getComment(index) || "")
                const problem = solution.test.problems[index]

                return (
                    <LessonPaper>
                        <Problem problemKey={problem.key}
                                 desc={problem.desc}
                                 commonDesc={problem.commonDesc}
                                 answer={problem.answer}
                                 number={index + 1}/>
                        <FormTextField onChange={handleMarkChange}
                                       value={mark}
                                       type="number"
                                       inputProps={{min: "0"}}/>
                        <FormTextField onChange={handleCommentChange} value={comment}/>
                        <ControlButtons index={index}
                                        length={solution.test.problems.length}
                                        setIndex={handleIndexChange}/>
                    </LessonPaper>
                )

                function handleMarkChange(value) {
                    setMark(value)
                    solution.setEstimate(index, Number(value))
                }

                function handleCommentChange(value) {
                    setComment(value)
                    solution.setComment(index, value)
                }

                function handleIndexChange(index) {
                    setIndex(index)
                    setMark(solution.getEstimate(index))
                    setComment(solution.getComment(index))
                }
            }
        }

        function Solution(props) {

            const {solution} = props
            const [comment, setComment] = useState(solution.comment)

            return (
                <LessonPaper>
                    <SimpleText>{`Получено: ${solution.day} в ${solution.time}.`}</SimpleText>
                    <FormTextField onChange={handleCommentChange} value={comment}/>
                </LessonPaper>
            )

            function handleCommentChange(value) {
                solution.comment = value
                setComment(value)
            }
        }

        function ControlButtons({index, length, setIndex}) {
            return (
                <ButtonGroup>
                    <Button disabled={index < 1}
                            onClick={() => setIndex(index - 1)}>
                        {"Предыдущий"}
                    </Button>
                    <Button disabled={index > length - 2}
                            onClick={() => setIndex(index + 1)}>
                        {"Следующий"}
                    </Button>
                </ButtonGroup>
            )
        }
    }
}