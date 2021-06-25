//@flow
import React, {Fragment, useState} from "react"
import {Divider, List, ListItem, ListItemSecondaryAction, ListItemText, ButtonGroup} from "@material-ui/core";
import {ButtonWithTooltip, IconButtonWithTooltip} from "./ButtonWithTooltip";
import ClearIcon from "@material-ui/icons/Clear";
import {makeStyles} from "@material-ui/core/styles";
import {openFiles} from "../files";

const useStyles = makeStyles(theme => ({
    "submit-solutions-list-item-text": {
        overflow: "hidden"
    }
}))

type AddFilesButtonProps = {
    onSubmit: Array<File> => Promise<void>
}

function AddFilesButton(props: AddFilesButtonProps) {

    const {onSubmit} = props
    const [files, setFiles] = useState<Array<File>>([])
    const classes = useStyles()

    return <>
        <List>
            {files.map((file, index) => <Fragment key={file.name + index}>
                    <ListItem className={classes["submit-solutions-list-item"]}>
                        <ListItemText className={classes["submit-solutions-list-item-text"]}>
                            {file.name}
                        </ListItemText>
                        <ListItemSecondaryAction>
                            <IconButtonWithTooltip onClick={() => handleClearFile(index)}
                                                   size="small"
                                                   desc={"Удалить файл из списка"}>
                                <ClearIcon/>
                            </IconButtonWithTooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider/>
                </Fragment>
            )}
        </List>
        <ButtonGroup>
            <ButtonWithTooltip desc="Добавить фото решений для отправки"
                               color={files.length ? "default" : "primary"}
                               onClick={handleAddFiles}>
                {"Добавить"}
            </ButtonWithTooltip>
            {files.length &&
            <ButtonWithTooltip desc="Отправить фото решений учителю"
                               color="primary"
                               onClick={() => onSubmit(files)}>
                {"Отправить"}
            </ButtonWithTooltip>}
        </ButtonGroup>
    </>

    function handleClearFile(index: number): void {
        const newFiles = files.slice()
        newFiles.splice(index, 1)
        setFiles(newFiles)
    }

    function handleAddFiles(): void {

        openFiles().then(oFiles => {
            const newFiles = files.concat(toArray(oFiles))
            setFiles(newFiles)
        }).catch()

        function toArray(files) {
            const aFiles = []
            for (let i = 0; i < files.length; i++) {
                aFiles.push(files.item(i))
            }
            return aFiles
        }
    }
}

export default AddFilesButton