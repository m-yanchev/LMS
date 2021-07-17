import React from "react";
import {Paper} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    "paper": {
        width: "100%",
        overflow: "auto",
        padding: theme.spacing(2),
        marginBottom: theme.spacing(4),
    }
}))

export function LessonPaper(props) {
    const classes = useStyles()
    return <Paper className={classes["paper"]} {...props}/>
}