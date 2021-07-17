// @flow

import React from 'react';
import type {Element} from "react"
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import {AppBar, Slide, Toolbar} from "@material-ui/core";

type Props = {
    links: Array<LinkData>
}
type LinkData = {
    title: string,
    href: string
}
type HideOnScrollProps = {
    children: Element<typeof AppBar>
}

export default function NavBar(props: Props) {

    const {links} = props

    const HideOnScroll = (props: HideOnScrollProps) => {

        const {children} = props
        const trigger = useScrollTrigger()

        return (
            <Slide appear={false} direction="down" in={!trigger}>
                {children}
            </Slide>
        );
    }

    return (
        <HideOnScroll>
            <AppBar>
                <Toolbar>
                    <Links links={links}/>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
    )
}

type LinksProps = {

}

function Links(props) {

}