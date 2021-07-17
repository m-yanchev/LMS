// @flow
import React, {useState} from "react"
import type {Element, ElementRef} from 'react'
import AuthIcon from "@material-ui/icons/PersonOutlineOutlined";
import {Typography, Button, IconButton, Popover} from "@material-ui/core";
import {SelectMenu} from "./SelectMenu";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import {makeStyles} from "@material-ui/core/styles";
import Profile from "../logic/Profile";

const useStyles = makeStyles(theme => ({
    profileButton: {
        margin: "18px 5px 0 0",
        overflow: "hidden",
        [theme.breakpoints.up('md')]: {
            maxWidth: 350
        },
        [theme.breakpoints.down('md')]: {
            maxWidth: 115
        },
        [theme.breakpoints.down('xs')]: {
            maxWidth: 75
        }
    },
    profileName: {
        color: theme.palette.primary.dark,
        ...theme.typography.barFont
    },
    icon: {
        margin: "10px 5px 0 0",
    }
}))

type Handle = (Event) => void
type ProfileProps = { profile: Profile, onClick: Handle, edge?: string }
type ProfileMenuProps = { profile: Profile, onClick: Handle }
type ProfileButtonProps = { children: string, onClick: Handle, anchorRef: ?ElementRef<typeof Popover> }
type ProfileButtonType = (props: ProfileButtonProps) => Element<typeof ProfileButton>
type Event = { name: string }

function ProfileComponent(props: ProfileProps) {

    const {onClick, profile, edge} = props
    const classes = useStyles()

    return <>
        {!profile.isStudentAccess ?
            <IconButton id="auth" className={classes.icon} edge={edge} onClick={() => onClick({name: "auth"})}>
                <AuthIcon/>
            </IconButton> :
            <ProfileMenu onClick={onClick} profile={profile}/>
        }
    </>
}

function ProfileMenu(props: ProfileMenuProps) {

    const {onClick, profile} = props
    const [isEditMode: boolean, SetIsEditMode] = useState(false)
    const MainButton: ProfileButtonType = props => <ProfileButton {...props}>{profile.name}</ProfileButton>
    const itemList = [{
        name: "journal", title: "Дневник"
    }, {
        name: "profile-update", title: "Редактировать профиль"
    }, {
        name: "password-update", title: "Изменить пароль"
    }, {
        name: "logout", title: "Выйти"
    }]
    if (profile.isTeacherAccess) {
        itemList.push(isEditMode ? {name: "edit-off", title: "Отключить режим редактирования"} :
            {name: "edit-on", title: "Включить режим редактирования"})
    }

    return <SelectMenu MainButton={MainButton} itemList={itemList} onClick={handleClick}/>

    function handleClick({name}: Event): void {
        switch (name) {
            case 'edit-on':
                SetIsEditMode(true);
                break;
            case 'edit-off':
                SetIsEditMode(false);
                break
        }
        onClick({name})
    }
}

function ProfileButton(props: ProfileButtonProps): Element<typeof Button> {

    const {children, onClick, anchorRef} = props
    const classes = useStyles()

    return (
        <Button className={classes.profileButton}
                ref={anchorRef}
                onClick={onClick}
                endIcon={<ArrowDropDownIcon/>}>
            <Typography className={classes.profileName} noWrap>{children}</Typography>
        </Button>
    )
}

export default ProfileComponent