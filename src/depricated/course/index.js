import React from 'react';
import ReactDOM from 'react-dom';
import AppData from "../rules/AppData";
import CoursePage from "../../client/ReactApp/smartComponents/course/Course";

ReactDOM.hydrate(<App/>, document.getElementById('root'));

function App() {
    return <CoursePage appData={AppData.create(document.data)}/>
}