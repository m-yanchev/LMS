// @flow

import DB from "./DB";
import {ProblemResult} from "../../depricated/rules/ProblemResult";
import type {ProblemResultFilterType} from "../Schema/ProblemResult";
import {JournalItems} from "./Items";
import type {Make, Put} from "../ApolloServer/ProblemResults";

export class ProblemResults extends JournalItems {

    constructor(db: DB) {
        super("problemResults", db);
    }

    async getObject(filter: ProblemResultFilterType): Promise<ProblemResult | null> {
        const document = await this.findOne(filter)
        const {id, testProblemId, solutionId, comment, mark} = document || {}
        return document ? ProblemResult.create({id, testProblemId, solutionId, estimate: mark || 0, comment}) : null
    }

    make: Make = async document => {
        const {solutionId, testProblemId} = document
        const problemResult = await super.findOne({solutionId, testProblemId})
        if (!problemResult) await super.insert({item: {solutionId, testProblemId, mark: 0}})
    }

    put: Put = async document => {
        const {solutionId, testProblemId, mark} = document
        const problemResult = await super.findOne({solutionId, testProblemId})
        if (problemResult) await this.update({item: {id: problemResult.id, mark}})
        else await super.insert({item: {solutionId, testProblemId, mark}})
    }
}