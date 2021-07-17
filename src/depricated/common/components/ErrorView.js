import React from "react";
import {makeStyles} from '@material-ui/core/styles';
import {Grid, Typography, Box, Link, CssBaseline} from "@material-ui/core";
import {ERROR_MESSAGE_P1, ERROR_MESSAGE_P2, ERROR_TITLE} from "../constants";

const useStyles = makeStyles(theme => ({
    "root-grid": {
        width: "100%",
        height: "100%",
        padding: theme.spacing(4, 2)
    },
    "text-box": {
        maxWidth: theme.spacing(100)
    },
    "body-text": {
        margin: theme.spacing(2, 0)
    },
    "title-text": {
        margin: theme.spacing(3, 0)
    }
}))

export default function ErrorView({status}) {

    const classes = useStyles()

    return <>
        <CssBaseline/>
        <Grid className={classes["root-grid"]} container justify="center" alignItems="center">
            <Box className={classes["text-box"]}>
                {status === 404 ? <>
                        <TitleText>
                            {"Страница с этим адресом не найдена :("}
                        </TitleText>
                        <BodyText>
                            {"Попробуйте начать посещение сайта с "}
                            <Link href={'/'}>главной страницы</Link>
                        </BodyText></>
                    : <>
                        <TitleText>{ERROR_TITLE}</TitleText>
                        <BodyText>{ERROR_MESSAGE_P1}</BodyText>
                        <BodyText>{ERROR_MESSAGE_P2}</BodyText>
                    </>}
            </Box>
        </Grid>
    </>

    function BodyText(props) {
        return (
            <Typography className={classes["body-text"]} variant="body1" color="textSecondary" {...props}/>
        )
    }

    function TitleText(props) {
        return (
            <Typography className={classes["title-text"]} variant="h6" {...props}/>
        )
    }
}