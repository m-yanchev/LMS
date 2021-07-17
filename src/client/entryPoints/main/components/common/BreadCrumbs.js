import React from 'react'
import {Link} from "@material-ui/core";
import BreadCrumbsMaterialUI from "@material-ui/core/Breadcrumbs";
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: {
        marginLeft: theme.spacing(1),
        marginTop: 23,
        flexGrow: 1,
        height: 24,
        display: "flex",
        overflow: "hidden"
    },
    link: {
        overflow: "hidden"
    }
}));

export default function BreadCrumbs(props) {

    const classes = useStyles();

    let path = "/"
    const items = (props.items || []).map(item => {
        path = path + item.alias + "/"
        return {path, title: item.heading}
    })

    return (
            <BreadCrumbsMaterialUI className={classes.root} aria-label="breadcrumb">
                {items.map(item => (
                    <BreadCrumb key={item.path} href={item.path}>{item.title}</BreadCrumb>
                ))}
            </BreadCrumbsMaterialUI>
    )

    function BreadCrumb(props) {
        return <Link color="textSecondary" href={props.href}>{props.children}</Link>
    }
}