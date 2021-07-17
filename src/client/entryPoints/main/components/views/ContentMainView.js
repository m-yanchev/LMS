import React from 'react'
import UserMode from "../../../../../depricated/common/components/UserMode";
import MainView from "../../../../../depricated/common/components/MainView";
import WrapComponentFunctionStack from "../../HOC/WrapComponentFunctionStack";
import Body from "../Body";
import {CssBaseline, ThemeProvider} from "@material-ui/core";
import ErrorBoundary from "../../../../ReactApp/smartComponents/ErrorBoundary";
import getTheme from "../../../../../depricated/common/theme";
import ErrorView from "../../../../../depricated/common/components/ErrorView";

export default class ContentMainView extends React.Component {

    constructor(props) {
        super(props);
        const funcStack = [{
            name: MainView
        }, {
            name: UserMode
        }];
        this.AppView = WrapComponentFunctionStack(Body, funcStack);
    }

    render() {
        const {AppView, props} = this;
        const {appData, status, ...rest} = props
        return <>
            {appData ? <>
            <CssBaseline/>
            <ThemeProvider theme={getTheme()}>
                <ErrorBoundary module="ContentMainView" method="render">
                    <AppView profile={appData.profile}
                             activeService={appData.activeService}
                             content={appData.content}
                             legalType={appData.legalType}
                             {...rest}/>
                </ErrorBoundary>
            </ThemeProvider> </>:
            <ErrorView status={status}/>}
        </>
    }
}