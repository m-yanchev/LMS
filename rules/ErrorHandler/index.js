// @flow

import {LoggerClient} from "../LoggerClient";

type SendProps = {
    error: IAppError,
    module: string,
    method: string,
    vars: Array<Variable>,
    loggerClient: LoggerClient
}

export interface IErrorHandlerProps {
    props: ErrorProps,
    error: IAppError
}

export interface IAppError {
    +message: string
}

type ErrorProps = {
    module: string,
    method: string,
    vars?: Array<Variable>
}

export type Variable = {
    name: string,
    value: ?string | ?number
}

class ErrorHandler {

    _type: "ErrorHandler"
    _props: ErrorProps
    _error: IAppError

    constructor(props: IErrorHandlerProps) {
        this._type = "ErrorHandler"
        this._props = props.props
        this._error = props.error
    }

    static create(props: IErrorHandlerProps): ErrorHandler {
        return new ErrorHandler(props)
    }

    static send(props: SendProps): void {
        const {error, module, method, vars, loggerClient} = props
        const errorHandler = ErrorHandler.create({error, props: {module, method, vars}})
        console.error(error)
        loggerClient.write({message: errorHandler.message})
    }

    get message(): string {
        return `Module: ${this._props.module};\t method: ${this._props.method};\t ` +
            `${(this._props.vars && this._props.vars.length) ? Variables.toString(this._props.vars) : ""}` +
            `\n\t${this._error.message}`
    }
}

class Variables {
    static toString(vars: Array<Variable>): string {
        return `variables:${
            vars.reduce((str, variable) => ` name ${variable.name} value ${String(variable.value)}`, "")
        }; `;
    }
}

export default ErrorHandler