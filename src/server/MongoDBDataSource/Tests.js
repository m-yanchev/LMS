// @flow

import DB from "./DB";
import {Test} from "../../depricated/rules/Test";
import {NumbItems} from "./Items";
import {InstanceError} from "../../depricated/rules/ErrorHandler/InstanceError";
import type {OptionsType} from "./Items";
import type {TestDocumentType, TestFilterType} from "../Schema/Test";

export class Tests extends NumbItems {

    constructor(db: DB) {
        super("headings", db);
    }

    async find(filter: TestFilterType, options: OptionsType  = {}): Promise<Array<TestDocumentType>> {
        const tests = await super.find({...filter, $or: [{type: "test"}, {type: "paid-test"}]})
        return tests.map(test => Tests.parse(test))
    }

    async findOne(filter: TestFilterType, options: OptionsType  = {}): Promise<TestDocumentType> {
        return Tests.parse(await super.findOne(filter))
    }

    async getObject(filter: TestFilterType): Promise<Test> {
        const {id, heading, isPaid} = await this.findOne(filter)
        if (!id) throw InstanceError.create("id")
        return Test.create({id, heading, isPaid})
    }

    static parse(test: TestDocumentType): TestDocumentType {
        const {type, heading, ...rest} = test
        if (!heading) throw InstanceError.create("heading")
        return {...rest, heading, isPaid: type === "paid-test"}
    }
}