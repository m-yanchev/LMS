// @flow

import type {Log} from "../rules/LoggerClient";
import {WebClient} from "./WebClient";
import {gql} from "@apollo/client/core";

const MUTATION = gql`
    mutation MakeLog($log: Log!) {
        makeLog(log: $log) {
            ok
        }
    }
`

export class LoggerClient {
    static write(props: Log): void {
        const {message} = props
        const client = WebClient.create()
        client.mutate({mutation: MUTATION, variables: {log: {message}}}).catch(error => console.error(error))
    }
}