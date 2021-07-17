import React, {useEffect, useState} from 'react'
import {CircularProgress} from "@material-ui/core";
import Loader from "../../WebClient/Loader";
import Failure from "../../../client/entryPoints/main/components/common/Failure";
import BackdropSpinner from "./BackDropSpinner";
import {Informer} from "./Informer";
import {ERROR_MESSAGE_P1, ERROR_MESSAGE_P2, ERROR_TITLE} from "../constants";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    "circular-progress": {
        margin: theme.spacing(2, 0)
    }
}))

export function BackDropDataRequest(props) {

    const {onClose, ...rest} = props
    const errorMessage = {
        title: ERROR_TITLE,
        desc: ERROR_MESSAGE_P1 + "\n" + ERROR_MESSAGE_P2
    }
    const FailInform = () =>
        <Informer message={errorMessage} onClose={onClose}/>
    const BackDropSpinner = () =>
        <BackdropSpinner open/>

    return <DataRequestComponent {...rest} options={{WaitingComponent: BackDropSpinner, FailComponent: FailInform}}/>
}

export function DataRequestComponent(props) {

    const {WrappedComponent, args, query, options, onFail, ...rest} = props
    const body = Loader.makeBody({args, query})
    const [content, setContent] = useState()
    const [error, setError] = useState(false)
    const classes = useStyles()

    useEffect(() => {
        let isInstance = true;
        Loader.request(body).then(response => {
            if (isInstance) {
                setContent(response["data"])
            }
        }).catch(e => {
            handleError(e)
        })
        return () => isInstance = false
    }, [args, query])

    return (<>
        {content !== undefined ?
            <WrappedComponent content={content} {...rest}/> :
            error ?
                <FailComponent status={error}/> :
                <WaitingComponent/>}</>)

    function WaitingComponent() {
        const {WaitingComponent} = options || {}
        return <>
            {WaitingComponent ?
                <WaitingComponent/> :
                <CircularProgress className={classes["circular-progress"]}/>}
        </>
    }

    function FailComponent(props) {
        const {FailComponent} = options || {}
        return <>{FailComponent ? <FailComponent {...props}/> : <Failure {...props}/>}</>
    }

    function handleError(e) {
        if (onFail) {
            onFail(e)
        } else {
            setError(true)
        }
    }
}
