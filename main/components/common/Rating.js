import React from "react";
import {Description, GreatInfo} from "./Boxes";

export function Rating(props) {
    const {rating} = props
    return (<>
        <Description>{"Максимальное количество баллов за тест: "}</Description>
        <GreatInfo>{rating}<br/></GreatInfo>
    </>)
}