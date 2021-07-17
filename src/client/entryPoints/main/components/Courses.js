import React, {useState} from "react";
import {makeStyles, styled} from '@material-ui/core/styles';
import {
    CardContent, CardActions, CardMedia, Select, MenuItem, Typography, List, Box, Link
} from "@material-ui/core";
import {FormTextField, ItemDialog} from "../../../../depricated/common/components/Dialog";
import HeadingAliasField from "./HeadingAliasField";
import {ItemCardHeader, SelectItem} from "./common/Boxes";
import {EditableItem} from "./editable/EditableBoxes";
import {BackDropDataRequest, DataRequestComponent} from "../../../../depricated/common/components/DataRequest";
import {EditableBasis, EditableCards, EditorShell} from "./editable/EditableLists";
import {createContentData} from "./editable/EditableItems";
import {ContentItemType, ContentList} from "../ContentData";
import {formatDate, formatDateTime} from "../../../../depricated/common/DateTime";
import CourseProgramButton from "../../../../depricated/common/components/CourseProgramButton";
import CourseActivateButton from "../../../../depricated/common/components/CourseActivateButton";
import ImageField from "./ImageField";
import Loader from "../../../../depricated/WebClient/Loader";

const useStyles = makeStyles(theme => ({
    "course-item-box": {
        border: "1px solid gray",
        padding: theme.spacing(1)
    },
    "video-lesson-box": {
        backgroundColor: "#eeeeee",
        padding: theme.spacing(1)
    },
    "test-box": {
        backgroundColor: "white",
        padding: theme.spacing(1)
    },
    "list-container": {
        listStyleType: "none"
    },
    "course-container": {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3)
    },
    courseComponentImage: {
        height: 256 / 16 * 9
    },
    courseComponentLink: {
        display: "block",
        marginTop: theme.spacing(1)
    },
    courseDesc: {
        height: 180
    }
}))

export class CoursesData extends ContentList {

    constructor(props) {
        const types = [new ContentItemType({
            name: 'Course',
            Component: CourseComponent,
            InputComponent: CourseDialog,
            model: 'courses'
        })];
        const items = props.items.map(({id, ...content}) => ({
            id,
            parentId: "0",
            content
        }));
        super("0", types, items);
    }
}

export function Courses(props) {
    return <EditableCards {...props} EditableField={EditableCourse}/>
}

export function CourseComponent(props) {

    const {id} = props
    const course = props.content
    const classes = useStyles()

    return <>
        <ItemCardHeader title={course.heading}/>
        <CardMedia className={classes.courseComponentImage}
                   image={`/images/coursePosters/img${id}.png`}
                   title={'Иллюстрация к курсу "ЕГЭ профильного уровня. Задания второй части"'}/>
        <CardContent>
            <Typography className={classes.courseDesc}
                        component={"p"}
                        align={"justify"}
                        variant={"body2"}
                        color={"textSecondary"}>
                {course.desc}
            </Typography>
            <Link className={classes.courseComponentLink} href={`/kursy/${course.alias}/info`}>Узнать больше</Link>
        </CardContent>
        <CardActions>
            <CourseProgramButton size={"small"} id={id} heading={course.heading} alias={course.alias}/>
            <CourseActivateButton size={"small"} alias={course.alias}/>
        </CardActions>
    </>
}

export function CourseDialog(props) {

    const {id, content, onConfirm} = props
    const {heading, alias, desc} = content || {}
    let values = {
        heading: heading || "",
        alias: alias || "",
        desc: desc || "",
    }

    return (
        <ItemDialog name="course"
                    title="Ввод заголовка и описания курса"
                    onClose={handleClose}
                    onConfirm={handleConfirm}>
            <HeadingAliasField autoFocus
                               values={{heading: values.heading, alias: values.alias}}
                               onConfirm={handleConfirm}
                               onClose={handleClose}
                               onChange={(name, value) => handleChange(name, value)}/>
            <FormTextField label="Описание"
                           multiline
                           rows={4}
                           defaultValue={values.desc}
                           onConfirm={handleConfirm}
                           onClose={handleClose}
                           onChange={value => handleChange("desc", value)}/>
            <ImageField file={values.poster} id={id} prefix={"course"} label={"Обложка"} onChange={handleChange}/>
        </ItemDialog>
    )

    function handleChange(name, value) {
        values[name] = value
    }

    function handleConfirm() {
        onConfirm(true, Loader.preparePoster(values))
    }

    function handleClose() {
        onConfirm(false)
    }
}

export function EditableCourse(props) {

    const {onClose, modalRootDiv} = props
    const classes = useStyles()
    const courseId = props.id
    const listId = ({content, name}) => content[name] ? content[name].id : content[name + "Id"]
    const BodyView = props => <Typography variant="body1" {...props}/>
    const DateView = props => <BodyView>{formatDate(props.children)}</BodyView>

    return <CourseDataRequest WrappedComponent={EditableCourseByResponse} {...props}/>

    function EditableCourseByResponse(props) {

        const {content} = props
        const {heading, topics, webinars} = content.course

        const listViews = {

            "Topic": (props) => {

                const {content} = props
                const {topic, date, topicId, videoLessons} = content
                const courseTopicId = props.id

                return (
                    <Box className={classes["course-item-box"]}>
                        <DateView>{date}</DateView>
                        {topic && <BodyView>{topic.heading}</BodyView>}
                        {topicId && <TopicById id={topicId}/>}
                        <List name="VideoLesson"
                              title="Видеоуроки:"
                              titleComponent="subtitle1"
                              items={videoLessons || []}
                              parentId={courseTopicId}
                              replacedContainer={props.avatarRootDiv}/>
                    </Box>
                )

                function TopicById({id}) {
                    const query = `
                        query Topic($id: ID!) {
                            topic(id: $id) {
                                heading
                            }
                        }`
                    const TopicFromContent = ({content}) => <BodyView>{content.topic.heading}</BodyView>
                    return <DataRequestComponent WrappedComponent={TopicFromContent} query={query} args={{id}}/>
                }
            },

            "Webinar": (props) => {

                const {content} = props
                const {webinar, webinarId} = content

                return (
                    <Box className={classes["course-item-box"]}>
                        {webinar && <Webinar webinar={webinar}/>}
                        {webinarId && <WebinarById webinarId={webinarId}/>}
                    </Box>
                )

                function Webinar(props) {
                    const {webinar} = props
                    return (
                        <Box>
                            <DateView>{webinar.date}</DateView>
                            <BodyView>{webinar.heading}</BodyView>
                        </Box>
                    )
                }

                function WebinarById(props) {

                    const {webinarId} = props
                    const query = `
                        query Webinar($id: ID!) {
                            webinar(id: $id) {
                                date
                                heading
                            }
                        }`
                    const args = {id: webinarId}

                    return <DataRequestComponent WrappedComponent={View}
                                                 query={query}
                                                 args={args}/>

                    function View(props) {
                        return <Webinar webinar={props.content.webinar}/>
                    }
                }
            },

            "VideoLesson": (props) => {

                const {videoLesson, videoLessonId, tests} = props.content
                const courseVideoLessonId = props.id

                return (
                    <Box className={classes["video-lesson-box"]}>
                        {videoLesson && <BodyView>{videoLesson.heading}</BodyView>}
                        {videoLessonId && <VideoLessonById id={videoLessonId}/>}
                        <List name="Test"
                              title="Самостоятельные работы:"
                              titleComponent="subtitle1"
                              items={tests || []}
                              parentId={courseVideoLessonId}
                              replacedContainer={props.avatarRootDiv}/>
                    </Box>
                )

                function VideoLessonById({id}) {
                    const query = `
                        query VideoLesson($id: ID!) {
                            videoLesson(id: $id) {
                                heading
                            }
                        }`
                    const View = ({content}) => <BodyView>{content.videoLesson.heading}</BodyView>
                    return <DataRequestComponent WrappedComponent={View} query={query} args={{id}}/>
                }
            },

            "Test": (props) => {

                const {test, testId} = props.content

                return (
                    <Box className={classes["test-box"]}>
                        {test && <BodyView>{test.heading}</BodyView>}
                        {testId && <TestById id={testId}/>}
                    </Box>
                )

                function TestById({id}) {
                    const query = `
                        query Test($id: ID!) {
                            test(id: $id) {
                                heading
                            }
                        }`
                    const View = ({content}) => <BodyView>{content.test.heading}</BodyView>
                    return <DataRequestComponent WrappedComponent={View} query={query} args={{id}}/>
                }
            }
        }

        const listDialogs = {

            "Topic": ({content, onConfirm}) => {

                const values = {
                    topicId: listId({content, name: "topic"}),
                    dateString: formatDateTime(content.date || Date.now(), {dateOnly: true})
                }

                return (
                    <ItemDialog name="course-topic"
                                title={`Ввод тем для курса: ${heading}`}
                                onClose={handleClose}
                                onConfirm={handleConfirm}>
                        <ItemSelect value={values.topicId}
                                    itemsName="topics"
                                    onChange={value => handleChange("topicId", value)}
                                    onClose={onClose}/>
                        <DateField value={values.dateString}
                                   onConfirm={handleConfirm}
                                   onClose={handleClose}
                                   onChange={value => handleChange("dateString", value)}/>
                    </ItemDialog>
                )

                function handleChange(name, value) {
                    values[name] = value
                }

                function handleConfirm() {
                    onConfirm(true, {topicId: values.topicId, date: String(Date.parse(values.dateString))})
                }

                function handleClose() {
                    onConfirm(false)
                }

                function DateField(props) {

                    const {value, onChange, ...rest} = props
                    const [date, setDate] = useState(value)

                    return (
                        <FormTextField label="Начать"
                                       type="date"
                                       value={date}
                                       onChange={handleChange}
                                       {...rest}/>
                    )

                    function handleChange(date) {
                        onChange(date)
                        setDate(date)
                    }
                }
            },

            "Webinar": ({content, onConfirm}) => {

                let webinarId = listId({content, name: "webinar"})

                return (
                    <ItemDialog name="course-webinar"
                                title={`Выбор вебинаров для курса ${heading}`}
                                onClose={handleClose}
                                onConfirm={handleConfirm}>
                        <ItemSelect value={webinarId} itemsName="webinars" onChange={handleChange} onClose={onClose}/>
                    </ItemDialog>
                )

                function handleChange(value) {
                    webinarId = value
                }

                function handleConfirm() {
                    onConfirm(true, {webinarId})
                }

                function handleClose() {
                    onConfirm(false)
                }
            },

            "VideoLesson": ({content, onConfirm}) => {

                const values = {
                    videoLessonId: listId({content, name: "videoLesson"})
                }

                return (
                    <ItemDialog name="course-videoLesson"
                                title={`Выбор видеоуроков для курса: ${heading}`}
                                onClose={() => onConfirm(false)}
                                onConfirm={() => onConfirm(true, values)}>
                        <ItemSelect value={values.videoLessonId}
                                    itemsName="videoLessons"
                                    onChange={value => values["videoLessonId"] = value}
                                    onClose={onClose}/>
                    </ItemDialog>
                )
            },

            "Test": ({content, onConfirm}) => {

                const values = {
                    testId: listId({content, name: "test"})
                }

                return (
                    <ItemDialog name="course-test"
                                title={`Выбор тестов для курса: ${heading}`}
                                onClose={() => onConfirm(false)}
                                onConfirm={() => onConfirm(true, values)}>
                        <ItemSelect value={values.testId}
                                    itemsName="tests"
                                    onChange={value => values["testId"] = value}
                                    onClose={onClose}/>
                    </ItemDialog>
                )
            }
        }

        return (
            <EditableItem title="Редактирование курса:" desc={heading} onClose={onClose}>
                <List name="Topic" title="Темы:" items={topics} parentId={courseId}/>
                <List name="Webinar" title="Вебинары:" items={webinars} parentId={courseId}/>
            </EditableItem>
        )

        function List(props) {

            const {name, title, titleComponent, items, parentId, replacedContainer} = props

            const ListData = createContentData({
                name: "Course" + name,
                ViewComponent: listViews[name],
                DialogComponent: listDialogs[name]
            })
            const listData = new ListData({rootId: parentId, items})

            return (
                <Container title={title}>
                    <EditorShell EditingComponent={EditableContainer}
                                 avatarRootDiv={replacedContainer}
                                 modalRootDiv={modalRootDiv}
                                 contentData={listData}
                                 userModeProps={{isEditMode: true}}/>
                </Container>
            )

            function Container(props) {
                const {title, children} = props
                return (
                    <Box>
                        <Typography variant={titleComponent || "h6"}>{title}</Typography>
                        {children}
                    </Box>
                )
            }

            function EditableContainer(props) {

                const componentProps = {
                    Container: props => <Box className={classes["list-container"]}{...props}/>,
                    containerProps: {component: "ul"},
                    Item: Item
                }

                return <EditableBasis {...props} componentProps={componentProps}/>

                function Item(props) {

                    const {children, itemRef, editableActions, id, styles} = props
                    const StyledBox = styled(Box)(styles || {})

                    return (
                        <StyledBox ref={itemRef} id={id} component="li">
                            {editableActions}
                            {children}
                        </StyledBox>
                    )
                }
            }
        }
    }
}

export function CourseDataRequest(props) {

    const {open, id, ...rest} = props
    const query = `
                query Course($id: ID!) {
                    course(id: $id) {
                        heading
                        topics {
                            id
                            date
                            topic {
                                id
                                heading
                            }
                            videoLessons {
                                id
                                videoLesson {
                                    id
                                    key
                                    heading                                    
                                    videoId
                                }
                                tests {
                                    id
                                    test {
                                        id
                                        heading
                                    }
                                }
                            }
                        }
                        webinars {
                            id
                            webinar {
                                id
                                heading
                                date
                                link
                            }
                        }
                    }
                }`

    return <>{open ?
        <BackDropDataRequest {...rest} query={query} args={{id}}/> : undefined
    }</>
}

function ItemSelect(props) {

    const {itemsName, onClose} = props

    const query = `
                query List($name: List!) {
                   list(name: $name) {
                        id
                        heading
                    }
                }`
    return <BackDropDataRequest WrappedComponent={View}
                                query={query}
                                args={{name: itemsName}}
                                onClose={onClose}
                                {...props}/>

    function View(props) {

        const {value, onChange} = props
        const items = props.content.list;
        const [itemId, setItemId] = useState(value)

        return (
            <Select value={itemId || ""} onChange={handleChange}>
                {items.map(item =>
                    <MenuItem key={item.id} value={item.id}>
                        <SelectItem item={item}/>
                    </MenuItem>)}
            </Select>
        )

        function handleChange(event) {
            const {value} = event.target
            setItemId(value)
            onChange(value)
        }
    }
}