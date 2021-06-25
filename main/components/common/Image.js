import React, {useEffect, useState, useRef} from "react";
import {Box} from '@material-ui/core';
import Img from "./Img"
import Canvas from "./Canvas";

export default function Image(props) {

    const {className, image, rootKey, path, index, isResize, isDateId, isNaturalSize} = props
    const [canvasSize, setCanvasSize] = useState()
    useEffect(() => {
        if (!isNaturalSize) setCanvasSize({w: ref.current.clientWidth, h: ref.current.clientHeight});
    }, [index, path, image])
    const ref = useRef(null);

    return (
        <Box className={className} ref={ref}>
            {isNaturalSize || canvasSize ? image ?
                <Canvas data={image} size={canvasSize}/> :
                <Img path={path}
                     rootKey={rootKey}
                     index={index}
                     size={canvasSize}
                     isResize={isResize}
                     isDateId={isDateId}/> : undefined}
        </Box>
    )
}