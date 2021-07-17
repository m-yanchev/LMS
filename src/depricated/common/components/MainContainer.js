//@flow
import React from "react";
import type {Node} from 'react';
import {Container, Paper} from "@material-ui/core";

function MainContainer(props: {children: Node, className?: string}): Node {
    return (
        <Container disableGutters maxWidth={'md'}>
            <Paper className={props.className}>
                {props.children}
            </Paper>
        </Container>
    )
}

export default MainContainer