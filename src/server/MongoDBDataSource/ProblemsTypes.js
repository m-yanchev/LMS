// @flow

import {NumbItems} from "./Items";
import DB from "./DB";
import {InstanceError} from "../../depricated/rules/ErrorHandler/InstanceError";
import type {OptionsType} from "./Items";

export class ProblemsTypes extends NumbItems {

    constructor(db: DB) {
        super("headings", db);
    }

    async findOne(filter: any, options: OptionsType) {
        const problemsType = await super.findOne(filter, options)
        if (!problemsType) InstanceError.create("problemsType")
        return {desc: problemsType.taskDesc}
    }
}
