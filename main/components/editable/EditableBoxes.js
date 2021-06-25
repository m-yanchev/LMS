import React from "react";
import {Grid, CardActions, Button, Divider, Card} from "@material-ui/core";
import {makeStyles, styled} from "@material-ui/core/styles";
import {EditorShell} from "./EditableLists";
import {LessonBox, LessonHeader, TypeLessonHeader} from "../common/Boxes";
import {CARD_SPACE, CARD_WIDTH} from "../../../common/constants";

const useStyles = makeStyles((theme) => ({
    itemBox: {
        overflow: "auto",
        padding: theme.spacing(CARD_SPACE / 2),
    },
    itemsContainer: {
        listStyle: "none",
    },
    editableTest: {
        paddingBottom: theme.spacing(4)
    },
    "item-card": ({fullSize}) => ({
        height: "100%",
        width: fullSize ? "100%" : theme.spacing(CARD_WIDTH),
    })
}));

export function EditableItem(props) {

    const {title, desc, children, onClose} = props
    const classes = useStyles()

    return (
        <Grid className={classes.editableTest}>
            <LessonHeader title={title} desc={desc}/>
            {children}
            <Button onClick={handleClose}>Закрыть</Button>
            <Divider/>
        </Grid>
    )

    function handleClose() {
        onClose()
    }
}

export function EditableLessonsBox(props) {
    try {
        const {type, desc, subtitle, Item, leftMenuOpen, contentData, ...rest} = props

        return <>{contentData &&
            <LessonBox leftMenuOpen={leftMenuOpen}>
                <TypeLessonHeader desc={desc} subtitle={subtitle}>{type}</TypeLessonHeader>
                <EditorShell EditingComponent={Item} contentData={contentData} {...rest}/>
            </LessonBox>
        }</>
    } catch (e) {
        console.log("EditableBoxes.EditableLessonsBox: props = %o", props)
        throw e
    }
}

export function ItemCard(props) {

    const {children, itemRef, editableActions, id, styles, fullSize} = props
    const StyledCard = styled(Card)(styles || {})
    const classes = useStyles({fullSize})

    return (
        <StyledCard className={classes["item-card"]} ref={itemRef} id={id}>
            {editableActions &&
            <CardActions>
                {editableActions}
            </CardActions>}
            {children}
        </StyledCard>
    )
}

export function ItemBox(props) {

    const classes = useStyles();
    const {children} = props

    return <Grid item component="li" className={classes.itemBox}>{children}</Grid>
}

export function ItemsContainer(props) {

    const {children, ...rest} = props
    const classes = useStyles();

    return (
        <Grid className={classes.itemsContainer} component="ul" container item {...rest}>
            {children}
        </Grid>
    )
}