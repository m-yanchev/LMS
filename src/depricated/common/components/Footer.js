//@flow
import React from "react"
import type {Element} from "react"
import {Box, Grid, Link, Typography} from "@material-ui/core";
import {TEACHER} from "../constants";
import {makeStyles} from "@material-ui/core/styles";
import VKLink from "./VKLink";

const useStyles = makeStyles(theme => ({
    footer: {
        backgroundImage: "url(/images/footerBackground.png)",
        padding: theme.spacing(2),
        color: "black",
        [theme.breakpoints.up('md')]: {
            justifyContent: "space-around"
        },
        [theme.breakpoints.down('sm')]: {
            justifyContent: "space-between"
        },
    },
    vkLink: {
        margin: "0 20px"
    }
}))

function Footer(): Element<typeof Grid> {

    const classes = useStyles()

    return (
        <Grid className={classes.footer} container>
            <Details/>
            <VKLink className={classes.vkLink}/>
            <TermLink/>
        </Grid>
    )

    function Details() {
        return (
            <Box>
                <Typography variant="body2" color="inherit" component="p">{TEACHER.name}</Typography>
                <Typography variant="body2" color="inherit" component="p">{TEACHER.phone}</Typography>
                <Typography variant="body2" color="inherit" component="p">{TEACHER.email}</Typography>
                <Typography variant="body2" color="inherit" component="p">{TEACHER.skype}</Typography>
            </Box>
        )
    }

    function TermLink() {
        const href = "/term"
        return <Link color="inherit" href={href}>Пользовательское соглашение</Link>
    }
}

export default Footer