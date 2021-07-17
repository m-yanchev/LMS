// @flow

export interface ILoggerAPI {
    +write: Log => void
}

export type Log = {
    message: string
}

export class LoggerClient {

    _logger: ILoggerAPI

    constructor(logger: ILoggerAPI) {
        this._logger = logger
    }

    static create(logger: ILoggerAPI): LoggerClient {
        return new LoggerClient(logger)
    }

    write(props: Log): void {
        this._logger.write(props)
    }
}