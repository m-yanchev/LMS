// @flow

import DB from "./DB";
import {Solution} from "../../rules/Solution";
import type {SolutionFilterType} from "../Schema/Solution";
import {JournalItems} from "./Items";
import type {Make, Verify} from "../ApolloServer/Solutions";
import {DateTime} from "../../rules/DateTime";

export class Solutions extends JournalItems {

    constructor(db: DB) {
        super("solutions", db)
    }

    async getObject(filter: SolutionFilterType): Promise<Solution | null > {
        const document = await this.findOne(filter)
        if (!document) return null
        const {id, date, verifiedTimeStamp, comment, testId, userId} = document
        return Solution.create({
            id,
            sentTimeStamp: date,
            test: {
                id: testId
            },
            verifiedTimeStamp: verifiedTimeStamp,
            result: comment ? {
                comment
            } : null,
            profile: {
                id: userId
            }
        })
    }

    make: Make = async document => {
        const {testId, userId} = document
        await this.insert({item: {testId, userId}})
    }

    verify: Verify = async filter => {
        const {id} = filter
        await this.update({item: {id, verifiedTimeStamp: DateTime.createNow().timeStamp}})
    }
}