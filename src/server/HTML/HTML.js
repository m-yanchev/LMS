// @flow

import {Course} from "./Course";
import {sendErrorSitePage} from "../ErrorHandler";
import {InstanceError} from "../../depricated/rules/ErrorHandler/InstanceError";
import {Teacher} from "./Teacher";
import {App} from "../../depricated/rules/App";
import type {Request, Response} from "express";

type HandleErrorProps = {
    error: Error,
    method: string,
    module: string
}

export class HTML {

    _course: Course
    _teacher: Teacher

    constructor() {
        this._course = Course.create()
        this._teacher = Teacher.create()
    }

    static create(): HTML {
        return new HTML()
    }

    get course(): Course {
        return this._course
    }

    get teacher(): Teacher {
        return this._teacher
    }

    static _handleError = (req: Request, res: Response, props: HandleErrorProps) => {
        const {error, module, method} = props
        console.error(error)
        const log = {module, method}
        sendErrorSitePage(error, {post: true, log})(req, res)
    }

    static send = (req: Request, res: Response, app: App) => {
        const {html} = app.start()
        if (!html) throw InstanceError.create("html")
        res.status(200).send(html)
    }
}