// @flow

import React, {useEffect, useReducer, useState} from "react";
import {
    CssBaseline, List, ListItem, ListItemText, ThemeProvider, Card, CardHeader, CardContent, CardActions
} from "@material-ui/core";
import {SimpleText, SubtitleText, Title, CardText, B} from "../../../common/components/Text";
import {ERROR_MESSAGE_P1, ERROR_MESSAGE_P2, ERROR_TITLE} from "../../../common/constants";
import {Informer} from "../../../common/components/Informer";
import {makeStyles} from "@material-ui/core/styles";
import {sendFailLog} from "../../../common/FailLogLoader";
import Lesson from "./Lesson";
import {LessonPaper} from "../../../main/components/common/Paper";
import UserMode from "../../../common/components/UserMode";
import getTheme from "../../../common/theme";
import ErrorBoundary from "../ErrorBoundary";
import MainView from "../../../common/components/MainView";
import {GetWebinarLinkButton, WebinarPaymentScript} from "../../../common/components/GetWebinarLink";
import {Course} from "../../../rules/Course";
import type {FailProps} from "../../../common/FailLogLoader";
import {DataSource} from "../../../rules/DataSource/DataSource";
import type {LessonProps} from "../../../rules/Lesson";
import ErrorHandler from "../../../rules/ErrorHandler";
import {ErrorInformer} from "../../viewComponents/ErrorInformer";
import {AppProvider, useDataSourceContext, useLoggerClientContext} from "../AppProvider";
import {LoggerClient} from "../../../rules/LoggerClient";

const MODULE_NAME = "CoursePage"

const useStyles = makeStyles(theme => ({
    "container": {
        backgroundColor: "#eeeeee",
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(5, 1),
        },
        [theme.breakpoints.up('md')]: {
            padding: theme.spacing(6, 8),
        }
    },
    "course-title": {
        marginBottom: theme.spacing(2)
    },
    "topic-title": {
        marginBottom: theme.spacing(3)
    },
    "before-lessons-text": {
        marginBottom: theme.spacing(4)
    },
    "lessons-title": {
        marginBottom: theme.spacing(0)
    },
    "lessons-list": {
        marginBottom: theme.spacing(0)
    },
    "after-lessons-text": {
        marginBottom: theme.spacing(2)
    },
    "before-webinar-text": {
        marginBottom: theme.spacing(3)
    },
    "webinar-title": {
        marginBottom: theme.spacing(1)
    },
    "webinar-body": {
        marginBottom: theme.spacing(0)
    },
    "after-webinar-text": {
        margin: theme.spacing(3, 0)
    }
}))

type CoursePageProps = {
    dataSource: DataSource,
    loggerClient: LoggerClient
}

const LESSONS_USER_DATA_ERROR_MESSAGE = 'Возникла ошибка при попытке загрузить результаты выполнения тестов. ' +
    'Попробуйте обновить страницу.'

export default function CoursePage(props: CoursePageProps) {

    const {dataSource, loggerClient} = props
    const CourseWithUserProps = UserMode(MainView(CourseView))
    const classes = useStyles()

    return <>
        <CssBaseline/>
        <ThemeProvider theme={getTheme()}>
            <AppProvider dataSource={dataSource} loggerClient={loggerClient}>
                <ErrorBoundary module={"Course"} method={"ErrorBoundary"}>
                    <CourseWithUserProps profile={dataSource.profile} course={dataSource.course}/>
                </ErrorBoundary>
            </AppProvider>
        </ThemeProvider>
    </>

    function reducer(state, action) {
        switch (action.type) {
            case "update-view":
                return {...state, viewKey: state.viewKey + 1}
            case "back-drop":
                return {...state, backDrop: action.backDrop}
            case "open-dialog":
                return {...state, dialog: action.dialog}
            case "open-base-view":
                return {...state, view: "base"}
            case "open-lesson-view":
                return {...state, view: "lesson", lessonIndex: action.lessonIndex}
            case "open-info-dialog":
                return {...state, message: action.message}
            case "close-info-dialog":
                return {...state, message: null}
            default:
                throw new Error(`Состоятние ${action.type} не учтено в reducer`)
        }
    }

    function CourseView(props) {

        const {userModeProps, course} = props
        const {profile, setProfile} = userModeProps
        const topic = course.topic

        const initialState = {
            viewKey: 0,
            view: "base",
            message: null,
            lessonIndex: 0,
            dialog: null
        }
        const [state, dispatch] = useReducer(reducer, initialState)
        const [userData, isLessonsUserDataError] = useGetLessonsUserData({topicId: topic.id, userId: profile.id})
        if (userData) topic.userData = userData
        const errorMessage = isLessonsUserDataError ? LESSONS_USER_DATA_ERROR_MESSAGE : null
        return <>
            <CourseTitle/>
            <TopicTitle/>
            {state.view === "base" &&
            <> {topic &&
            <Lessons topic={topic}/>}
            {course.webinar &&
            <Webinar webinar={course.webinar}/>}
            </>}
            {state.view === "lesson" &&
            <Lesson key={state.lessonIndex}
                    lesson={topic.lessons[state.lessonIndex]}
                    alias={course.alias}
                    setProfile={setProfile}
                    profile={profile}
                    updateView={updateView}
                    goNewLesson={goNewLesson}
                    onClose={openBaseView}
                    onPending={handlePending}
                    onFail={openFailDialog}
                    onInforming={message => dispatch({type: "open-info-dialog", message})}/>}
            {course.webinar &&
            <WebinarPaymentScript open={state.dialog === "webinar-payment"}
                                  webinarId={course.webinar.id}
                                  profile={profile}
                                  setProfile={setProfile}
                                  returnURL={Course.path(course.alias)}
                                  onPending={handlePending}
                                  onClose={closeDialog}
                                  onFail={handleFail}/>}
            <Informer message={state.message} onClose={() => dispatch({type: "close-info-dialog"})}/>
            <ErrorInformer message={errorMessage}/>
        </>
        
        function openBaseView() {
            dispatch({type: "open-base-view"})
        }

        function handlePending(backDrop) {
            dispatch({type: "back-drop", backDrop})
        }

        function updateView() {
            dispatch({type: "update-view"})
        }

        function closeDialog() {
            dispatch({type: "open-dialog", dialog: null})
        }

        function openFailDialog() {
            const message = {title: ERROR_TITLE, desc: ERROR_MESSAGE_P1 + "\n" + ERROR_MESSAGE_P2}
            dispatch({type: "open-info-dialog", message})
        }

        function CourseTitle() {
            return (
                <Title className={classes["course-title"]} component="h1" variant="h4" title="Курс">
                    {course.heading}
                </Title>
            )
        }

        function TopicTitle() {
            return (
                <Title className={classes["topic-title"]} component="h2" variant="h5" title="Текущая тема">
                    {topic ? topic.heading : ""}
                </Title>
            )
        }

        function Lessons({topic}) {
            const actualIndex = topic.actualLessonIndex;
            return <>
                <SimpleText className={classes["before-lessons-text"]}>
                    {'Каждая тема курса состоит из нескольких уроков. Ваша задача к итоговому вебинару усвоить ' +
                    'материал всех уроков текущей темы.'}
                </SimpleText>
                <LessonPaper>
                    <SubtitleText className={classes["lessons-title"]}>
                        {'Уроки:'}
                    </SubtitleText>
                    <List className={classes["lessons-list"]}>
                        {topic.lessons.map((lesson, i) =>
                            <LessonListItem key={lesson.id}
                                            lesson={lesson}
                                            index={i}
                                            isPrimary={actualIndex === i}
                                            disabled={actualIndex < i}/>)}
                    </List>
                </LessonPaper>
                <SimpleText className={classes["after-lessons-text"]} component="p">
                    {'Доступ к следующему уроку открывается после успешной сдачи самостоятельной работы по ' +
                    'предыдущему'}
                </SimpleText>
            </>

            function LessonListItem(props) {

                const {lesson, index, disabled, isPrimary} = props
                const color = isPrimary ? "primary" : !disabled ? "textPrimary" : "inherit"
                const primaryTypographyProps = {variant: "subtitle1", color}

                return (
                    <ListItem onClick={() => handleLessonClick(index)}
                              button disabled={disabled && !isPrimary}>
                        <ListItemText primaryTypographyProps={primaryTypographyProps}>
                            {lesson.heading}
                        </ListItemText>
                    </ListItem>
                )
            }
        }

        function Webinar({webinar}) {
            return <>
                <SimpleText className={classes["before-webinar-text"]}>
                    {'На итоговом вебинаре у Вас будет возможность узнать ещё что то новенькое по текущей теме, ' +
                    'поработать над ошибками, которые допускались на самостоятельных работах, и задать любые ' +
                    'вопросы в рамках изучаемой темы.'}
                </SimpleText>
                <Card>
                    <CardHeader title={'Итоговый вебинар:'}
                                titleTypographyProps={{variant: "subtitle1", color: "textSecondary"}}
                                subheader={webinar.heading}
                                subheaderTypographyProps={{variant: "h6", color: "textPrimary"}}/>
                    <CardContent>
                        <CardText>
                            {'состоится '}<B>{webinar.day}</B> в <B>{webinar.time}</B>{'.'}
                        </CardText>
                    </CardContent>
                    <CardActions>
                        <GetWebinarLinkButton webinar={webinar} onAccess={handleAccess} onFail={handleFail}/>
                    </CardActions>
                </Card>
                <SimpleText className={classes["after-webinar-text"]}>
                    {'На следующий день после окончания вебинара, мы перейдем к освоению материала новой темы.'}
                </SimpleText>
            </>
        }

        function handleAccess() {
            dispatch({type: "open-dialog", dialog: "webinar-payment"})
        }

        function goNewLesson() {
            dispatch({type: "open-lesson-view", lessonIndex: topic.actualLessonIndex})
        }

        function handleLessonClick(lessonIndex) {
            dispatch({type: "open-lesson-view", lessonIndex})
        }
    }

    function handleFail(props: FailProps) {
        const {e, method, vars} = props
        sendFailLog({module: "Course", method, e, vars: vars && [...vars]})
    }
}

type UseGetLessonsUserDataProps = {
    topicId: string,
    userId: string
}

function useGetLessonsUserData(props: UseGetLessonsUserDataProps): [Array<LessonProps> | null, boolean | null] {
    const {topicId, userId} = props
    const [lessonsUserData, setLessonsUserData] = useState< Array<LessonProps> | null >(null)
    const [error, setError] = useState<boolean>(false)
    const dataSource = useDataSourceContext()
    const loggerClient = useLoggerClientContext()
    useEffect(() => {
        dataSource.lessonDS.getLessonsUserData({id: topicId}).then((lessons: Array<LessonProps>) => {
            setLessonsUserData(lessons)
        }).catch(error => {
            const errorHandler = ErrorHandler.create({
                error,
                props: {module: MODULE_NAME, method: "useGetLessonsUserData"}
            })
            loggerClient.write({message: errorHandler.message})
            setError(true)
        })
    }, [topicId, userId])
    return [lessonsUserData, error]
}