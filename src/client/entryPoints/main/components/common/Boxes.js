import React from "react";
import {Box, CardHeader, Grid, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {HelpPopover} from "./Popovers";
import {CARD_SPACE, CARD_WIDTH} from "../../../../../depricated/common/constants";

const useStyles = makeStyles((theme) => {

    const itemFullSize = CARD_SPACE + CARD_WIDTH
    const itemFullSize3 = 3 * itemFullSize
    const itemFullSize2 = 2 * itemFullSize
    const height = (width, ratio) => ratio ? theme.spacing(width / ratio) : undefined
    const size = (width, ratio) => ({
        width: theme.spacing(width),
        height: height(width, ratio),
    })
    const adaptedSize = (breakpoints, ratio) => ({
        [theme.breakpoints.up(breakpoints[2])]: size(itemFullSize3, ratio),
        [theme.breakpoints.down(breakpoints[1])]: size(itemFullSize2, ratio),
        [theme.breakpoints.down(breakpoints[0])]: size(itemFullSize, ratio)
    })

    return {
        typeLessonHeader: {
            marginBottom: theme.spacing(2),
        },
        typeLessonHeaderTitle: {
            display: "block",
        },
        typeLessonHeaderSubtitle: {
            display: "inline-block"
        },
        lessonHeaderBox: {
            marginBottom: theme.spacing(2),
        },
        lessonBox: {
            marginBottom: theme.spacing(4),
        },
        appBoxSizeWithLeftMenu: props => adaptedSize(["sm", "md", "lg"], props.ratio),
        appBoxSizeWithoutLeftMenu: props => adaptedSize(["xs", "sm", "md"], props.ratio),
        "lesson-grid": props => {
            return {
                marginTop: theme.spacing(1),
                ...adaptedSize(["xs", "sm", "md"], props.ratio)
            }
        }
    }
});

export function Description(props) {
    const {children} = props
    return <Typography variant="caption" color="textSecondary">{children}</Typography>
}

export function SelectItem(props) {
    return <Typography variant="body2">{props.item.heading}</Typography>
}

export function GreatInfo(props) {
    const {children} = props
    return <Typography component="span" variant="subtitle2" color="primary">{children}</Typography>
}

export function ItemCardHeader(props) {
    const {title, action} = props
    return (
        <CardHeader title={title}
                    titleTypographyProps={{component: "h2", variant: "subtitle2"}}
                    action={action}/>
    )
}

export function Lesson(props) {

    const {children, ratio, title, desc} = props

    return (
        <LessonBox>
            <LessonHeader title={title} desc={desc}/>
            <AppBox ratio={ratio}>
                {children}
            </AppBox>
        </LessonBox>
    )
}

export function LessonHeader(props) {

    const {title, desc} = props
    const classes = useStyles();

    return (
        <Box className={classes.lessonHeaderBox} component="h1">
            <Typography component="span" variant="h5" color="textSecondary">{title}<br/></Typography>
            <Typography component="span" variant="h6" color="textPrimary">{desc}</Typography>
        </Box>
    )
}

export function TypeLessonHeader(props) {

    const classes = useStyles();
    const {children, desc, subtitle} = props

    return (
        <Box component="h1" className={classes.typeLessonHeader}>
            <Typography className={classes.typeLessonHeaderTitle}
                        component="span"
                        variant="h5">{children}
            </Typography>
            {subtitle &&
            <Typography className={classes.typeLessonHeaderSubtitle}
                        component="span"
                        variant="subtitle1"
                        color="textSecondary">
                {subtitle}
            </Typography>}
            {desc &&
            <HelpPopover>{desc}</HelpPopover>}
        </Box>
    )
}

export function LessonBox(props) {

    const classes = useStyles();
    const {children, ...rest} = props

    return (
        <AppBox {...rest}>
            <Grid className={classes.lessonBox} container direction="column" alignItems="flex-start" item>
                {children}
            </Grid>
        </AppBox>
    )
}

export function AppBox(props) {

    const {leftMenuOpen, ratio, children} = props
    const classes = useStyles({ratio});
    const className = leftMenuOpen ? classes.appBoxSizeWithLeftMenu : classes.appBoxSizeWithoutLeftMenu

    return <Box className={className}>{children}</Box>
}

export function LessonGrid({ratio, ...rest}) {
    const classes = useStyles({ratio})
    return <Grid className={classes["lesson-grid"]} container {...rest}/>
}