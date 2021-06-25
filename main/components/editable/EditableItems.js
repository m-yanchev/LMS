import React, {useState} from 'react'
import {
    Grid, Typography, Select, ListSubheader, MenuItem, CardActionArea, Link, CardActions, CardContent
} from '@material-ui/core';
import {ContentItemType, ContentList} from "../../ContentData";
import {FormTextField, ItemDialog, HeadingField} from "../../../common/components/Dialog";
import {BackDropDataRequest} from "../../../common/components/DataRequest";
import {Problem, ProblemById} from "../../../common/components/Problem";
import Test from "../Test";
import Webinar from "../Webinar";
import {Rating} from "../common/Rating";
import {Time} from "../common/Time";
import modalVideoLessonInput from "../modal/modalVideoLessonInput";
import {getAliases} from "../../../common/helpers";
import ImageBox from "../common/ImageBox";
import {makeStyles} from "@material-ui/core/styles";
import ModalTaskTypeInput from "../modal/ModalTaskTypeInput";
import modalTaskInput from "../modal/ModalTaskInput";
import ErrorBoundary from "../../../ReactApp/smartComponents/ErrorBoundary";
import {ItemCardHeader, SelectItem} from "../common/Boxes";
import {TypeProblems} from "../TypeProblems";
import Content from "../common/Content";
import ModalHeadingInput from "../modal/ModalHeadingInput";
import {getFullPath} from "../../path"
import {formatDateTime} from "../../../common/DateTime";
import Image from "../common/Image";
import {CARD_WIDTH, IMAGES_FOLDER, VIDEO_POSTERS_FOLDER} from "../../../common/constants";
import NumberField from "../../../common/components/NumberField";

const useStyles = makeStyles((theme) => ({
    videoLessonComponent: {
        height: "100%"
    },
    videoLessonComponentLink: {
        display: "block",
        height: "100%"
    },
    videoLessonComponentImage: {},
    videoLessonComponentHeading: {
        margin: theme.spacing(2)
    },
    typeProblemComponent: props => {
        const {typeProblemFullWidthOn} = props
        return {
            display: "block",
            paddingBottom: theme.spacing(2),
            paddingRight: !typeProblemFullWidthOn ? theme.spacing(2) : undefined,
            width: !typeProblemFullWidthOn ? theme.spacing(CARD_WIDTH) : undefined,
        }
    },
    typeProblemComponentNumber: {
        float: "left",
        marginRight: theme.spacing(2)
    },
    itemSelect: {
        backgroundColor: theme.palette.background.paper
    },
    imageComponent: {
        width: 100,
        height: 100
    }
}))

export function createContentData({name, ViewComponent, DialogComponent}) {
    return class extends ContentList {
        constructor(props) {
            const types = [new ContentItemType({name, Component: ViewComponent, InputComponent: DialogComponent})];
            const items = props.items.map(({id, ...content}) => ({id, parentId: props.rootId, content}));
            super(props.rootId, types, items);
        }
    }
}

export class HeadingsData extends ContentList {

    constructor(props) {
        try {
            const types = [new ContentItemType({
                name: 'Heading',
                Component: HeadingComponent,
                InputComponent: ModalHeadingInput,
                model: 'headings'
            })];
            const items = props.items.map(({id, ...content}) => ({
                id,
                parentId: props.rootId,
                content
            }));
            super(props.rootId, types, items);
        } catch (e) {
            console.log("EditableItems.HeadingsData: props = %o", props)
            throw e
        }
    }
}

export class VideoLessonsData extends ContentList {
    constructor(props) {
        const types = [{
            name: 'VideoLesson',
            Component: VideoLessonComponent,
            InputComponent: modalVideoLessonInput,
            model: 'videoLessons'
        }];
        const items = props.items.map(({id, key, ...content}) => ({
            id,
            key,
            parentId: props.rootId,
            content
        }));
        super(props.rootId, types, items)
    }
}

export class TestHeadingsData extends ContentList {

    constructor(props) {
        const type = props.type || "test"
        const types = [new ContentItemType({
            name: 'TestHeading',
            Component: props => Test({...props, type}),
            InputComponent: props => TestHeadingDialog({...props, type}),
            model: 'headings'
        })];
        const items = props.items.map(({id, key, parentId, ...content}) => ({
            id,
            key,
            parentId: props.rootId,
            content
        }));
        super(props.rootId, types, items);
    }
}

export class ProblemTypesData extends ContentList {

    constructor({avatarRootDiv, rootId, ...rest}) {
        if (avatarRootDiv && typeof avatarRootDiv !== 'object')
            throw new TypeError('avatarRootDiv is not an object');
        const types = [{
            name: 'ProblemType',
            Component: props => <ProblemTypeComponent avatarRootDiv={avatarRootDiv} {...props}/>,
            InputComponent: ModalTaskTypeInput,
            model: 'headings'
        }, {
            name: 'Problem',
            Component: TypeProblemComponent,
            InputComponent: modalTaskInput({isExample: true, avatarRootDiv}),
            model: 'tasks',
        }];

        const items = rest.items.map(({id, key, parentId, ...content}) => ({
            id,
            key,
            parentId: parentId || rootId,
            content
        }));
        super(rootId, types, items);
    }
}

export class TypeProblemsData extends ContentList {

    constructor(props) {
        if (props.avatarRootDiv && typeof props.avatarRootDiv !== 'object')
            throw new TypeError('avatarRootDiv is not an object');
        const types = [{
            name: 'Problem',
            Component: TypeProblemComponent,
            InputComponent: modalTaskInput({avatarRootDiv: props.avatarRootDiv}),
            model: 'tasks'
        }];
        const items = props.items.map(({id, key, parentId, ...content}) => ({
            id,
            key,
            parentId,
            content
        }));
        super(props.rootId, types, items);
    }
}

export class ImagesData extends ContentList {

    constructor({imageCount, key}) {

        const items = [];
        for (let index = 0; index < imageCount; index++) {
            items.push({id: String(index), parentId: key, content: {index, type: 'server'}});
        }

        const types = [new ContentItemType({name: 'Image', Component: ImageComponent})];

        super(key, types, items);
    }
}

export class TestProblemsData extends ContentList {

    constructor(props) {
        const types = [new ContentItemType({
            name: 'TestProblem',
            Component: TestProblemComponent,
            InputComponent: TestProblemDialog,
            model: 'testProblems'
        })];
        const items = props.items.map(({id, ...content}) => ({
            id,
            parentId: props.rootId,
            content
        }));
        super(props.rootId, types, items)
    }
}

export class WebinarsData extends ContentList {

    constructor(props) {
        const types = [new ContentItemType({
            name: 'Webinar',
            Component: Webinar,
            InputComponent: WebinarDialog,
            model: 'webinars'
        })];
        const items = props.items.map(({id, ...content}) => ({
            id,
            parentId: props.rootId,
            content
        }));
        super(props.rootId, types, items);
    }
}

function HeadingComponent(props) {

    const {content} = props
    const heading = content.heading || '';

    return (
        <Grid container direction="column">
            <Link color="textPrimary" href={getFullPath(props.path, content.alias)}>{heading}</Link>
        </Grid>
    )
}

function VideoLessonComponent(props) {

    const {content, itemKey} = props
    const afterEditingPath = props.path
    const {heading, alias, poster} = content
    const fromServerPath = content.path
    const aliases = getAliases(fromServerPath || afterEditingPath)
    aliases.length = 2
    const path = getFullPath("/" + aliases.join("/"), alias)
    const classes = useStyles();

    return (
        <CardActionArea className={classes.videoLessonComponent}>
            <Link className={classes.videoLessonComponentLink} underline="none" href={path}>
                <ImageBox className={classes.videoLessonComponentImage}
                          path={`/${IMAGES_FOLDER}/${VIDEO_POSTERS_FOLDER}`}
                          rootKey={itemKey}
                          image={poster}
                          isResize/>
                <Typography className={classes.videoLessonComponentHeading}
                            component="h2"
                            variant="subtitle2"
                            color="textSecondary">
                    {heading}
                </Typography>
            </Link>
        </CardActionArea>
    )
}

function ProblemTypeComponent(props) {

    const {content, path, componentList, avatarRootDiv} = props;
    const {heading, alias, taskDesc} = content;

    return (
        <ErrorBoundary>
            <ItemCardHeader title={heading}
                            action={
                                <CardActions>
                                    <Link href={getFullPath(path, alias)} variant="button">Все задачи</Link>
                                </CardActions>}/>
            {(componentList.length || componentList.editModeOn) &&
            <CardContent>
                <TypeProblems componentList={componentList} problemDesc={taskDesc} avatarRootDiv={avatarRootDiv}/>
            </CardContent>}
        </ErrorBoundary>
    )
}

function TypeProblemComponent(props) {

    const {content, itemKey, path, number} = props
    const {desc, imageList} = content
    const problemDescWidthLimit = 30
    const fullWidthOn = (imageList && imageList.length > 0) || desc.length > problemDescWidthLimit
    const classes = useStyles({typeProblemFullWidthOn: fullWidthOn})

    return (
        <ErrorBoundary>
            <Link className={classes.typeProblemComponent} underline="none" href={getFullPath(path, itemKey)}>
                <Typography className={classes.typeProblemComponentNumber} component={"span"} color="textSecondary">
                    {number + "."}
                </Typography>
                <Content model={'tasks'}
                         taskKey={itemKey}
                         imageList={imageList}>
                    {desc}
                </Content>
            </Link>
        </ErrorBoundary>
    )
}

function ImageComponent(props) {

    const {parentId, path, content} = props
    const {index, type, fileData} = content
    const classes = useStyles()

    return <Image className={classes.imageComponent}
                  image={type === "client" ? fileData : undefined}
                  rootKey={parentId}
                  path={path}
                  index={index}
                  isResize isDateId/>
}

function TestProblemComponent(props) {

    const {content} = props
    const {problemId, rating, time} = content

    return (
        <CardContent>
            <ProblemById problemId={problemId}/>
            <Rating rating={rating}/>
            <Time time={time}/>
        </CardContent>
    )
}

function TestHeadingDialog(props) {

    const {content, onConfirm, type} = props;
    const {heading} = content || {}
    let value = heading || ""

    return (
        <ItemDialog name="test-heading"
                    title="Ввод заголовка для теста"
                    onClose={handleClose}
                    onConfirm={handleConfirm}>
            <HeadingField autoFocus
                           value={value}
                           onConfirm={handleConfirm}
                           onClose={handleClose}
                           onChange={handleChange}/>
        </ItemDialog>
    )

    function handleChange(heading) {
        value = heading
    }

    function handleConfirm() {
        onConfirm(true, {heading: value, type})
    }

    function handleClose() {
        onConfirm(false)
    }
}

function TestProblemDialog(props) {

    const {content, onConfirm} = props
    const values = {...content, time: content.time || 1, rating: content.rating || 1}

    return (
        <ItemDialog name="test-problem"
                    title="Ввод задания для теста"
                    onClose={handleClose}
                    onConfirm={handleConfirm}>
            <ProblemSearch value={values.problemId} onChange={handleProblemIdChange}/>
            <TimeField defaultValue={values.time}
                       onConfirm={handleConfirm}
                       onClose={handleClose}
                       onChange={handleTimeChange}/>
            <RatingField defaultValue={values.rating}
                         onConfirm={handleConfirm}
                         onClose={handleClose}
                         onChange={handleRatingChange}/>
        </ItemDialog>
    )

    function handleProblemIdChange(value) {
        values.problemId = value
    }

    function handleTimeChange(value) {
        values.time = value
    }

    function handleRatingChange(value) {
        values.rating = value
    }

    function handleConfirm() {

        const {problemId, rating, time} = values

        if (problemId) {
            onConfirm(true, {problemId, rating: normalize(rating), time: normalize(time)})
        } else {
            onConfirm(false)
        }

        function normalize(number) {
            return number > 0 ? number : 1
        }
    }

    function handleClose() {
        onConfirm(false)
    }
}

function WebinarDialog(props) {

    const {content, onConfirm} = props;
    const {heading, date, link} = content || {}
    let values = {
        heading: heading || "",
        dateString: formatDateTime(date || Date.now()),
        link: link || "",
    }

    return (
        <ItemDialog name="webinar"
                    title="Ввод заголовка и времени начала вебинара"
                    onClose={handleClose}
                    onConfirm={handleConfirm}>
            <HeadingField autoFocus
                           value={values.heading}
                           onConfirm={handleConfirm}
                           onClose={handleClose}
                           onChange={value => handleChange("heading", value)}/>
            <FormTextField label="Начать"
                           type="datetime-local"
                           defaultValue={values.dateString}
                           onConfirm={handleConfirm}
                           onClose={handleClose}
                           onChange={value => handleChange("dateString", value)}/>
            <FormTextField label="Ссылка"
                           type="text"
                           defaultValue={values.link}
                           onConfirm={handleConfirm}
                           onClose={handleClose}
                           onChange={value => handleChange("link", value)}/>
        </ItemDialog>
    )

    function handleChange(name, value) {
        values[name] = value
    }

    function handleConfirm() {
        onConfirm(true, {heading: values.heading, date: String(Date.parse(values.dateString)), link: values.link})
    }

    function handleClose() {
        onConfirm(false)
    }
}

function ProblemSearch(props) {
    const query = `
                query ProblemSearchLists {
                    problemSearchLists {
                        headings {
                            id
                            parentId
                            heading
                        }
                        problems {
                            id
                            key
                            parentId
                            desc
                            answer
                        }
                    }
                }`
    return <BackDropDataRequest WrappedComponent={ProblemSearchView}
                                 query={query}
                                 {...props}/>
}

function ProblemSearchView(props) {

    const {value, content, onChange} = props
    const {headings, problems} = content.problemSearchLists;
    const [problem, setProblem] = useState(getProblemById(value));
    const [topicId, setTopicId] = useState(getTopicId());

    return (
        <Grid>
            <ItemSelect subheaderItems={headings}
                        menuItems={headings}
                        parentId="0"
                        value={topicId}
                        onChange={handleTopicChange}
                        ItemView={SelectItem}/>
            <ItemSelect subheaderItems={headings}
                        menuItems={problems}
                        parentId={topicId}
                        value={problem && problem.id}
                        onChange={handleProblemChange}
                        ItemView={ProblemView}/>
        </Grid>
    )

    function ProblemView(props) {
        const {key, ...rest} = props.item
        return <Problem problemKey={key} {...rest}/>
    }

    function handleTopicChange(id) {
        setProblem(undefined)
        setTopicId(id)
        onChange(undefined)
    }

    function handleProblemChange(id) {
        setProblem(getProblemById(id))
        onChange(id)
    }

    function getProblemById(id) {
        return id && problems.find(problem => problem.id === id)
    }

    function getTopicId() {
        return problem && headings.find(heading => heading.id === problem.parentId).parentId;
    }
}

function ItemSelect(props) {

    const {subheaderItems, menuItems, parentId, value, onChange, ItemView} = props
    const classes = useStyles()

    return (<>{parentId &&
        <Select value={value || ""} onChange={handleChange}>
            {subheaderItems.map(subheaderItem => subheaderItem.parentId === parentId ? [
                <ListSubheader className={classes.itemSelect} key={subheaderItem.id}>
                    {subheaderItem.heading}
                </ListSubheader>,
                menuItems.map(menuItem => menuItem.parentId === subheaderItem.id ?
                    <MenuItem key={menuItem.id} value={menuItem.id}>
                        <ItemView item={menuItem}/>
                    </MenuItem> : undefined)] : undefined)}
        </Select>}</>
    )

    function handleChange(event) {
        const {value} = event.target
        onChange(value);
    }
}

function TimeField(props) {
    const errorMessage = "Неверный формат количества минут"
    return <NumberField min={1} label="Время" errorMessage={errorMessage} required {...props}/>
}

function RatingField(props) {
    const errorMessage = "Неверный формат количества баллов"
    return <NumberField min={1} label="Баллы" errorMessage={errorMessage} required {...props}/>
}