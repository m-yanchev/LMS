import React from 'react'
import {Grid, Typography} from '@material-ui/core';

function Number(props) {

    const {value} = props;
    if (typeof value !== 'number')
        throw new Error('"value" is expected to be a number');
    return (
        <Grid container item xs={1}>
            <Typography onSelect={e => e.preventDefault()}>
                {value + '.'}
            </Typography>
        </Grid>
    )
}

export default Number