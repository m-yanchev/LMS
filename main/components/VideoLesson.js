import React from "react";
import {Lesson} from "./common/Boxes";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    iframe: {
        width: "100%",
        height: "100%"
    }
}));

export function VideoLesson(props) {

    const {content} = props
    const {videoId, heading} = content || {};
    const classes = useStyles();

    return <>{content &&
        <Lesson title="Видеоурок:" desc={heading} ratio={16 / 9}>
            <iframe className={classes.iframe}
                    src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&color=white&rel=0`}
                    frameBorder="0"
                    allowFullScreen/>
        </Lesson>
    }</>
}