import React from "react";
import {Box, Typography} from "@material-ui/core";
import Content from "../../main/components/common/Content";
import {DataRequestComponent} from "./DataRequest";
import Updater from "../../main/HOC/Updater";
import ItemLoader from "../../main/HOC/ItemLoader";
import CallModal from "../../main/HOC/CallModal";
import WrapComponentFunctionStack from "../../main/HOC/WrapComponentFunctionStack";
import {Lesson} from "../../main/components/common/Boxes";
import ErrorBoundary from "../../ReactApp/smartComponents/ErrorBoundary";
import {UpdateButton} from "../../main/components/common/ButtonsForEdit";
import modalTaskInput from "../../main/components/modal/ModalTaskInput";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    fullProblemHeader: {
        marginBottom: theme.spacing(1),
    },
    fullProblemDesc: {
    },
    fullProblemInfoBox: {
        marginBottom: theme.spacing(2),
    },
    problem: {
        width: "100%"
    },
    "problem-title": {
        margin: theme.spacing(1, 0, 3, 0)
    }
}))

export function ProblemById(props) {

    const {problemId, answerNotVisible, onLoad, number, ...rest} = props
    const query = `
                query Problem($id: ID!) {
                    problem(id: $id) {
                        key
                        commonDesc
                        desc
                        answer
                    }
                }`
    const args = {id: problemId}

    return <DataRequestComponent WrappedComponent={ProblemFromContent} query={query} args={args} {...rest}/>

    function ProblemFromContent(props) {
        const {content} = props;
        const {answer, key, ...problem} = content.problem
        if (onLoad) onLoad(answer)
        return <Problem answer={!answerNotVisible && answer} problemKey={key} number={number} {...problem}/>
    }
}

export function Problem(props) {

    const {problemKey, desc, commonDesc, answer, number} = props
    const classes = useStyles()

    return (
        <Box className={classes.problem}>
            <Typography className={classes["problem-title"]} variant="h6">
                {`Задание${number ? " №" + number : ":"}`}
            </Typography>
            {commonDesc &&
            <Typography>{commonDesc}</Typography>}
            <Content model={'tasks'} taskKey={problemKey}>{desc}</Content>
            {answer ? <>
                <Typography variant="h5">Ответ:</Typography>
                <Content model={'tasks'} taskKey={problemKey}>
                    {answer}
                </Content></> : undefined}
        </Box>
    )
}

export function EditableProblem(props) {

    const {modalRootDiv, avatarRootDiv, content, typeHeader} = props;
    if (!content) return <></>
    const number = content.key

    const funcStack = [{
        name: Updater
    }, {
        name: ItemLoader
    }, {
        name: CallModal,
        otherProps: {modalRootDiv}
    }];

    const WrapperComponent = WrapComponentFunctionStack(FullProblemWithButton, funcStack)

    return (
        <Lesson title={"Задание №" + number} desc={'на тему: "' + typeHeader + '"'}>
            <WrapperComponent {...props}/>
        </Lesson>
    )

    function FullProblemWithButton(props) {

        const {itemProps} = props
        const {onUpdate, contentData, isEditMode} = itemProps;
        const handleUpdate = () => {
            const {id, key, ...content} = contentData;
            onUpdate({model: 'tasks', Form: modalTaskInput({avatarRootDiv}), id, key, prevContent: content})
        }

        return <>
            {isEditMode ?
                <UpdateButton onClick={handleUpdate}/> : undefined}
            <FullProblem {...props}/>
        </>
    }
}

function FullProblem(props) {

    const {itemProps} = props
    const {contentData} = itemProps
    const {key, desc, src, srcNumb, solution, answer, imageList, commonDesc} = contentData

    return (
        <ErrorBoundary>
            <Box>
                <ProblemCommonDesc desc={commonDesc}/>
                <InfoBox visible>
                    <Content
                        model={'tasks'}
                        taskKey={key}
                        imageList={imageList}>
                        {desc}
                    </Content>
                </InfoBox>
                <InfoBox visible={src} title="Источник:">
                    <Desc>{src}</Desc>
                </InfoBox>
                <InfoBox visible={srcNumb} title="Номер источника:">
                    <Desc>{srcNumb}</Desc>
                </InfoBox>
                <InfoBox visible={solution} title="Решение:">
                    <Content taskKey={key}
                             model={'tasks'}
                             imageList={imageList}>
                        {solution}
                    </Content>
                </InfoBox>
                <InfoBox visible={answer} title="Ответ:">
                    <Content taskKey={key}
                             model={'tasks'}
                             imageList={imageList}>
                        {answer}
                    </Content>
                </InfoBox>
            </Box>
        </ErrorBoundary>
    )
}

export function ProblemCommonDesc(props) {

    const {desc} = props

    return (
        <InfoBox visible={desc && desc !== ""}>
            <Desc>{desc + ':'}</Desc>
        </InfoBox>
    )
}

function InfoBox(props) {

    const {visible, title, children} = props
    const classes = useStyles()

    return (<>
        {visible ?
            <Box className={classes.fullProblemInfoBox}>
                {title ?
                    <Header>{title}</Header> : undefined}
                {children}
            </Box> : undefined}
    </>)
}

function Header(props) {

    const {children} = props
    const classes = useStyles()

    return (
        <Typography className={classes.fullProblemHeader} component="h2" variant="subtitle1" color="textSecondary">
            {children}
        </Typography>
    )
}

function Desc(props) {

    const {children} = props
    const classes = useStyles()

    return (
        <Typography className={classes.fullProblemDesc} component="p" variant="body1" color="textSecondary">
            {children}
        </Typography>
    )
}