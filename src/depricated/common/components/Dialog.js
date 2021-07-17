import React, {useEffect, useState} from "react";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {
    Grid, AppBar, Toolbar, Divider,
    Button, IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField, Typography,
    Slide, Tab, Tabs,
} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import EmailInput from "./EmailInput";
import Loader from "../../WebClient/Loader";
import Payment from "../../rules/Payment";

const useStyles = makeStyles((theme) => ({
    formDialogAdditionalActions: {
        marginTop: theme.spacing(2),
    },
    fullScreenDialogTitle: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    fullScreenDialogSubtitle: {
        marginLeft: theme.spacing(2),
    }
}))

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export function RegistrationDialog(props) {

    return <ActiveServiceDialog WrappedDialog={WrappedDialog} {...props}/>
    
    function WrappedDialog(props) {

        const {price, onChange, onClose, id, service, onError, defaultEmail, onBackDrop, ...rest} = props
        let email = defaultEmail || ""
        const [warning, setWarning] = useState()
        
        return (
            <InputDialog confirmTitle="Оплатить"
                         onConfirm={handleSend}
                         warningMessage={warning}
                         onClose={onClose}
                         {...rest}>
                <EmailInput defaultValue={email}
                            onChange={handleChange}
                            onClose={onClose}
                            onConfirm={handleSend}/>
            </InputDialog>
        )

        function handleChange(value) {
            email = value
            onChange()
        }

        async function handleSend() {
            try {
                if (!email) {
                    setWarning("Необходимо ввести адрес электронной почты.")
                } else {
                    await registerUser()
                    await Payment.make({price, count: 1, service})
                }
            } catch (e) {
                console.error(e)
                onError()
            }
        }

        function registerUser() {

            onBackDrop()
            const query = `mutation RegisterUserForService($parentId: ID!, $email: String!, $service: String!) {
                        registerUserForService(parentId: $parentId, email: $email, service: $service)
                    }`
            const args = {parentId: id, email, service}

            return Loader.requestBySchema({query, args})
        }
    }
}

export function ActiveServiceDialog(props) {
    
    const {id, service, activeService, open, WrappedDialog, onClose, ...rest} = props

    const isActivated = activeService.isActivated({id, name: service})
    const [openDialog, setOpenDialog] = useState(open || isActivated)

    useEffect(() => {
        setOpenDialog(open || isActivated)
    }, [open, isActivated])
    
    return <WrappedDialog id={id}
                          service={service}
                          open={openDialog}
                          onClose={handleClose}
                          onChange={handleChange}
                          {...rest}/>

    function handleClose() {
        activeService.reset()
        setOpenDialog(false)
        onClose()
    }

    function handleChange() {
        activeService.reset()
    }
}

export function FullScreenDialog(props) {

    const {open, onClose, children, itemList, onChange, title, subtitle} = props
    const classes = useStyles()
    const [value, setValue] = useState(0)

    return (
        <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <AppBar color="inherit" position="sticky">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon/>
                    </IconButton>
                    <Grid className={classes.fullScreenDialogTitle} container>
                        <Typography variant="h6" color="textPrimary">
                            {title}
                        </Typography>
                        <Typography className={classes.fullScreenDialogSubtitle} variant="h6" color="textSecondary">
                            {subtitle}
                        </Typography>
                    </Grid>
                </Toolbar>
                <Divider/>
                <Toolbar>
                    <Tabs value={value}
                          onChange={handleChange}
                          indicatorColor="primary"
                          variant="scrollable"
                          scrollButtons="auto">
                        {itemList.map((item => <Tab key={item.name} label={item.title}/>))}
                    </Tabs>
                </Toolbar>
            </AppBar>
            {children}
        </Dialog>
    )

    function handleChange(event, newValue) {
        setValue(newValue)
        onChange(newValue)
    }
}

export function InformDialog(props) {
    const {onClose, children, ...otherProps} = props;
    return (
        <FormDialog {...otherProps}
                    name="inform"
                    onClose={onClose}
                    actions={<>
                        <ConfirmButton onClick={onClose}>Понятно</ConfirmButton></>}>
            {children}
        </FormDialog>
    )
}

export function HeadingField(props) {

    const {autoFocus, onChange, value, ...otherProps} = props;
    const [heading, setHeading] = useState(value);

    return (<>
        <FormTextField {...otherProps}
                       autoFocus={autoFocus}
                       type="text"
                       value={heading}
                       label="Заголовок"
                       onChange={handleHeadingChange}/>
    </>)

    function handleHeadingChange(value) {
        setHeading(value)
        onChange(value)
    }
}

export function ItemDialog(props) {

    const {children, ...otherProps} = props

    return (
        <InputDialog {...otherProps}
                     open
                     confirmTitle="Подтвердить">
            {children}
        </InputDialog>
    )
}

export function InputDialog(props) {

    const {onConfirm, onClose, children, actions, confirmTitle, ...otherProps} = props;
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'))

    return (
        <FormDialog {...otherProps}
                    onClose={onClose}
                    additionalActions={actions}
                    fullScreen={fullScreen}
                    actions={<>
                        <CancelButton onClick={onClose}/>
                        <ConfirmButton onClick={onConfirm}>{confirmTitle}</ConfirmButton></>}>
            {children}
        </FormDialog>
    )
}

export function FormDialog(props) {

    const {title, open, name, message, warningMessage, children, onClose, actions, additionalActions, ...rest} = props;
    const classes = useStyles()

    return (
        <Dialog open={open}
                aria-labelledby={name + "-label"}
                aria-describedby={name + "-desc"}
                onClose={onClose}
                onClick={handleClick}
                {...rest}>
            <DialogTitle id={name + "-label"}>{title}</DialogTitle>
            <DialogContent dividers>
                {warningMessage &&
                <DialogContentText id={name + "-desc"} color="error">{warningMessage}</DialogContentText>}
                {message &&
                <DialogContentText id={name + "-desc"}>{message}</DialogContentText>}
                {children}
                <Grid className={classes.formDialogAdditionalActions} container justify="space-evenly">
                    {additionalActions}
                </Grid>
            </DialogContent>
            <DialogActions>
                {actions}
            </DialogActions>
        </Dialog>
    )

    function handleClick(event) {
        event.stopPropagation();
    }
}

export function ItemField(props) {

    const {onChange, value, ...otherProps} = props;
    const [valueState, setValue] = useState(value);

    return (<>
        <FormTextField {...otherProps}
                       value={valueState}
                       onChange={handleChange}/>
    </>)

    function handleChange(value) {
        setValue(value)
        onChange(value)
    }
}

export function FormTextField(props) {

    const {onConfirm, onClose, onChange, ...otherProps} = props

    return (
        <TextField {...otherProps}
                   onChange={handleChange}
                   onKeyUp={handleKeyUp}
                   variant={'outlined'}
                   fullWidth
                   margin="normal"
        />
    )

    function handleKeyUp(event) {

        if (event.key === "Enter") {
            if (onConfirm) onConfirm();
        } else if (event.key === "Escape") {
            if (onClose) onClose();
        }
    }

    function handleChange(event) {
        onChange(event.target.value);
    }
}

export function ConfirmButton(props) {

    const {children} = props;

    const handleClick = (event) => {
        event.stopPropagation()
        props.onClick(event)
    };

    return <Button variant="outlined" color="primary" onClick={handleClick}>{children}</Button>
}

export function CancelButton(props) {

    const handleClick = (event) => {
        event.stopPropagation()
        props.onClick()
    };

    return <Button variant="outlined" onClick={handleClick}>Отмена</Button>
}