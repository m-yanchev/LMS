//@flow
import React, {Fragment} from "react"
import type {Element} from "react";
import {Profile} from "../../../depricated/rules/Profile";
import type {FailProps} from "../../../depricated/common/FailLogLoader";
import EmailCheckInDialog from "./EmailCheckIn";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@material-ui/core";
import Payment from "../../../depricated/rules/Payment";
import {CancelButton} from "../../../depricated/common/components/Dialog";
import type {PaymentFields} from "../../../depricated/rules/Payment";

export type ServicePaymentScriptProps = {|
    open: boolean,
    returnURL: string,
    profile: Profile,
    setProfile: Profile => void,
    onClose: void => void,
    onFail: FailProps => void,
    onPending: boolean => void
|}

export type PaymentFormProps = {
    onConfirm: PaymentFields => void,
    onClose: void => void
}

type PaymentScriptProps = {|
    desc: string,
    PaymentForm: PaymentFormComponent,
    ...ServicePaymentScriptProps
|}

type PaymentFormComponent = PaymentFormProps => Element<typeof Fragment>

export function PaymentScript(props: PaymentScriptProps): Element<typeof Fragment> {

    const {open, desc, profile, setProfile, onClose, onPending, onFail, ...rest} = props
    const openPayment = open && profile.isStudentAccess
    const openEmail = open && !profile.isStudentAccess

    return <>
        <PaymentDialog open={openPayment}
                       onClose={onClose}
                       onFail={onFail}
                       onPending={onPending}
                       {...rest}/>
        <EmailCheckInDialog open={openEmail}
                            message={
                                `Введите свой адрес электронный почты. ${desc}`
                            }
                            setProfile={setProfile}
                            onClose={onClose}
                            onPending={onPending}
                            onFail={onFail}/>
    </>
}

type PaymentDialogProps = {|
    open: boolean,
    returnURL: string,
    PaymentForm: PaymentFormComponent,
    onClose: void => void,
    onFail: FailProps => void,
    onPending: boolean => void
|}

function PaymentDialog(props: PaymentDialogProps): Element<typeof Fragment> {

    const {open, returnURL, onClose, onFail, PaymentForm, onPending} = props

    return (
        <Dialog open={open}
                onClose={onClose}>
            <DialogTitle>{"Подготовка к оплате проверок решений"}</DialogTitle>
            <DialogContent dividers>
                <PaymentForm onConfirm={handleConfirm} onClose={onClose}/>
            </DialogContent>
            <DialogContent dividers>
                <DialogContentText>
                    {`Вы можете оплатить подписку. В этом случае Вам будет доступно любое количество проверок ` +
                    `самостоятельных работ, а также участие в вебинарах в течение времени действия подписки. ` +
                    `Стоимость подписки ${Payment.price("subscription")} рублей за один месяц.`}
                </DialogContentText>
                <DialogActions>
                    <Button color={"secondary"}
                            variant={"contained"}
                            onClick={() => handleConfirm({service: "subscription"})}>
                        {"Купить подписку"}
                    </Button>
                </DialogActions>
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={onClose}/>
            </DialogActions>
        </Dialog>
    )

    function handleConfirm(props: PaymentFields): void {
        onPending(true)
        Payment.send({...props, returnURL}).catch(error => {
            console.error(error)
            onFail({e: error, method: "PaymentDialog.makePayment"})
        })
    }
}