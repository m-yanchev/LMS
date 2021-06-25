import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import {Popover, Typography, Box} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    root: {
        cursor: "pointer",
        width: 24,
        height: 24,
        display: "inline-block",
        marginLeft: theme.spacing(1),
        verticalAlign: -6
    },
    popover: {
        pointerEvents: "none",
    },
    popoverContent: {
        margin: theme.spacing(1),
        maxWidth: theme.spacing(80)
    }
}))

export function HelpPopover(props) {

    const {children} = props
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handlePopoverClose = () => {
        setAnchorEl(null);
    }
    const open = Boolean(anchorEl)

    return <>
        <Box className={classes.root}
             onMouseEnter={handlePopoverOpen}
             onMouseLeave={handlePopoverClose}
             aria-owns={open ? 'mouse-over-popover' : undefined}
             aria-haspopup="true">
            <HelpOutlineIcon color="action"/>
        </Box>
        <Popover className={classes.popover}
                 id="mouse-over-popover"
                 open={open}
                 anchorEl={anchorEl}
                 anchorOrigin={{
                     vertical: 'bottom',
                     horizontal: 'left',
                 }}
                 transformOrigin={{
                     vertical: 'top',
                     horizontal: 'left',
                 }}
                 onClose={handlePopoverClose}
                 disableRestoreFocus>
            <Typography className={classes.popoverContent} variant="subtitle2">{children}</Typography>
        </Popover>
    </>
}