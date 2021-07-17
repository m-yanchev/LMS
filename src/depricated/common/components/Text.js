import React from "react";
import {Box, Typography} from "@material-ui/core";

export function SimpleText(props) {
    return <Typography variant="body1" color="textSecondary" {...props}/>
}

export function CardText(props) {
    return <Typography variant="body2" color="textSecondary" {...props}/>
}

export function SubtitleText(props) {
    return <Typography variant="h6" component="h3" {...props}/>
}

export function Title(props) {
    const {variant, component, title, children, className} = props
    return (
        <Box className={className} component={component}>
            <Typography variant={variant} component="span" color="textSecondary">{`${title}: `}</Typography>
            <Typography variant={variant} component="span" color="textPrimary">{children}</Typography>
        </Box>
    )
}

export function B(props) {
    return <Typography component={"b"} color={"primary"} variant={"inherit"}>{props.children}</Typography>
}
