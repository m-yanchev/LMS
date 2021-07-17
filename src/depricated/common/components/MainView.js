import React, {useState} from 'react'
import {Grid, List, ListItemIcon, ListItemText, Paper, IconButton, Divider, ListItem} from '@material-ui/core'
import AssessmentIcon from '@material-ui/icons/Assessment';
import {makeStyles} from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import BreadCrumbs from "../../../client/entryPoints/main/components/common/BreadCrumbs";
import {EditorShell, EditableMenuList} from "../../../client/entryPoints/main/components/editable/EditableLists";
import {HeadingsData} from "../../../client/entryPoints/main/components/editable/EditableItems";
import MainContainer from "./MainContainer";
import MainTemplate from "./MainTemplate";
import Body from "./Body";
import {Journal} from "./Journal";

const useStyles = makeStyles((theme) => ({
    mainGrid: {
        height: "100%",
        overflow: "hidden"
    },
    burger: {
        marginLeft: 5,
        marginTop: 8,
        [theme.breakpoints.up("md")]: {
            marginRight: theme.spacing(2)
        },
        [theme.breakpoints.down("sm")]: {
            marginRight: theme.spacing(1)
        },
        [theme.breakpoints.down("xs")]: {
            marginRight: theme.spacing(0)
        },
    },
    leftMenuPaper: {
        height: "100%"
    },
    containerRoot: {
        padding: 0
    },
    container: {
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(3, 1),
        },
        [theme.breakpoints.up('md')]: {
            padding: theme.spacing(6, 8),
        }
    }
}))

const widthContainerGrid = {
    xs: 12,
    sm: 8,
    md: 9,
    lg: 10,
    xl: 11
}

export default function MainView(WrappedComponent) {

    return props => <MainViewComponent WrappedComponent={WrappedComponent}
                                       {...props}/>;
}

function MainViewComponent(props) {

    const {WrappedComponent, ...rest} = props
    const [isLeftVisible, setIsLeftVisible] = useState(true)
    const [journalOpened, setJournalOpened] = useState(false)
    const isCategoryView = Boolean(props.content && props.content.isCategoryView)
    const leftMenuOpen = isCategoryView && isLeftVisible
    const leftTopPanel = <Burger visible={isCategoryView} onClick={() => handleClick({name: "burger"})}/>;

    return <>
        <MainTemplate fullWidth
                      leftChildren={leftTopPanel}
                      centerChildren={<BreadCrumbs items={props.content && props.content.breadCrumbs}/>}
                      profile={props.userModeProps.profile}
                      onClick={handleClick}>
            <Body>
                <LeftMenu {...rest}
                          open={leftMenuOpen}
                          onClick={handleClick}/>
                <ContentContainer leftMenuOpen={leftMenuOpen}>
                    <WrappedComponent leftMenuOpen={leftMenuOpen} {...rest}/>
                </ContentContainer>
            </Body>
        </MainTemplate>
        <Journal open={journalOpened}
                 onClose={() => setJournalOpened(false)}
                 profile={props.userModeProps.profile}/>
    </>

    function handleClick(event) {
        switch (event.name) {
            case 'burger':
                setIsLeftVisible(!isLeftVisible)
                break;
            case 'journal':
                setJournalOpened(true)
                break;
            default:
                props.userModeProps.onClick(event);
        }
    }
}

function Burger(props) {

    const classes = useStyles();

    return <>{props.visible ?
        <IconButton
            className={classes.burger}
            edge="start"
            color="default"
            onClick={props.onClick}>
            <MenuIcon/>
        </IconButton>
        : undefined}</>
}

function LeftMenu(props) {
    try {
        const classes = useStyles();
        const {open, content, userModeProps, onClick, ...rest} = props
        const width = {
            xs: restWidth(widthContainerGrid.xs),
            sm: restWidth(widthContainerGrid.sm),
            md: restWidth(widthContainerGrid.md),
            lg: restWidth(widthContainerGrid.lg),
            xl: restWidth(widthContainerGrid.xl),
        }

        return (<>{open &&
        <Grid item {...width}>
            <Paper className={classes.leftMenuPaper}>
                <EditorShell EditingComponent={EditableMenuList}
                             contentData={new HeadingsData({
                                 items: content.categories,
                                 rootId: content.categoryId
                             })}
                             userModeProps={userModeProps}
                             {...rest}/>
                {userModeProps.profile.isStudentAccess && <>
                    <Divider/>
                    <List>
                        <ListItem button onClick={handleCallJournal}>
                            <ListItemIcon><AssessmentIcon/></ListItemIcon>
                            <ListItemText>Дневник</ListItemText>
                        </ListItem>
                    </List></>}
            </Paper>
        </Grid>}</>)

        function handleCallJournal() {
            onClick({name: "journal"})
        }

        function restWidth(width) {
            return width < 12 ? 12 - width : 12
        }
    } catch (e) {
        console.error(e)
        throw e
    }
}

function ContentContainer(props) {

    const width = props.leftMenuOpen ? {item: true, ...widthContainerGrid} : {}
    const classes = useStyles()

    return (
        <Grid className={classes.containerRoot} container {...width}>
            <MainContainer className={classes.container}>
                {props.children}
            </MainContainer>
        </Grid>
    )
}

