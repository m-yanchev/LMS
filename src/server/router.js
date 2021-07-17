// @flow

import {Application} from "express";
import {HTML} from "./HTML/HTML";

export function route(app: Application) {
    const html = HTML.create()
    app.get("/teacher", html.teacher.send())
}