// @flow

import {ReactApp} from "../ReactApp/ReactApp";
import {App} from "../../depricated/rules/App";

const run = ReactApp.teacher

const app = App.create({run})
app.start()