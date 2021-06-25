// @flow

import {DataSource} from "./DataSource/DataSource";
import {LoggerClient} from "./LoggerClient";

type AppProps = {
    dataSource: DataSource,
    loggerClient: LoggerClient,
    run: Run
}
export type Run = RunProps => Result

export type RunProps = {
    dataSource: DataSource,
    loggerClient: LoggerClient
}

export type Result = {
    html?: string
}

export class App {

    _dataSource: DataSource
    _loggerClient: LoggerClient
    _run: Run

    constructor(props: AppProps) {
        this._dataSource = props.dataSource
        this._loggerClient = props.loggerClient
        this._run = props.run
    }

    static create(props: AppProps): App {
        return new App(props)
    }

    start(): Result {
        return this._run({dataSource: this._dataSource, loggerClient: this._loggerClient})
    }
}
