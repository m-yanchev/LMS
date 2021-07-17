//@flow
import React, {useState} from "react"
import type {Element} from "react"
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardActionArea} from "@material-ui/core"
import ImageBox from "./common/ImageBox";
import {openImageOne} from "../../../../depricated/common/files";

const useStyles = makeStyles({
    root: {
        width: 160,
        height: 90
    },
    action: {
        width: "100%",
        height: "100%"
    }
})

const FIELD_NAME = "poster"

type ImageFieldProps = {
    file: ?File,
    id: ?string,
    prefix: "video" | "course",
    label: string,
    onChange: ("poster", File) => void
}

function ImageField(props: ImageFieldProps): Element<typeof Card> {

    const {file, id, prefix, label, onChange} = props
    const [image, setImage] = useState<?File>(file)
    const classes = useStyles()

    return <>
        <label htmlFor={FIELD_NAME}>{label}</label>
        <Card className={classes.root} id={FIELD_NAME}>
            <CardActionArea className={classes.action} onClick={handleClick}>
                {(id || image) && <ImageBox path={`/images/${prefix}Posters`} rootKey={id} image={image} isResize/>}
            </CardActionArea>
        </Card>
    </>

    async function handleClick(): Promise<void> {
        const file = await openImageOne();
        onChange(FIELD_NAME, file);
        setImage(file)
    }
}

export default ImageField