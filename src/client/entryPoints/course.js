// @flow

import {App} from "../../depricated/rules/App";
import {ReactApp} from "../ReactApp/ReactApp";
import {WebClient} from "../../depricated/WebClient/WebClient";
import {DataSource} from "../../depricated/rules/DataSource/DataSource";
import {LoggerClient} from "../../depricated/rules/LoggerClient";

const dataSource = DataSource.create(WebClient.root)
const loggerClient = LoggerClient.create(WebClient.logger)
const run = ReactApp.course
const app = App.create({dataSource, loggerClient, run})
app.start()