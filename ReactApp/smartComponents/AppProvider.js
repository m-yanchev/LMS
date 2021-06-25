// @flow

import React, {useContext} from "react";
import type {Node, Element} from "react";
import {DataSource} from "../../rules/DataSource/DataSource";
import {LoggerClient} from "../../rules/LoggerClient";
import {InstanceError} from "../../rules/ErrorHandler/InstanceError";

type AppProviderProps ={
    ...ContextData,
    children: Node
}

type ContextData = {|
    dataSource: DataSource,
    loggerClient: LoggerClient,
|}

const AppContext = React.createContext<ContextData | null>(null)

export function AppProvider(props: AppProviderProps): Element<typeof AppContext.Provider> {
    const {dataSource, loggerClient, children} = props
    return (
        <AppContext.Provider value={{dataSource, loggerClient}}>
            {children}
        </AppContext.Provider>
    )
}

export function useDataSourceContext(): DataSource {
    const contextData = useContext<ContextData | null>(AppContext)
    if (!contextData) throw InstanceError.create("contextData")
    return contextData.dataSource
}

export function useLoggerClientContext(): LoggerClient {
    const contextData = useContext<ContextData | null>(AppContext)
    if (!contextData) throw InstanceError.create("contextData")
    return contextData.loggerClient
}