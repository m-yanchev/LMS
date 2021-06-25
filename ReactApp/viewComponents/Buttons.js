//@flow

import React from "react"
import {Button as ButtonMaterial, Tooltip} from "@material-ui/core";

type ButtonGroupProps = {
    titles: Array<string>,
    describes?: Array<string>,
    disables?: Array<boolean>,
    variants?: Array<Variant>,
    onClick: number => void
}

type Variant = "primary" | "secondary" | "default"

export function ButtonGroup(props: ButtonGroupProps) {

    const {titles, describes, disables, variants, onClick} = props

    return <>{titles.map((title, i) =>
        <Tooltip key={title} title={describes && describes[i]}>
            <span>
                <ButtonMaterial disabled={disables ? disables[i] : false}
                                color={variants ? variants[i] : "default"}
                                onClick={() => onClick(i)}>
                    {title}
                </ButtonMaterial>
            </span>
        </Tooltip>

    )}</>
}