//@flow
import React from "react"
import {ButtonWithTooltip} from "./ButtonWithTooltip";
import type {Element} from "react";

export type StyleCourseButtonProps = {|
    variant?: "outlined" | "contained",
    className?: string,
    disableElevation?: boolean,
    size?: "large" | "small"
|}

type CourseButtonProps = {
    isProgram?: boolean,
    onClick: void => void,
    ...StyleCourseButtonProps
}

function CourseButton(props: CourseButtonProps): Element<typeof ButtonWithTooltip> {

    const {isProgram, onClick, ...rest} = props
    const desc = isProgram ? "Посмотреть программу курса" : "Зайти на страницу курса"
    const color = isProgram ? "default" : "secondary"
    const title = isProgram ? "Программа" : "Зайти"

    return (
        <ButtonWithTooltip {...rest}
                           desc={desc}
                           color={color}
                           onClick={onClick}>
            {title}
        </ButtonWithTooltip>
    )
}

export default CourseButton