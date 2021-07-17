//@flow
import React from "react"
import type {Element} from "react"
import {redirect} from "../redirect";
import CourseButton from "./CourseButton";
import type {StyleCourseButtonProps} from "./CourseButton";

type CourseActivateButtonProps = {
    alias: string,
    ...StyleCourseButtonProps
}

function CourseActivateButton(props: CourseActivateButtonProps): Element<typeof CourseButton> {

    const {alias, ...rest} = props

    return (
        <CourseButton {...rest} onClick={handleClick}/>
    )

    function handleClick(): void {
        redirect(`/kursy/${alias}/tema`)
    }
}

export default CourseActivateButton