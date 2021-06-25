// @flow

import {createLogger, format, transports} from "winston";
import {Logger} from "winston";
import type {Log} from "../../rules/LoggerClient";
import {DateTime} from "../../rules/DateTime";

let logger: WinstonLogger | null = null

class WinstonLogger {

    _logger: Logger

    constructor() {
        const {combine, splat, simple} = format;
        this._logger = createLogger({
            format: combine(splat(), simple()),
            transports: [
                new transports.File({filename: 'error.log'})
            ]
        });
    }

    static create(): WinstonLogger {
        if (!logger) logger = new WinstonLogger()
        return logger
    }

    write(log: Log): void {
        const dt = DateTime.createNow()
        this._logger.error(`${dt.date} ${dt.time}\n\t${log.message}`)
    }

}

export default WinstonLogger