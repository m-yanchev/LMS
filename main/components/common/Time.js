import React from "react";
import {graduationAfterNumerals} from "../../../common/graduationsAfterNumerals";
import {Description, GreatInfo} from "./Boxes";

export function Time(props) {

    const {time} = props
    const title = props.title || "Время выполнения:"

    return (<>
        <Description>{`${title}`}<br/></Description>
        <GreatInfo>{makeTime()}<br/></GreatInfo>
    </>)

    function makeTime() {
        return graduationAfterNumerals(time, ["минута", "минуты", "минут"])
    }
}