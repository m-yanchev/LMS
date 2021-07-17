//@flow
import React, {useState, Fragment} from "react"
import {Profile} from "../../../depricated/rules/Profile";
import type {Element} from "react";
import {InformDialog, InputDialog} from "../../../depricated/common/components/Dialog";
import EmailInput from "../../../depricated/common/components/EmailInput";
import type {FailProps} from "../../../depricated/common/FailLogLoader";

type EmailCheckInDialogProps = {
    open: boolean,
    message: string,
    setProfile: Profile => void,
    onClose: void => void,
    onFail: FailProps => void,
    onPending: boolean => void
}

type View = "inputDialog" | "failDialog"

export default function EmailCheckInDialog(props: EmailCheckInDialogProps): Element<typeof Fragment> {

    const {open, message, setProfile, onClose, onFail, onPending} = props
    const [view, setView] = useState<View>("inputDialog")
    const openInputDialog = view === "inputDialog" && open
    const openFailDialog = view === "failDialog" && open
    let email = null

    return <>
        <InputDialog open={openInputDialog}
                     name={"emailCheckIn"}
                     title={"Ввод адреса электронной почты"}
                     message={message}
                     confirmTitle="Подтвердить"
                     onClose={onClose}
                     onConfirm={handleConfirm}>
            <EmailInput onClose={onClose} onChange={value => handleChange(value)}/>
        </InputDialog>
        <InformDialog open={openFailDialog}
                      title={"Не получилочь!"}
                      onClose={handleClose}>
            {'Пользователь с таким адресом уже зарегистрирован в системе. Пожалуйста, выполните вход и повторите ' +
            'попытку.'}
        </InformDialog>
    </>

    async function handleConfirm(): Promise<void> {
        try {
            if (email) {
                onPending(true)
                const loggedIn = await Profile.checkIn({email, setProfile})
                if (!loggedIn) setView("failDialog")
            }
        } catch (e) {
            console.error(e)
            onFail({e, method: "PaymentDialog.EmailForResultDialog"})
        } finally {
            onPending(false)
        }
    }

    function handleChange(value: string): void {
        email = value
    }

    function handleClose(): void {
        setView("inputDialog")
        onClose()
    }
}

