// @flow

import {Problem} from "../../rules/Problem";
import {Items, NumbItems} from "./Items";
import DB from "./DB";
import type {ProblemFilterType} from "../Schema/Problem";
import type {OptionsType} from "./Items";
import type {GetObject} from "../ApolloServer/Problems";
import type {Record} from "../ApolloServer/Problems";
import type {ProblemProps} from "../../rules/Problem";
import {InstanceError} from "../../rules/ErrorHandler/InstanceError";

export class Problems extends NumbItems {

    constructor(db: DB) {
        super("tasks", db);
    }

    async findOne(filter: ProblemFilterType, options: OptionsType = {}): Promise<Record> {
        const {id, key, ...rest} = filter
        return id ? Items.makeKey(await super.findOne(filter)) : key ?
            Items.makeKey(Items.makeId(await this._collection.findOne({
                ...rest,
                $or: [{key}, {_id: Items.toIdFormat(key)}]
            }))) :
            Items.makeKey(await super.findOne(filter))
    }

    getObject: GetObject = async ({id}) => {
        const problem = await this.findOne({id})
        if (!problem) throw InstanceError.create("problem")
        return Problem.create(Problems.dataToObjectProps(problem))
    }

    static dataToObjectProps(data: Record): ProblemProps {
        const {key, desc, answer, parentId} = data
        return {key, desc, parentId, answer}
    }
}