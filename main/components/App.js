import React from 'react'
import {Switch, Route} from "react-router"
import {BrowserRouter} from "react-router-dom"
import ContentMainView from './views/ContentMainView'
import ErrorBoundary from "../../ReactApp/smartComponents/ErrorBoundary";
import AppData from "../../rules/AppData";

class App extends React.Component {

    render() {

        const modalRootDiv = document.getElementById('modal-root');
        const avatarRootDiv = document.getElementById('avatar-root');

        return (
            <ErrorBoundary module="App" method="render">
                <BrowserRouter>
                    <Switch>
                        <Route path={'/'}
                               render={props =>
                                   <ContentMainView appData={window.data && AppData.create(window.data)}
                                                    path={props.location.pathname}
                                                    status={window.status}
                                                    modalRootDiv={modalRootDiv}
                                                    avatarRootDiv={avatarRootDiv}/>}/>
                    </Switch>
                </BrowserRouter>
            </ErrorBoundary>
        );
    }
}

export default App;


