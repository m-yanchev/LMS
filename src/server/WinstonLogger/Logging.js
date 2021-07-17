const {createLogger, format, transports} = require('winston');

let logger = null

export default function Logging() {

    try {
        const {combine, splat, simple} = format;

        if (!logger) {
            logger = createLogger({
                format: combine(splat(), simple()),
                transports: [
                    new transports.File({filename: 'error.log'})
                ]
            });
        }

        return {
            error
        }

        function error(...args) {
            try {
                return logger.error(...args)
            } catch (e) {
                console.error("Logging.error: logger = %o, error = %o", logger, e)
            }
        }
    } catch (e) {
        console.error("Logging: logger = %o, error = %o", logger, e)
    }
}