import React from "react";
import {InformDialog} from "./Dialog";
import {makeStyles} from "@material-ui/core/styles";

export type InformerMessage = {
    title: ?string,
    desc: string
}

const useStyles = makeStyles(theme => ({
    root: {
        zIndex: theme.zIndex.modal + 40
    }
}))

export function Informer(props) {

    const {message, onClose} = props
    const {desc, title} = message || {}
    const classes = useStyles()

    return <InformDialog className={classes.root}
                         open={Boolean(message)}
                         message={desc}
                         onClose={onClose}
                         title={title || "Информация"}/>
}