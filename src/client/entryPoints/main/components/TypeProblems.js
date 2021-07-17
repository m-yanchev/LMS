import React from "react";
import {EditableGrid, EditorShell} from "./editable/EditableLists";
import {Lesson} from "./common/Boxes";
import {ProblemCommonDesc} from "../../../../depricated/common/components/Problem";

export function TypeProblemsLesson(props) {

    const {desc, contentData, ...rest} = props

    return <>{contentData &&
        <Lesson title="Типовые задания:" desc={desc}>
            <ProblemCommonDesc desc={rest.commonDesc}/>
            <EditorShell EditingComponent={EditableGrid} contentData={contentData} {...rest}/>
        </Lesson>
        }</>
}

export function TypeProblems(props) {

    const {problemDesc, componentList, ...rest} = props

    return (<>
        <ProblemCommonDesc desc={problemDesc}/>
        <EditableGrid itemProps={{componentList}} {...rest}/>
    </>)
}