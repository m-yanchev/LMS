//@flow

import React from "react"
import {Table as MaterialTable, TableHead, TableRow, TableCell, TableBody} from "@material-ui/core";

type TableProps = {
    headers: Array<string>,
    rows: Array<{[key: string]: any}>
}

export function Table(props: TableProps) {

    const {headers, rows} = props

    return (
        <MaterialTable>
            <TableHead>
                <TableRow>
                    {headers.map(header => <TableCell key={header}>{header}</TableCell>)}
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row, i) =>
                    <TableRow key={i}>
                        {headers.map(header => <TableCell key={header}>{row[header]}</TableCell>)}
                    </TableRow>)}
            </TableBody>
        </MaterialTable>
    )
}