//@flow
import React, {Fragment, useEffect, useState} from "react"
import type {Element} from "react"
import {
    Button, Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Typography, Box, Card,
    CardHeader, CardContent, CardActions, DialogContentText, DialogActions
} from "@material-ui/core";
import {ButtonWithTooltip, IconButtonWithTooltip} from "../../common/components/ButtonWithTooltip";
import {Profile} from "../../rules/Profile";
import {CancelButton, FormDialog, InformDialog} from "../../common/components/Dialog";
import ClearIcon from "@material-ui/icons/Clear";
import {openFiles} from "../../common/files";
import NumberField from "../../common/components/NumberField";
import Payment from "../../rules/Payment";
import {makeStyles} from "@material-ui/core/styles";
import {Test} from "../../rules/Test";
import type {FailProps} from "../../common/FailLogLoader";
import {PaymentScript} from "./Payment";
import type {PaymentFormProps, ServicePaymentScriptProps} from "./Payment";
import {ErrorInformer} from "../viewComponents/ErrorInformer";
import {useDataSourceContext, useLoggerClientContext} from "./AppProvider";
import type {IAppError, Variable} from "../../rules/ErrorHandler";
import {LoggerClient} from "../../rules/LoggerClient";
import ErrorHandler from "../../rules/ErrorHandler";

const useStyles = makeStyles(theme => ({
    checkCountField: {
        marginBottom: theme.spacing(2)
    }
}))

const MODULE_NAME = "SubmitSolutions"
const SENDING_SOLUTION_ERROR = 'Возникла ошибка при попытке отправить решения. Попробуйте повторить позже.'

export type SubmitSolutionsButtonProps = {
    variant?: "outlined" | "text" | "contained",
    test?: Test,
    disabled?: boolean,
    color?: "primary" | "default",
    onClick: (boolean, ?Test) => void,
    onFail: FailProps => void
}

export function SubmitSolutionsButton(props: SubmitSolutionsButtonProps): Element<typeof Fragment> {

    const {test, variant, disabled, onFail, onClick} = props
    const [wait, setWait] = useState<boolean>(false)
    const color = props.color || "primary"
    return <>
        <Button variant={variant} disabled={disabled || wait} color={color} onClick={handleClick}>
            {"Отправить"}
        </Button>
    </>

    async function handleClick(): Promise<void> {
        try {
            setWait(true)
            onClick(await Profile.loadIsSendingSolutionsAvailable(), test)
            setWait(false)
        } catch (e) {
            console.error(e)
            onFail({e, method: "Button.handleClick"})
        }
    }
}

export type SubmitSolutionsDialogProps = {
    open: boolean,
    test: Test,
    onClose: void => void,
    onSuccess: void => void
}

export function SubmitSolutionsDialog(props: SubmitSolutionsDialogProps): Element<typeof FormDialog> {

    const {open, test, onClose, onSuccess} = props
    const [files, setFiles] = useState<Array<File>>([])
    const [sendSolution, isSendingSolutionError] = useSendSolution(test)
    const errorMessage = isSendingSolutionError ? SENDING_SOLUTION_ERROR : null

    return <>
        <FormDialog open={open}
                    name={"submit-solutions"}
                    onClose={onClose}
                    title={`Отправка решения`}
                    message={'Добавьте файлы с решениями в систему и затем нажмите кнопку "Отправить". ' +
                    'Результаты с комментариями учителя Вы получите в течение суток по электронной почте.'}
                    actions={<>
                        <CancelButton onClick={onClose}/>
                        <Button disabled={!files.length}
                                variant="outlined"
                                color={"primary"}
                                onClick={handleClick}>
                            {"Отправить"}
                        </Button>
                    </>}>
            <Card>
                <CardHeader title={test.heading}
                            titleTypographyProps={{variant: "subtitle2"}}
                            subheader={'Файлы с решениями к самостоятельной работе'}
                            subheaderTypographyProps={{variant: "subtitle2"}}/>

                <AddingForm files={files} onChange={handleChange}/>
            </Card>
        </FormDialog>
        <ErrorInformer message={errorMessage}/>
    </>

    function handleChange(files: Array<File>): void {
        setFiles(files)
    }

    async function handleClick(): Promise<void> {
        onClose()
        await sendSolution(files)
        onSuccess()
    }
}

type AddingFormProps = {
    files: Array<File>,
    onChange: Array<File> => void
}

function AddingForm(props: AddingFormProps): Element<typeof Fragment> {

    const {files, onChange} = props

    let isInstance = true;
    useEffect(() => () => {
        isInstance = false
    }, [])

    return <>
        <CardContent>
            <List>
                {files.map((file, index) => <Fragment key={file.name + index}>
                        <ListItem>
                            <ListItemText primaryTypographyProps={{variant: "body2"}}>
                                {file.name}
                            </ListItemText>
                            <ListItemSecondaryAction>
                                <IconButtonWithTooltip onClick={() => handleClearFile(index)}
                                                       size="small"
                                                       desc={"Удалить файл из списка"}>
                                    <ClearIcon/>
                                </IconButtonWithTooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider/>
                    </Fragment>
                )}
            </List>
        </CardContent>
        <CardActions>
            <ButtonWithTooltip size="small"
                               desc="Добавить фото решений для отправки"
                               color={files.length ? "default" : "primary"}
                               onClick={handleAddFiles}>
                {"Добавить"}
            </ButtonWithTooltip>
        </CardActions>
    </>

    function handleClearFile(index: number): void {
        const newFiles = files.slice()
        newFiles.splice(index, 1)
        onChange(newFiles)
    }

    function handleAddFiles(): void {

        openFiles().then(oFiles => {
            const newFiles = files.concat(toArray(oFiles))
            if (isInstance) {
                onChange(newFiles)
            }
        }).catch(error => console.error(error))

        function toArray(files) {
            const aFiles = []
            for (let i = 0; i < files.length; i++) {
                aFiles.push(files.item(i))
            }
            return aFiles
        }
    }
}

export function ChecksPaymentScript(props: ServicePaymentScriptProps): Element<typeof PaymentScript> {
    return (
        <PaymentScript desc={'На него Вы будете получать результаты проверок.'}
                       PaymentForm={ChecksPaymentForm}
                       {...props}/>
    )
}

const DEFAULT_CHECK_COUNT = 1

function ChecksPaymentForm(props: PaymentFormProps): Element<typeof Fragment> {

    const {onConfirm, onClose} = props
    let count = DEFAULT_CHECK_COUNT

    return <>
        <DialogContentText>
            {`Стоимость одной проверки ${Payment.price("checks")} рублей. Проверка отправленной ` +
            `работы осуществляется в течение суток после оплаты. Вы можете приобрести сразу несколько ` +
            `проверок, которые будут автоматически учитываться после отправки на проверку последующих работ. ` +
            `Количество оплаченных проверок, а также статус отправленных работ Вы можете контролировать в ` +
            `своем профиле в разделе "Дневник".`}
        </DialogContentText>
        <CheckCountField onChange={value => handleChange(value)}
                         onClose={onClose}
                         onConfirm={handleConfirm}/>
        <DialogActions>
            <Button color={"primary"}
                    variant={"contained"}
                    onClick={handleConfirm}>
                {"Купить проверки"}
            </Button>
        </DialogActions>
    </>

    function handleConfirm() {
        if (count) onConfirm({service: "checks", count})
    }

    function handleChange(value): void {
        count = value
    }
}

type CheckCountFieldProps = {
    onClose: void => void,
    onChange: (number | null) => void,
    onConfirm: void => void
}

function CheckCountField(props: CheckCountFieldProps): Element<typeof Box> {

    const {onClose, onConfirm, onChange} = props
    const [amountValue, setAmountValue] = useState<number>(Payment.amountValue({
        service: "checks", count: DEFAULT_CHECK_COUNT
    }))
    const classes = useStyles()

    return <Box className={classes.checkCountField}>
        <NumberField onClose={handleClose}
                     onConfirm={onConfirm}
                     onChange={handleChange}
                     defaultValue={DEFAULT_CHECK_COUNT}
                     autoFocus
                     label="Количество проверок"
                     errorMessage="Количество проверок должно быть целым числом большим нуля"
                     min={1}
                     required/>
        <Typography variant="body1">{`Всего: ${amountValue} руб.`}</Typography>
    </Box>

    function handleClose(): void {
        if (onClose) onClose()
    }

    function handleChange(value: number | null): void {
        if (value) {
            setAmountValue(Payment.amountValue({count: value, service: "checks"}))
        }
        onChange(value)
    }
}

export const SOLUTION_SENT_DESCRIPTION = "Самостоятельная работа уже отправлена на проверку. Дождитесь результатов."

type SubmitSolutionsSuccessMessageProps = {
    open: boolean,
    onClose: void => void
}

export function SubmitSolutionsSuccessMessage(props: SubmitSolutionsSuccessMessageProps): Element<typeof InformDialog> {

    const {open, onClose} = props

    return (
        <InformDialog open={open} onClose={onClose} title={"Решения отправлены!"}>
            {"Решения благополучно отправлены учителю. В течение суток Вы получете результаты " +
            "на свою электронную почту."}
        </InformDialog>
    )
}

function useSendSolution(test: Test): [Array<File> => Promise<void>, boolean] {

    const [isError, setIsError] = useState(false)
    const dataSource = useDataSourceContext()
    const loggerClient = useLoggerClientContext()

    const sendSendSolutionError = error => {
        sendError({
            error, method: "sendSolution", vars: [
                {name: "solutionId", value: test.solution.id}
            ], loggerClient
        })
        setIsError(true)
    }

    const send = async files => {
        try {
            test.solution = await dataSource.solutionDS.send({testId: test.id, files})
        } catch (error) {
            sendSendSolutionError(error)
            throw error
        }
    }

    return [send, isError]
}

type SendErrorProps = {
    error: IAppError,
    method: string,
    vars: Array<Variable>,
    loggerClient: LoggerClient
}

function sendError(props: SendErrorProps): void {
    const {error, method, vars, loggerClient} = props
    ErrorHandler.send({error, module: MODULE_NAME, method, vars, loggerClient})
}