//@flow

import React from "react"
import CircularProgress from '@material-ui/core/CircularProgress';
import {Grid} from "@material-ui/core";

type LoadingProgressProps = {}

export function LoadingProgress(props: LoadingProgressProps) {
    return (
        <Grid container justify={"center"} alignItems={"center"}>
            <CircularProgress/>
        </Grid>
    )
}