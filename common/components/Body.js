//@flow
import React from "react";
import type {Node} from 'react';
import {Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    body: {
        flexGrow: 1
    }
}))

function Body(props: {children: Node}) {

    const classes = useStyles();

    return (
        <Grid className={classes.body} container alignItems="stretch">
            {props.children}
        </Grid>
    )
}

export default Body