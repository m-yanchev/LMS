import React from "react";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import {IconButton} from "@material-ui/core";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";

export function UpdateButton(props) {
    return <CommonButton {...props} name="update"><EditOutlinedIcon/></CommonButton>
}

export function RemoveButton(props) {
    return <CommonButton {...props} name="remove"><DeleteOutlineOutlinedIcon/></CommonButton>
}

function CommonButton(props) {

    const {onClick, name, children} = props
    const handleClick = (event) => {
        event.stopPropagation()
        onClick({name})
    }

    return (
        <IconButton key={name} aria-label={name} onClick={event => handleClick(event)}>
            {children}
        </IconButton>
    )
}