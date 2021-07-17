//@flow
import React from "react"
import type {Element} from "react";
import {Link} from "@material-ui/core";
import VKIcon from "./VKIcon";

function VKLink(props: {className?: string}): Element<typeof Link> {

    return (
        <Link {...props} href="https://vk.com/tetradkavkletochku" target="_blank"><VKIcon/></Link>
    )
}

export default VKLink