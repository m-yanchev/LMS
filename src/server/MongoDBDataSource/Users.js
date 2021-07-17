// @flow

import DB from "./DB";
import {Profile} from "../../depricated/rules/Profile";
import {Items} from "./Items";
import type {ProfileFilterType} from "../Schema/Profile";

type UpdateCheckVarsType = {
    id: string,
    number: number
}

export class Users extends Items {

    constructor(db: DB) {
        super("users", db);
    }

    async updateChecks(vars: UpdateCheckVarsType): Promise<boolean> {
        const {number, id} = vars
        await this._collection.updateOne({_id: Items.toIdFormat(id)}, {$inc: {checkCount: number}})
        return true
    }

    async getObject(filter: ProfileFilterType): Promise<Profile> {
        const {id, name, email, access, src, checkCount, subscription} = await this.findOne(filter)
        return Profile.create({
            id,
            name,
            access,
            email,
            src,
            isRestore: false,
            checkCount: checkCount || 0,
            subscriptionEndTimeStamp: Number(subscription)})
    }
}