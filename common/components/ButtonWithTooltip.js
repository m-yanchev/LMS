import React from "react";
import {IconButton, Tooltip, Button} from "@material-ui/core";
import AddShoppingCartOutlinedIcon from '@material-ui/icons/AddShoppingCartOutlined';

export function PaymentButton(props) {
    return (
        <IconButtonWithTooltip desc="Купить проверки работ учителем"
                         color="secondary"
                         onClick={props.onClick}>
            <AddShoppingCartOutlinedIcon/>
        </IconButtonWithTooltip>
    )
}

export function IconButtonWithTooltip(props) {

    const {onClick, desc, children, color, ...rest} = props

    return (
        <Tooltip title={desc}>
            <IconButton color={color} onClick={onClick} {...rest}>
                {children}
            </IconButton>
        </Tooltip>
    )
}

export function ButtonWithTooltip(props) {

    const {onClick, desc, children, color, ...rest} = props

    return (
        <Tooltip title={desc}>
            <Button color={color} onClick={onClick} {...rest}>
                {children}
            </Button>
        </Tooltip>
    )
}