// @flow

const https = require("https")

export type HTTPRequestSend = <HeadersType, DataType, ResultType>(SendRequestProps<HeadersType, DataType>) =>
    Promise<ResultType>

type SendRequestProps<HeadersType, DataType> = {|
    auth: string,
    path: string,
    hostname: string,
    method: "POST" | "GET",
    headers?: HeadersType,
    data?: DataType
|}

class HTTPRequest {

    static send<HeadersType, DataType, ResultType>(props: SendRequestProps<HeadersType, DataType>): Promise<ResultType>{

        const {headers, data, ...rest} = props
        const options = {...rest, headers: {"Content-Type": "application/json", ...(headers || {})}}

        return new Promise((resolve, reject) => {

            const req = https.request(options, handle)

            req.on('error', (e) => {
                reject(e)
            });

            const str = data ? JSON.stringify(data) : null
            if (str) req.write(str)

            req.end()

            function handle(incomingMessage) {
                incomingMessage.setEncoding('utf8')
                incomingMessage.on('data', str => {
                    resolve(JSON.parse(str))
                });
            }
        })
    }
}

export default HTTPRequest