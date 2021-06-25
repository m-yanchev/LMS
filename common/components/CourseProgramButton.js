//@flow
import React, {Fragment, useState} from "react"
import type {Element} from "react";
import {Divider, List, ListItem, ListItemText} from "@material-ui/core";
import {setYandexMetrikaGoal} from "../YandexMetrika";
import {sendFailLog} from "../FailLogLoader";
import {CancelButton, FormDialog} from "./Dialog";
import {DataRequestComponent} from "./DataRequest";
import {SubtitleText} from "./Text";
import {formatDate, formatTime, getTimeStampByMonthNumber, inWeekDay} from "../DateTime";
import {makeStyles} from "@material-ui/core/styles";
import CourseActivateButton from "./CourseActivateButton";
import type {StyleCourseButtonProps} from "./CourseButton";
import CourseButton from "./CourseButton";

const useStyles = makeStyles(theme => ({
    "course-program-webinars-subtitle": {
        marginTop: theme.spacing(1)
    },
    "course-program-divider": {
        marginTop: theme.spacing(1)
    },
    "course-program-topics-subtitle": {
        marginTop: theme.spacing(3)
    }
}))

type CourseProgramButtonProps = {
    id: string,
    heading: string,
    alias: string,
    ...StyleCourseButtonProps
}

type CourseProgramViewProps = {
    courseId: string,
    onClose: (void) => void
}

type CourseTopics = Array<{
    id: string,
    topic: TopicProps,
    date: string
}>

type TopicProps = {
    heading: string
}

type CourseWebinars = Array<{
    id: string,
    webinar: DateHeadingProps
}>

type DateHeadingProps = {
    heading: string,
    date: string
}

function CourseProgramButton(props: CourseProgramButtonProps): Element<typeof Fragment> {

    const {id, alias, heading, ...rest} = props
    const [open, setOpen] = useState<boolean>(false)

    return <>
        <CourseButton {...rest} isProgram onClick={handleClick}/>
        <FormDialog open={open}
                    name="course-program"
                    onClose={handleClose}
                    scroll="body"
                    title={`Программа курса "${heading}"`}
                    actions={<>
                        <CancelButton onClick={handleClose}/>
                        <CourseActivateButton variant={"outlined"} alias={alias}/></>}>
            <CourseProgramView onClose={handleClose} courseId={id}/>
        </FormDialog>
    </>

    function handleClick(): void {
        setOpen(true)
        setYandexMetrikaGoal({name: "course-program-looked"}).catch(e => {
            sendFailLog({module: "CourseProgram", method: "handleClick", e})
        })
    }

    function handleClose(): void {
        setOpen(false)
    }
}

function CourseProgramView(props: CourseProgramViewProps) {

    const {onClose, courseId} = props
    const classes = useStyles()

    const query = `
                query CourseProgram($parentId: ID!, $webinarDate: String!) {
                    courseTopics(parentId: $parentId) {
                        id
                        topic {
                            heading
                        }
                        date
                    }
                    courseWebinars(parentId: $parentId, date: $webinarDate) {
                        id
                        webinar {
                            heading
                            date
                        }
                    } 
                }`

    return <DataRequestComponent WrappedComponent={View}
                                 query={query}
                                 args={{
                                     parentId: courseId,
                                     webinarDate: getTimeStampByMonthNumber(1).toString()
                                 }}
                                 onClose={onClose}/>

    function View(props: { content: { courseTopics: CourseTopics, courseWebinars: CourseWebinars } }) {

        const {courseTopics, courseWebinars} = props.content

        return <>
            <SubtitleText className={classes["course-program-webinars-subtitle"]}>
                {"Вебинары в этом месяце:"}
            </SubtitleText>
            <List>
                {courseWebinars.map(({webinar, id}) =>
                    <Webinar key={id} date={webinar.date} heading={webinar.heading}/>
                )}
            </List>
            <Divider className={classes["course-program-divider"]}/>
            <SubtitleText className={classes["course-program-topics-subtitle"]}>Все темы курса:</SubtitleText>
            <List>
                {courseTopics.map(({topic, date, id}) => <Topic key={id} date={date} heading={topic.heading}/>)}
            </List>
        </>

        function Webinar(props: DateHeadingProps): Element<typeof ListItem> {

            const {heading, date} = props
            const dateString = `Начало ${formatDate(date)} ${inWeekDay(date)} в ${formatTime(date)}`

            return (
                <ListItem>
                    <ListItemText secondary={dateString} primary={heading}/>
                </ListItem>
            )
        }

        function Topic(props: DateHeadingProps): Element<typeof ListItem> {

            const {date, heading} = props

            return (
                <ListItem>
                    <ListItemText secondary={formatDate(date)} primary={heading}/>
                </ListItem>
            )
        }
    }
}

export default CourseProgramButton