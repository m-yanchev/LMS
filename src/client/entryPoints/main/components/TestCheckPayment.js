//@flow
import React, {useEffect, useState} from "react";
import type {Node} from "react";
import {
    ActiveServiceDialog, CancelButton,
    FormDialog,
    InputDialog
} from "../../../../depricated/common/components/Dialog";
import {IconButtonWithTooltip, PaymentButton} from "../../../../depricated/common/components/ButtonWithTooltip";
import type {UserModeProps} from "../../../../depricated/common/components/UserMode";
import {Informer} from "../../../../depricated/common/components/Informer";
import {Box, Button, Typography} from "@material-ui/core";
import ActiveService from "../../../../depricated/common/logic/ActiveService";
import EmailInput from "../../../../depricated/common/components/EmailInput";
import BackdropSpinner from "../../../../depricated/common/components/BackDropSpinner";
import Loader from "../../../../depricated/WebClient/Loader";
import AddAPhotoOutlinedIcon from "@material-ui/icons/AddAPhotoOutlined";
import type {InformerMessage} from "../../../../depricated/common/components/Informer";
import Profile from "../../../../depricated/common/logic/Profile";
import {makeStyles} from "@material-ui/core/styles";
import AddFilesButton from "../../../../depricated/common/components/AddFilesButton";
import NumberField from "../../../../depricated/common/components/NumberField";

export type TestCheckPaymentButtonProps = {
    userModeProps: UserModeProps,
    testId: string
}

export type SolutionSendingButtonProps = {
    userModeProps: UserModeProps,
    testId: string,
    testHeading: string,
}

type TestCheckPaymentDialogWithActiveServiceProps = {
    id: string,
    activeService: ActiveService
} & TestCheckPaymentDialogProps

type SolutionSendingDialogWithActiveServiceProps = { activeService: ActiveService } & SolutionSendingDialogProps

type SolutionSendingDialogProps = {
    id: string,
    heading: string,
    profile: Profile,
    open: boolean,
    onClose: (void) => void,
    onMessage: (message: InformerMessage) => void,
}

const TEST_CHECK_PAYMENT_AUTH_MESSAGE = "Для возможности покупки проверок работ учителем Вам нужно войти на сайт"
const SOLUTION_SENDING_AUTH_MESSAGE = "Для возможности отправки работы на проверку Вам нужно войти на сайт"
const TEST_CHECK_PRICE = 50
const TEST_CHECK_PAYMENT_SERVICE_NAME = "testCheck"
const PAYMENT_ERROR_MESSAGE = "Извините, из за ошибки в системе не получилось произвести оплату. Попробуйте " +
    "повторить позже."
const SOLUTION_SENDING_SERVICE_NAME = "solutionSending"
const ERROR_TITLE = "Ошибка"
const DEFAULT_NUMBER_OF_TEST_CHECKS = 1

const useStyles = makeStyles((theme) => ({
    form: {
        margin: theme.spacing(2),
    },
    formButton: {
        marginTop: theme.spacing(2)
    },
    solutionsInput: {
        marginTop: theme.spacing(4)
    },
    solutionsInputFiles: {
        margin: theme.spacing(2, 0, 0, 1)
    },
    solutionsInputFile: {
        marginTop: theme.spacing(1)
    },
    solutionsInputFileName: {
        marginRight: theme.spacing(3)
    }
}))

export function TestCheckPaymentForm(): Node {

    const classes = useStyles()
    const [messageOpen, setMessageOpen] = useState<boolean>(false)
    const desc = `Стоимость одной проверки ${TEST_CHECK_PRICE} рублей. Проверка отправленной работы осуществляется ` +
        `в течение суток после оплаты. Вы можете приобрести сразу несколько проверок, которые будут автоматически ` +
        `учитываться после отправки на проверку последующих работ. Количество оплаченных проверок, а также статус ` +
        `отправленных работ Вы можете контролировать в своем профиле в разделе "Дневник".`
    let numberOfTestChecks: number | null = DEFAULT_NUMBER_OF_TEST_CHECKS

    return <>
        <Box className={classes.form}>
            <Typography variant="body1">{desc}</Typography>
            <NumberOfTestChecksInputField onConfirm={handleConfirm}
                                          onChange={handleChange}/>
            <Button className={classes.formButton} color="primary" variant="outlined" onClick={handleConfirm}>
                {"Купить"}
            </Button>
        </Box>
        <Informer message={messageOpen && {desc: PAYMENT_ERROR_MESSAGE, title: ERROR_TITLE}}
                  onClose={() => setMessageOpen(false)}/>
    </>

    function handleConfirm(): void {
    }

    function handleChange(value): void {
        numberOfTestChecks = value
    }
}

export function TestCheckPaymentButton(props: TestCheckPaymentButtonProps) {

    const {userModeProps, testId} = props
    const {onAuth, activeService} = userModeProps
    const [view: "payment" | "base" | "error", setView] = useState("base")

    return <>
        <PaymentButton onClick={handlePayment}/>
        <TestCheckPaymentDialogWithActiveService open={view === "payment"}
                                                 id={testId}
                                                 activeService={activeService}
                                                 onClose={handleClose}
                                                 onError={handleError}/>
        <Informer message={view === "error" && {desc: PAYMENT_ERROR_MESSAGE, title: ERROR_TITLE}}
                  onClose={handleClose}/>
    </>

    function handleError(): void {
        setView("error")
    }

    function handlePayment(): void {
        onAuth({
            callback: () => setView("payment"),
            activeService: {name: TEST_CHECK_PAYMENT_SERVICE_NAME, id: testId},
            message: TEST_CHECK_PAYMENT_AUTH_MESSAGE
        })
    }

    function handleClose(): void {
        setView("base")
    }
}

export function SolutionSendingButton(props: SolutionSendingButtonProps) {

    const {userModeProps, testId, testHeading} = props
    const {onAuth, activeService, profile} = userModeProps
    const [openDialog: boolean, setOpenDialog] = useState<boolean>(false)
    const [message: ?InformerMessage, setMessage] = useState<?InformerMessage>(null)
    return <>
        <Button onClick={handleSend}/>
        <SolutionSendingWithActiveService activeService={activeService}
                                          open={openDialog}
                                          id={testId}
                                          heading={testHeading}
                                          profile={profile}
                                          onClose={handleClose}
                                          onMessage={handleMessage}/>
        <Informer message={message} onClose={handleClose}/>
    </>

    function handleSend() {
        onAuth({
            callback: () => setOpenDialog(true),
            activeService: {name: SOLUTION_SENDING_SERVICE_NAME, testId},
            message: SOLUTION_SENDING_AUTH_MESSAGE
        })
    }

    function handleMessage(message: InformerMessage): void {
        setMessage(message)
    }

    function handleClose(): void {
        setOpenDialog(false)
        setMessage(null)
    }

    function Button(props: { onClick: (void) => void }) {
        return (
            <IconButtonWithTooltip desc="Отправить работу на проверку"
                                   color="primary"
                                   onClick={props.onClick}>
                <AddAPhotoOutlinedIcon/>
            </IconButtonWithTooltip>
        )
    }
}

function TestCheckPaymentDialogWithActiveService(props: TestCheckPaymentDialogWithActiveServiceProps) {
    return <ActiveServiceDialog WrappedDialog={TestCheckPaymentDialog}
                                service={TEST_CHECK_PAYMENT_SERVICE_NAME}
                                open={props.open}
                                id={props.id}
                                activeService={props.activeService}
                                onClose={props.onClose}
                                onError={props.onError}/>
}

function SolutionSendingWithActiveService(props: SolutionSendingDialogWithActiveServiceProps) {
    return <ActiveServiceDialog WrappedDialog={SolutionSendingDialog}
                                service={SOLUTION_SENDING_SERVICE_NAME}
                                open={props.open}
                                id={props.id}
                                activeService={props.activeService}
                                heading={props.heading}
                                profile={props.profile}
                                onClose={props.onClose}
                                onMessage={props.onMessage}/>
}

function SolutionSendingDialog(props) {

    type Views = "none" | "base" | "backdrop-spinner" | "check-not-paid" | "test-check-payment"
    const {id, heading, open, onClose, profile, onMessage} = props
    let email = profile.email || ""
    const initView = open => open ? "base" : "none"
    const [view, setView] = useState<Views>(initView(open))
    const informerMessages = {
        "check-paid": {desc: "Отправка работы на проверку выполнена удачно. Результаты проверки будут отправлены на указанный адрес электронной почты в течении суток."},
        "failed-saved": {desc: "Извините, не получилось отправить работу на проверку. Попробуйте повторить позже."}
    }
    const message = "Сделайте хорошо читаемые фото Ваших решений. Отправьте фото решений одним или несколькоми" +
        " файлами. Результаты проверки будут отправленны на электронную почту";

    useEffect(() => {
        setView(initView(open))
    }, [open])

    return <>
        <FormDialog open={view === "base"}
                    onClose={handleClose}
                    title={'Отправка учителю: "' + heading + '"'}
                    message={message}
                    actions={<CancelButton onClick={onClose}/>}>
            <EmailInput defaultValue={email}
                        onChange={handleEmail}
                        onClose={handleClose}
                        onConfirm={handleSend}/>
            <AddFilesButton onSubmit={handleSend}/>
        </FormDialog>
        <BackdropSpinner open={view === "backdrop-spinner"}/>
        <CheckNotPaidDialog/>
        <TestCheckPaymentDialog open={view === "test-check-payment"} onClose={handleClose} onError={handleError}/>
    </>

    function CheckNotPaidDialog() {
        const message = "Отправка работы на проверку выполнена удачно, чтобы работа была проверена Вам необходимо " +
            "купить проверку."
        return (
            <InputDialog open={view === "check-not-paid"}
                         message={message}
                         onClose={handleClose}
                         onConfirm={handlePayment}
                         confirmTitle="Купить"/>
        )
    }

    function handleError(): void {
        onMessage({title: ERROR_TITLE, desc: PAYMENT_ERROR_MESSAGE})
    }

    function handlePayment(): void {
        setView("test-check-payment")
    }

    function handleClose() {
        setView("none")
        onClose()
    }

    async function handleSend(files) {
        try {
            if (email) {
                const status = (await sendSolutionsToCheck({files, email}))["insertSolutions"]
                if (status === "paid") {
                    onMessage(informerMessages["check-paid"])
                } else {
                    setView("check-not-paid")
                }
            }
        } catch (e) {
            console.error(e)
            setView("none")
            onMessage(informerMessages["failed-saved"])
        }
    }

    function handleEmail(value) {
        email = value
    }

    function sendSolutionsToCheck({files, email}) {
        setView("backdrop-spinner")
        const query = `mutation InsertSolutions($testId: ID!, $email: String!) {
                        insertSolutions(testId: $testId, email: $email)
                    }`
        const args = {testId: id, email}
        return Loader.requestBySchema({query, args, files})
    }
}

type TestCheckPaymentDialogProps = {
    open: boolean,
    onClose: (void) => void,
    onError: (void) => void,
}

function TestCheckPaymentDialog(props: TestCheckPaymentDialogProps): Node {
    const {onClose, onError, open} = props
    const message = `Стоимость одной проверки ${TEST_CHECK_PRICE} рублей. Проверка отправленной работы осуществляется ` +
        `в течение суток после оплаты. Вы можете приобрести сразу несколько проверок, которые будут автоматически ` +
        `учитываться после отправки на проверку последующих работ. Количество оплаченных проверок, а также статус ` +
        `отправленных работ Вы можете контролировать в своем профиле в разделе "Дневник".`
    let numberOfTestChecks: number | null = DEFAULT_NUMBER_OF_TEST_CHECKS

    return (
        <InputDialog open={open}
                     message={message}
                     confirmTitle="Оплатить"
                     onClose={onClose}
                     onConfirm={handleConfirm}>
            <NumberOfTestChecksInputField onChange={handleChange}
                                          onClose={onClose}
                                          onConfirm={handleConfirm}/>
        </InputDialog>
    )

    function handleConfirm(): void {
    }

    function handleChange(value: number | null): void {
        numberOfTestChecks = value
    }
}

export type NumberOfTestChecksInputFieldProps = {
    onClose?: void => void,
    onChange: (number | null) => void,
    onConfirm: void => void
}

export function NumberOfTestChecksInputField(props: NumberOfTestChecksInputFieldProps) {

    const {onClose, onConfirm, onChange} = props
    const [amountValue, setAmountValue] = useState<number>(DEFAULT_NUMBER_OF_TEST_CHECKS * TEST_CHECK_PRICE)

    return <>
        <NumberField onClose={handleClose}
                     onConfirm={onConfirm}
                     onChange={handleChange}
                     defaultValue={DEFAULT_NUMBER_OF_TEST_CHECKS}
                     autoFocus
                     label="Количество проверок"
                     errorMessage="Количество проверок должно быть целым числом большим нуля"
                     min={1}
                     required/>
        <Typography variant="body1">{`Всего: ${amountValue} руб.`}</Typography>
    </>

    function handleClose(): void {
        if (onClose) onClose()
    }

    function handleChange(value: number | null): void {
        if (value) {
            setAmountValue(value * TEST_CHECK_PRICE)
        }
        onChange(value)
    }
}