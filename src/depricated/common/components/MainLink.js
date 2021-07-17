import React from "react"
import {Link, Hidden} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    root: {
        marginTop: 11
    },
    smallLogo: {
        marginTop: 9
    }
}))

function MainLink(props) {

    const classes = useStyles()

    return (
        <Link className={classes.root} color="textSecondary" href={"/"} variant="body1" {...props}>
            <Hidden implementation={"css"} xsDown>
                <img src={"/images/logo.png"} alt="Тетрадка в клеточку"/>
            </Hidden>
            <Hidden smUp>
                <img className={classes.smallLogo} src={"/images/smallLogo.png"} alt="Тетрадка в клеточку"/>
            </Hidden>
        </Link>
    )
}

export default MainLink