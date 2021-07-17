//@flow
import React, {Fragment, useEffect, useState} from "react"
import type {Element} from "react"
import {
    Button, Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Typography, Box, Card,
    CardHeader, CardContent, CardActions, DialogContentText, DialogActions
} from "@material-ui/core";
import {ButtonWithTooltip, IconButtonWithTooltip} from "../../../depricated/common/components/ButtonWithTooltip";
import {CancelButton, FormDialog, InformDialog} from "../../../depricated/common/components/Dialog";
import ClearIcon from "@material-ui/icons/Clear";
import {openFiles} from "../../../depricated/common/files";
import NumberField from "../../../depricated/common/components/NumberField";
import Payment from "../../../depricated/rules/Payment";
import {makeStyles} from "@material-ui/core/styles";
import {Test} from "../../../depricated/rules/Test";
import {PaymentScript} from "./Payment";
import type {PaymentFormProps, ServicePaymentScriptProps} from "./Payment";
import {useDataSourceContext, useLoggerClientContext} from "./AppProvider";
import type {IAppError, Variable} from "../../../depricated/rules/ErrorHandler";
import {LoggerClient} from "../../../depricated/rules/LoggerClient";
import ErrorHandler from "../../../depricated/rules/ErrorHandler";
import {ONE_MB_SIZE_B} from "../../../depricated/common/constants";
import {Solution} from "../../../depricated/rules/Solution";

const useStyles = makeStyles(theme => ({
    checkCountField: {
        marginBottom: theme.spacing(2)
    }
}))

const MODULE_NAME = "SubmitSolutions"
const MAX_LENGTH_FILES = 5
const SENDING_SOLUTION_ERROR = 'Возникла ошибка при попытке отправить решения. Попробуйте повторить позже.'
const FILE_LIST_LENGTH_ERROR_MESSAGE = `Количество файлов превышает допустимое значение. Разместите Ваше решение не ` +
    `более, чем на ${MAX_LENGTH_FILES} фото и повоторите добавление.`
const FILE_SIZE_ERROR_MESSAGE = `Размер файла с фото решения превышает допустимое значение. Уменьшите размер фото до ` +
    `допустимого значения, которое не должно превышать ${Solution.MAX_FILE_SIZE_MB} мегабайт, и повторите добавление.`

export type SubmitSolutionsButtonProps = {
    variant?: "outlined" | "text" | "contained",
    test?: Test,
    disabled?: boolean,
    color?: "primary" | "default",
    onClick: (boolean, ?Test) => void,
    onFail: void => void
}

export function SubmitSolutionsButton(props: SubmitSolutionsButtonProps): Element<typeof Fragment> {

    const {test, variant, disabled, onClick, onFail} = props
    const [loading, isAvailable, isError] = useGetSendingSolutionsAvailable()
    const color = props.color || "primary"
    if (isError) onFail()

    return <>
        <Button variant={variant} disabled={disabled || loading} color={color} onClick={handleClick}>
            {"Отправить"}
        </Button>
    </>

    async function handleClick(): Promise<void> {
        onClick(isAvailable, test)
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const sendingSolutionErrorMessage = isSendingSolutionError ? SENDING_SOLUTION_ERROR : null

    return <>
        <FormDialog open={open}
                    name={"submit-solutions"}
                    onClose={onClose}
                    title={`Отправка решения`}
                    warningMessage={errorMessage || sendingSolutionErrorMessage}
                    message={`Сфотографируйте решение. Решение следует разместить не более, чем на ` +
                    `${MAX_LENGTH_FILES} фото. Размер каждого файла с фото решения не должен превышать 9 мегабайт. ` +
                    'Добавьте файлы с решениями в систему и затем нажмите кнопку "Отправить". ' +
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
    </>

    function handleChange(files: Array<File>): void {
        if (files.length > MAX_LENGTH_FILES) {
            setErrorMessage(FILE_LIST_LENGTH_ERROR_MESSAGE)
            return
        }
        if (files.find(file => file.size > Solution.MAX_FILE_SIZE_MB * ONE_MB_SIZE_B)) {
            setErrorMessage(FILE_SIZE_ERROR_MESSAGE)
            return
        }
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
            {"Решения благополучно отправлены учителю. В течение суток Вы получите результаты " +
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

function useGetSendingSolutionsAvailable() {

    const [loading, setLoading] = useState(false)
    const [isAvailable, setIsAvailable] = useState(false)
    const [isError, setIsError] = useState(false)
    const dataSource = useDataSourceContext()
    const loggerClient = useLoggerClientContext()

    const sendGetSendingSolutionsAvailableError = error => {
        sendError({
            error, method: "getSendingSolutionsAvailable", vars: [], loggerClient
        })
        setIsError(true)
    }

    const getIsAvailable = () => {
        setLoading(true)
        dataSource.profileDS.getSendingSolutionsAvailable().then(isAvailable =>
            setIsAvailable(isAvailable)
        ).catch(error => sendGetSendingSolutionsAvailableError(error))
    }

    useEffect(() => {getIsAvailable()})

    return [loading, isAvailable, isError]
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