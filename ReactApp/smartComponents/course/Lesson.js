// @flow

import React, {useReducer} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardActionArea, CardContent, CardMedia, Grid} from "@material-ui/core";
import {sendFailLog} from "../../../common/FailLogLoader";
import {CardText, SimpleText, SubtitleText} from "../../../common/components/Text";
import {OutlinedButton} from "../../../course/Buttons";
import {LessonGrid} from "../../../main/components/common/Boxes";
import {
    CARD_SPACE, CARD_WIDTH, IMAGE_PREFIX, IMAGE_SUFFIX, IMAGES_FOLDER, VIDEO_POSTERS_FOLDER
} from "../../../common/constants";
import {ChecksPaymentScript, /*SubmitSolutionsDialog,*/ SubmitSolutionsSuccessMessage} from "../SubmitSolutions";
import {Course} from "../../../rules/Course";
import {TestCardContent, TestDialog} from "../Test";
import {FormDialog} from "../../../common/components/Dialog";
import {TestResults, TestResultsTable} from "../Results";
import {ButtonGroup} from "../../viewComponents/Buttons";
import {Profile} from "../../../rules/Profile";
import {Test} from "../../../rules/Test";
import {Lesson as LessonObject} from "../../../rules/Lesson"

const useStyles = makeStyles(theme => ({
    "card": {
        margin: theme.spacing(CARD_SPACE / 2),
        width: theme.spacing(CARD_WIDTH)
    },
    "card-media": {
        width: "100%",
        height: "100%"
    },
    "prev-button": {
        marginBottom: theme.spacing(2)
    },
    "before-lesson-text": {
        marginBottom: theme.spacing(2)
    },
    "before-video-lesson-text": {
        marginBottom: theme.spacing(2)
    },
    "before-test-text": {
        marginBottom: theme.spacing(3)
    },
    "test-title": {
        marginBottom: theme.spacing(2)
    },
    "card-title": {
        marginBottom: theme.spacing(2)
    },
    "card-text": {
        marginBottom: theme.spacing(2)
    },
    "group-buttons": {
        margin: theme.spacing(2, 0, 2, 0)
    },
    "video-lesson-frame": {
        width: "100%"
    }
}))

function reducer(state, action) {
    switch (action.type) {
        case "open-view":
            return {...state, view: action.view}
        case "open-dialog":
            return {...state, dialog: action.dialog}
        case "set-test":
            return {...state, test: action.test}
        default:
            throw new Error(`Состоятние ${action.type} не учтено в reducer`)
    }
}

type LessonProps = {
    lesson: LessonObject,
    setProfile: Profile => void,
    alias: string,
    profile: Profile,
    updateView: void => void,
    goNewLesson: void => void,
    onClose: void => void,
    onPending: boolean => void,
    onFail: void => void
}

export default function Lesson(props: LessonProps) {

    const {lesson, setProfile, alias, profile, updateView, goNewLesson, onClose, onPending, onFail} = props
    const [state, dispatch] = useReducer(reducer, {view: "base", dialog: null, test: lesson.test})
    const classes = useStyles()
    return <>
        <PrevButton/>
        {state.view === "base" &&
        <Grid container justify={"space-evenly"}>
            <SimpleText className={classes["before-lesson-text"]}>
                {'Посмотрите видеоурок. Когда будете готовы, сделайте самостоятельную работу и отправьте ' +
                'фото решений учителю'}
            </SimpleText>
            <VideoLessonCard videoLesson={lesson.videoLesson}/>
            {state.test &&
            <TestCard key={state.test.id} test={state.test}/>}
        </Grid>
        }
        {state.view === "video-lesson" && <>
            <SimpleText className={classes["before-video-lesson-text"]}>
                {'При просмотре видеоурока рекомендую активно пользоваться паузой ' +
                'и просматривать сложные моменты повторно. Заведите тетрадь для справочного материала и ' +
                'записывайте в неё опредления, свойства, признаки и теоремы, которые встречаются в решении, ' +
                'но по каким то причинам не были усвоены Вами ранее.'}
            </SimpleText>
            <LessonGrid ratio={16 / 9}>
                <VideoLesson videoLesson={lesson.videoLesson}/>
            </LessonGrid>
        </>}
        {lesson.results.length > 0 && <>
            <TestResults results={lesson.results}/>
        </>}
        {state.test &&
        <TestDialog key={state.test.id} open={state.dialog === "test"} test={state.test}
                    onCloseCall={handleCloseTestDialog} onFail={handleFail}/>
        }
        {/*<SubmitSolutionsDialog open={state.dialog === "submit-solutions-dialog"}
                               solution={state.solution}
                               onClose={closeDialog}
                               onSuccess={openSubmitSolutionsSuccessInfo}
                               onFail={handleFail}/>*/}
        <ChecksPaymentScript open={state.dialog === "checks-payment-script"}
                             profile={profile}
                             setProfile={setProfile}
                             returnURL={Course.path(alias)}
                             onClose={closeDialog}
                             onPending={onPending}
                             onFail={handleFail}/>
        <SubmitSolutionsSuccessMessage open={state.dialog === "submit-solutions-success"}
                                       onClose={closeDialog}/>
        {state.dialog === "test-results" && state.test &&
        <TestResultsDialog test={state.test}
                           onClick={handleResultsDialogEvent}
                           onClose={() => handleResultsDialogEvent("close")}/>
        }
    </>

    function PrevButton(props) {
        const handleClick = state.view === "base" ? onClose : openStartView
        return (
            <OutlinedButton className={classes["prev-button"]}
                            color="secondary"
                            onClick={handleClick}
                            {...props}>
                {"Назад"}
            </OutlinedButton>
        )
    }

    function VideoLessonCard(props) {

        const {videoLesson} = props
        const posterPath = `/${IMAGES_FOLDER}/${VIDEO_POSTERS_FOLDER}/${IMAGE_PREFIX + videoLesson.key}.${IMAGE_SUFFIX}`

        return (
            <LessonCard>
                <CardActionArea onClick={() => openView("video-lesson")}>
                    <CardMedia className={classes["card-media"]}
                               alt="постер"
                               image={posterPath}
                               component="img"/>
                    <CardContent>
                        <SubtitleText className={classes["card-title"]}>Видеоурок</SubtitleText>
                        <CardText className={classes["card-text"]}>{videoLesson.heading}</CardText>
                    </CardContent>
                </CardActionArea>
            </LessonCard>
        )
    }

    function TestCard(props) {

        const {test} = props
        const content = {
            heading: test.heading,
            leftTime: test.leftTime,
            fullTime: test.fullTime,
            prevEstimate: null,
            highestEstimate: test.highestEstimate,
        }

        return (
            <LessonCard>
                <TestCardContent id={test.id} content={content}
                                 onStart={handleStartTest}/>
            </LessonCard>
        )
    }

    function VideoLesson(props) {

        const {videoLesson} = props

        return <>
            <iframe className={classes["video-lesson-frame"]}
                    src={`https://www.youtube.com/embed/${videoLesson.videoId}?modestbranding=1&color=white&rel=0`}
                    frameBorder="0"
                    allowFullScreen/>
        </>
    }

    function LessonCard(props) {
        return <Card className={classes["card"]} {...props}/>
    }

    function handleResultsDialogEvent(event) {
        closeDialog()
        switch (event) {
            case "go-new-lesson":
                goNewLesson()
                break
            case "close":
                updateView()
                updateTest()
                break
        }
    }

    function handleCloseTestDialog(callingDialogName) {
        switch (callingDialogName) {
            case "none":
                //onUpdateCurTest(solution.test)
                closeDialog()
                break
            case "submit-solutions-dialog":
                openDialog("submit-solutions-dialog")
                break
            case "checks-payment-script":
                handleAccess()
                break
            case "test-results":
                openDialog("test-results")
                break
        }
    }

    function handleStartTest() {
        openDialog("test")
    }

    function handleFail({method, e}) {
        console.error("Lesson.handleFail: error = ", e)
        sendLessonFailLog({method, e})
        onFail()
        openStartView()
    }

    function sendLessonFailLog({method, e}) {
        const vars = [{name: "lessonId", value: lesson.id}, {name: "userId", value: profile.id}]
        sendFailLog({module: "Course", method, e, vars})
    }

    function handleAccess() {
        openDialog("checks-payment-script")
    }

    /*function openSubmitSolutionsSuccessInfo() {
        openDialog("submit-solutions-success")
    }*/

    function openStartView() {
        openView("base")
        openDialog(null)
    }

    function closeDialog() {
        openDialog(null)
    }

    function openView(view) {
        dispatch({type: "open-view", view})
    }

    function openDialog(dialog) {
        dispatch({type: "open-dialog", dialog})
    }

    function updateTest() {
        dispatch({type: "set-test", test: lesson.test})
    }
}

type TestResultsDialogProps = {
    test: Test,
    onClick: ResultsButtonGroupClickEvent => void,
    onClose: void => void
}

type ResultsButtonGroupClickEvent = "go-new-lesson" | "close"

function TestResultsDialog(props: TestResultsDialogProps) {

    const {test, onClick, onClose} = props
    const heading = test.heading

    return (
        <FormDialog open title={'Результаты самостаятельной работы "' + heading + '"'}
                    actions={<ResultsDialogButtonGroup onClick={onClick} test={test}/>}
                    onClose={onClose}>
            <TestResultsTable mode={"without-estimates"} test={test}/>
        </FormDialog>
    )
}

type ResultsDialogButtonGroupProps = {
    onClick: ResultsButtonGroupClickEvent => void,
    test: Test
}

function ResultsDialogButtonGroup(props: ResultsDialogButtonGroupProps) {

    const {onClick, test} = props
    const titles = ["Следующий урок", "Закрыть"]
    const describes = ["Перейти к следующему уроку", "Закрыть и остаться на этом уроке"]
    const disables = [!test.isSuccess, false]
    const variants = test.isSuccess ? ["primary", "default"] : ["default", "primary"]
    const events = ["go-new-lesson", "close"]
    const handleClick = index => onClick(events[index])

    return (
        <ButtonGroup titles={titles} describes={describes} disables={disables} onClick={handleClick}
                     variants={variants}/>
    )
}
