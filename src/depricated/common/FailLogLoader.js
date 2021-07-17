// @flow
import Loader from "../WebClient/Loader";

type sendFailLogProps = {
    module: string,
    ...FailProps
}

type Body = {
    message: string,
    method: string,
    module: string,
    variables?: ?string
}

export type FailProps = {| e: Error, method: string, vars?: Array<{name: string, value: string}>|}

export function sendFailLog({module, method, e, vars}: sendFailLogProps): void {
    const body: Body = {message: e.message, method, module}
    if (vars) body.variables = JSON.stringify(vars)
    Loader["request"](body, "/api/error")
}