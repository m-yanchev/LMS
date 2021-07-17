import React from 'react'
import ErrorView from "../../../depricated/common/components/ErrorView";
import {sendFailLog} from "../../../depricated/common/FailLogLoader";

class ErrorBoundary extends React.Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error(error)
        sendFailLog({...this.props, e: error})
    }

    render() {
        if (this.state.hasError) {
            return <ErrorView/>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary