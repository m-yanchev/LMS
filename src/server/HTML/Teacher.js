// @flow

import {send404SitePage} from "../HTMLTemplateCreator";
import {HTML} from "./HTML";
import {App} from "../../depricated/rules/App";
import {ReactApp} from "../../client/ReactApp/ReactApp";

export class Teacher {

    static create(): Teacher {
        return new Teacher()
    }

    send() {
        return async function (req: Request, res: Response) {
            try {
                HTML.send(req, res, App.create({run: ReactApp.teacherServerSide}))
            } catch (error) {
                send404SitePage()(req, res)
            }
        }
    }
}