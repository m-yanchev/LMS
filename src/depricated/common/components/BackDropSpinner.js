import React from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Backdrop, CircularProgress} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.modal + 80,
    },
    spinner: {
        color: '#fff',
    }
}));

export default function BackDropSpinner(props) {

    const {open} = props
    const classes = useStyles();

    return <>{open &&
    <Backdrop className={classes.backdrop} open={open} timeout={500}>
        <CircularProgress className={classes.spinner} />
    </Backdrop>
    }</>
}