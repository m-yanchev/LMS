//@flow
import React from "react"
import type {Node} from 'react'
import {Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    mainGrid: {
        height: "100%",
        overflow: "hidden"
    }
}))

function MainGrid(props: {children: Node}) {

    const classes = useStyles();

    return (
        <Grid className={classes.mainGrid} container direction="column">
            {props.children}
        </Grid>
    )
}

export default MainGrid