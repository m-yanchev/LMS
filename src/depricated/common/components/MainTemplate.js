import React, {useEffect, useRef, useState} from 'react';
import {AppBar, Slide, Box, Toolbar, SvgIcon, Typography, Grid, Hidden} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import MainLink from "./MainLink";
import Profile from "./Profile";
import VKLink from "./VKLink";
import Footer from "./Footer";

const useStyles = makeStyles(theme => {

    const width = full => full ?
        {
            width: "100%"
        } : {
            [theme.breakpoints.down(1170)]: {
                width: "100%"
            },
            [theme.breakpoints.up(1170)]: {
                width: 1170
            }
        }

    return {
        root: {
            position: "fixed",
            height: "100%",
            width: "100%",
            overflowY: "scroll"
        },
        topPanel: {
            overflow: "hidden",
            height: 75,
            backgroundColor: "transparent",
            backgroundImage: "url(/images/appBarBackground.png)",
            backgroundSize: "100% 100%",
            alignItems: "center"
        },
        toolbar: props => ({
            alignItems: "flex-start",
            padding: "0 15px",
            ...width(props.fullWidth)
        }),
        vkLink: {
            margin: "22px 44px 0 0"
        },
        empty: {
            flexGrow: 1
        },
        phone: {
            width: 164,
            margin: "22px 27px 0 0",
            overflow: "hidden"
        },
        phoneNumber: {
            margin: "2px 0 0 5px",
            height: 23,
            color: theme.palette.primary.dark,
            ...theme.typography.barFont
        },
        body: {
            top: 67,
            position: "absolute",
            zIndex: 100,
            width: "100%"
        },
        content: props => ({
            ...width(props.fullWidth)
        })
    }
})

function HideOnScroll(props) {
    const {children, targetRef} = props
    const [target, setTarget] = useState()
    const trigger = useScrollTrigger({target})

    useEffect(() => {
        setTarget(targetRef.current)
    }, [])

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

function MainTemplate(props) {

    const {children, leftChildren, centerChildren, profile, onClick, fullWidth} = props
    const classes = useStyles({fullWidth});
    const ref = useRef()

    return <Box ref={ref} className={classes.root}>
        <HideOnScroll targetRef={ref}>
            <AppBar className={classes.topPanel} elevation={0}>
                <Toolbar className={classes.toolbar}>
                    {leftChildren}
                    <MainLink/>
                    {centerChildren}
                    <Box className={classes.empty}/>
                    <VKLink className={classes.vkLink}/>
                    <Phone className={classes.phone}/>
                    {profile && <Profile profile={profile} onClick={onClick}/>}
                </Toolbar>
            </AppBar>
        </HideOnScroll>
        <Grid className={classes.body} container justify={"center"}>
            <Grid className={classes.content}>
                {children}
            </Grid>
            <Footer/>
        </Grid>
    </Box>
}

function Phone(props) {

    const classes = useStyles();

    return <Hidden smDown>
        <Grid {...props} container wrap="nowrap">
            <SvgIcon viewBox="0 0 18 18" width="18pt" height="18pt">
                <defs>
                    <clipPath id={"_clipPath_BzsSsArvcnFlR5PGz1altajkDOirMogH"}>
                        <rect width="18" height="18"/>
                    </clipPath>
                </defs>
                <g>
                    <path
                        fill="#05C443"
                        d="M 3.15 0 L 14.85 0 C 16.589 0 18 1.411 18 3.15 L 18 14.85 C 18 16.589 16.589 18 14.85 18 L 3.15 18 C 1.411 18 0 16.589 0 14.85 L 0 3.15 C 0 1.411 1.411 0 3.15 0 Z"/>
                    <path
                        d=" M 7.712 6.013 L 8.274 7.54 C 8.302 7.61 8.291 7.689 8.246 7.748 C 8.126 7.924 7.986 8.085 7.83 8.229 C 7.736 8.303 7.716 8.438 7.785 8.536 C 8.131 9 9.028 10.125 10.195 10.527 C 10.288 10.558 10.389 10.525 10.446 10.446 L 10.913 9.824 C 10.978 9.737 11.097 9.71 11.194 9.759 L 12.656 10.491 C 12.762 10.54 12.811 10.663 12.769 10.772 C 12.608 11.228 12.105 12.338 11.028 12.158 C 9.619 11.942 8.338 11.219 7.425 10.125 C 6.542 9.022 4.798 6.188 7.478 5.867 C 7.58 5.857 7.676 5.917 7.712 6.013 Z "
                        fill="rgb(255,255,255)"/>
                    <path
                        d=" M 9.45 15.413 C 8.273 15.414 7.116 15.111 6.092 14.532 L 2.717 15.398 L 3.957 12.611 C 3.207 11.557 2.807 10.294 2.813 9 C 2.813 5.465 5.791 2.588 9.45 2.588 C 13.109 2.588 16.088 5.465 16.088 9 C 16.088 12.535 13.109 15.413 9.45 15.413 Z  M 6.269 13.323 L 6.474 13.449 C 7.369 14.001 8.399 14.294 9.45 14.293 C 12.49 14.293 14.963 11.922 14.963 9.006 C 14.963 6.089 12.49 3.713 9.45 3.713 C 6.41 3.713 3.938 6.083 3.938 9 C 3.939 10.16 4.336 11.285 5.062 12.189 L 5.273 12.457 L 4.258 14.178 L 6.269 13.323 Z "
                        fill="rgb(255,255,255)"/>
                </g>
            </SvgIcon>
            <Typography className={classes.phoneNumber} component="span" noWrap>
                {"+7 919 962 81 92"}
            </Typography>
        </Grid>
    </Hidden>
}

export default MainTemplate