import React, {useState} from "react";
import {FullScreenDialog} from "./Dialog";
import {BackDropDataRequest} from "./DataRequest";
import {
    Table,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    TableFooter, Box, Typography
} from "@material-ui/core";
import {createMuiTheme, makeStyles, ThemeProvider} from '@material-ui/core/styles';
import {ruRU} from '@material-ui/core/locale';
import {Paper} from "@material-ui/core";
import {formatDate} from "../DateTime";
import {TestCheckPaymentForm} from "../../main/components/TestCheckPayment";

const useStyles = makeStyles((theme) => ({
    informBox: {
        marginTop: theme.spacing(2),
    },
    informBoxTitle: {
        margin: theme.spacing(0, 0, 1, 2),
    },
    paidCheckCountBox: {
        marginLeft: theme.spacing(2)
    },
    paidCheckCount: {
        margin: theme.spacing(0, 0, 0, 2)
    }
}))

export function Journal(props) {

    const {onClose, open, profile} = props
    const [view, setView] = useState("results")
    const itemList = [{
        name: "results", title: "Результаты"
    }, {
        name: "checks", title: "Проверки"
    }]
    const subtitle = "Личный кабинет"

    return (
        <FullScreenDialog open={open}
                          title="Дневник"
                          subtitle={subtitle}
                          onClose={onClose}
                          itemList={itemList}
                          onChange={handleChange}>
            {view === "results" ?
                <TestResultTable/> : undefined}
            {view === "checks" ?
                <PaidCheckInformer/> : undefined}
        </FullScreenDialog>
    )

    function handleChange(index) {
        setView(itemList[index].name)
    }

    function PaidCheckInformer() {

        const query = `
                query Solutions {
                    solutions {
                        date 
                        name
                        status
                    }
                }`

        return <>{open && view === "checks" ?
            <BackDropDataRequest WrappedComponent={PaidCheckInformerByContent}
                                 query={query}
                                 onClose={onClose}/>
            : undefined}</>

        function PaidCheckInformerByContent(props) {

            const resultRequests = props.content.solutions
            const classes = useStyles()

            const columns = [
                {name: "date", label: "Дата отправки", align: "left", minWidth: 50},
                {name: "name", label: "Наименование работы", align: "left", minWidth: 150},
                {name: "status", label: "Статус", align: "left", minWidth: 20}
            ]
            const content = resultRequests.map((item, index) => ({
                ...item,
                id: index,
                date: formatDate(item.date),
                status: item.status === "sent" ? "отправлены" : item.status === "paid" ? "на проверке" : "проверены"
            }))

            return (
                <Box>
                    <InformBox title="Отправленные на проверку работы:">
                        <InformTable columns={columns} content={content}/>
                    </InformBox>
                    <InformBox title="Оставшееся количество проверок:">
                        <Typography className={classes.paidCheckCount} variant="h6" color="primary">
                            {profile.checkCount || "0"}
                        </Typography>
                        <TestCheckPaymentForm/>
                    </InformBox>
                </Box>
            )

            function InformBox(props) {

                const {title, children} = props

                return (
                    <Box className={classes.informBox}>
                        <Typography className={classes.informBoxTitle} variant="h6">{title}</Typography>
                        {children}
                    </Box>
                )
            }
        }
    }

    function TestResultTable() {

        const query = `
                query TestResults {
                    testResults {
                        date 
                        name
                        earnedMark
                        fullMark
                    }
                }`

        return <>{open && view === "results" ?
            <BackDropDataRequest WrappedComponent={TestResultTableByContent}
                                 query={query}
                                 onClose={onClose}/>
            : undefined}</>

        function TestResultTableByContent(props) {

            const {testResults} = props.content

            const columns = [
                {name: "date", label: "Дата завершения", align: "left", minWidth: 50},
                {name: "name", label: "Наименование работы", align: "left", minWidth: 150},
                {name: "earnedMark", label: "Результат", align: "right", minWidth: 20},
                {name: "fullMark", label: "Из", align: "right", minWidth: 20},
                {name: "percentage", label: "%", align: "right", minWidth: 20}
            ]
            const content = testResults.map((item, index) => ({
                ...item,
                id: index,
                date: formatDate(item.date),
                percentage: percentage({abs: item.earnedMark, ref: item.fullMark})
            }))

            return (
                <InformTable columns={columns} content={content}/>
            )

            function percentage({abs, ref}) {
                return Math.round(abs / ref * 100)
            }
        }
    }

    function InformTable(props) {

        const {columns, content} = props
        const [page, setPage] = useState(0)
        const [rowsPerPage, setRowsPerPage] = useState(10)
        const theme = createMuiTheme({
            palette: {
                primary: {main: '#1976d2'},
            },
        }, ruRU);
        const startIndex = page * rowsPerPage
        const itemList = content.slice(startIndex, startIndex + rowsPerPage)

        return (
            <ThemeProvider theme={theme}>
                <Paper>
                    <TableContainer>
                        <Table stickyHeader aria-label="таблица">
                            <TableHead>
                                <TableRow>
                                    {columns.map(column => (
                                        <Cell key={column.name} column={column}>{column.label}</Cell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {itemList.map(item => (
                                    <TableRow key={item.id}>
                                        {columns.map(column => (
                                            <Cell key={column.name} column={column}>{item[column.name]}</Cell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination count={content.length}
                                                     page={page}
                                                     rowsPerPage={rowsPerPage}
                                                     onChangePage={handleChangePage}
                                                     onChangeRowsPerPage={handleChangeRowsPerPage}/>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </Paper>
            </ThemeProvider>
        )

        function handleChangePage(event, newPage) {
            setPage(newPage)
        }

        function handleChangeRowsPerPage(event) {
            setRowsPerPage(event.target.value)
        }

        function Cell(props) {
            const {column, children} = props
            return (
                <TableCell align={column.align}
                           style={{minWidth: column.minWidth}}>
                    {children}
                </TableCell>
            )
        }
    }
}