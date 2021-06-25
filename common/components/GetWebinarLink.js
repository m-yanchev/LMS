//@flow
import React, {Fragment, useState} from "react"
import type {Element} from "react"
import {ButtonWithTooltip} from "./ButtonWithTooltip";
import Webinar from "../../rules/Webinar";
import Profile from "../logic/Profile";
import type {FailProps} from "../FailLogLoader";
import {InformDialog} from "./Dialog";
import {Button, DialogActions, DialogContentText, Link} from "@material-ui/core";
import {PaymentScript} from "../../ReactApp/smartComponents/Payment";
import type {PaymentFormProps, ServicePaymentScriptProps} from "../../ReactApp/smartComponents/Payment";
import Payment from "../logic/Payment";

type GetWebinarLinkButtonProps = {
    webinar: Webinar,
    onAccess: void => void,
    onFail: FailProps => void
}

export function GetWebinarLinkButton(props: GetWebinarLinkButtonProps): Element<typeof Fragment> {

    const {webinar, onAccess, onFail} = props
    const [openDialog, setOpenDialog] = useState<boolean>(false)

    return <>
        <ButtonWithTooltip desc={"Получить ссылку на вебинар"}
                           variant={"text"}
                           color="secondary"
                           onClick={handleClick}>
            {"Получить ссылку"}
        </ButtonWithTooltip>
        <GetWebinarLinkDialog open={openDialog}
                              webinar={webinar}
                              onClose={handleClose}/>
    </>

    async function handleClick() {
        try {
            if (await Profile.loadIsWebinarAvailable(webinar.id)) {
                setOpenDialog(true)
            } else {
                onAccess()
            }
        } catch (e) {
            console.error(e)
            onFail({e, method: "Button.handleClick"})
        }
    }

    function handleClose() {
        setOpenDialog(false)
    }
}

type GetWebinarLinkDialogProps = {
    open: boolean,
    webinar: Webinar,
    onClose: void => void
}

function GetWebinarLinkDialog(props: GetWebinarLinkDialogProps): Element<typeof InformDialog> {

    const {open, webinar, onClose} = props
    const message = 'Ссылка поможет Вам попасть в вебинарную комнату.'

    return (
        <InformDialog open={open}
                      name={"get-webinar-link"}
                      onClose={onClose}
                      title={`Ссылка на вебинар`}
                      message={message}>
            <Link href={webinar.link} variant={"subtitle1"} target={"_blank"}>{webinar.heading}</Link>
        </InformDialog>
    )
}

type WebinarPaymentScriptProps = {|
    webinarId: string,
    ...ServicePaymentScriptProps
|}

export function WebinarPaymentScript(props: WebinarPaymentScriptProps): Element<typeof PaymentScript> {

    const {webinarId, ...rest} = props

    return (
        <PaymentScript desc={'На него будут приходить напоминания и ссылка доступа в вебинарную комнату.'}
                       PaymentForm={WebinarPaymentForm}
                       {...rest}/>
    )

    function WebinarPaymentForm(props: PaymentFormProps): Element<typeof Fragment> {

        const {onConfirm} = props

        return <>
            <DialogContentText>
                {`Стоимость участия в вебинаре ${Payment.price("webinar")} рублей. После оплаты Вы получите ссылку, ` +
                `доступа в вебинарную комнату.`}
            </DialogContentText>
            <DialogActions>
                <Button color={"primary"}
                        variant={"contained"}
                        onClick={handleConfirm}>
                    {"Оплатить вебинар"}
                </Button>
            </DialogActions>
        </>

        function handleConfirm() {
            onConfirm({service: "webinar", serviceId: webinarId})
        }
    }
}