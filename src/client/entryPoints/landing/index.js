import React from 'react';
import ReactDOM from 'react-dom';
import Landing from "./Landing";
import AppData from "../../../depricated/rules/AppData";

ReactDOM.hydrate(<App/>, document.getElementById('root'));

function App() {
    return <Landing appData={AppData.create(document.data)}/>
}