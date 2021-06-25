// @flow

import {App} from "../rules/App";
import {ReactApp} from "../ReactApp/ReactApp";
import {WebClient} from "../WebClient/WebClient";
import {DataSource} from "../rules/DataSource/DataSource";
import {LoggerClient} from "../rules/LoggerClient";

const dataSource = DataSource.create(WebClient.root)
const loggerClient = LoggerClient.create(WebClient.logger)
const run = ReactApp.course
const app = App.create({dataSource, loggerClient, run})
app.start()