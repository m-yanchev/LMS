// @flow

import ReactDOM from "react-dom";
import CoursePage from "./smartComponents/course/Course";
import React from "react";
import {InstanceError} from "../../depricated/rules/ErrorHandler/InstanceError";
import {ServerStyleSheets} from "@material-ui/core/styles";
import ReactDOMServer from "react-dom/server";
import template from "./template";
import AppData from "../../depricated/rules/AppData";
import type {Result, Run, RunProps} from "../../depricated/rules/App";
import TeacherPage from "./smartComponents/teacher/TeacherPage";

export class ReactApp {

    static course: Run = ({dataSource, loggerClient}) => {
        if (!dataSource) throw InstanceError.create("dataSource")
        if (!loggerClient) throw InstanceError.create("loggerClient")
        const App = () => <CoursePage dataSource={dataSource} loggerClient={loggerClient}/>
        const Root = document.getElementById('root')
        if (!Root) throw InstanceError.create("Root")
        ReactDOM.hydrate(<App/>, Root);
        return {}
    }

    static courseServerSide(props: RunProps): Result {
        const {dataSource, loggerClient} = props
        if (!dataSource) throw InstanceError.create("dataSource")
        if (!loggerClient) throw InstanceError.create("loggerClient")
        const sheets = new ServerStyleSheets()
        const component = <CoursePage dataSource={dataSource} loggerClient={loggerClient}/>
        const body = ReactDOMServer.renderToString(sheets.collect(component))
        const appData = AppData.createCourseApp({
            course: dataSource.course.replica, profile: dataSource.profile.replica
        })
        const html = template({app: body, css: sheets.toString(), appData: appData, entryPoint: "course"})
        return {html}
    }

    static teacher: Run = () => {
        const App = () => <TeacherPage/>
        const Root = document.getElementById('root')
        if (!Root) throw InstanceError.create("Root")
        ReactDOM.hydrate(<App/>, Root);
        return {}
    }

    static teacherServerSide(): Result {
        const sheets = new ServerStyleSheets()
        const component = <TeacherPage/>
        const body = ReactDOMServer.renderToString(sheets.collect(component))
        const html = template({app: body, css: sheets.toString(), entryPoint: "teacher"})
        return {html}
    }
}