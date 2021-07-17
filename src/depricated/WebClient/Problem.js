// @flow

import type {ProblemProps} from "../rules/Problem";
import type {ProblemResponseType} from "../../server/Schema/Problem";
import type {ProblemResponse} from "../../server/ApolloServer/Problems";
import {InstanceError} from "../rules/ErrorHandler/InstanceError";

export class ProblemClient {

    static responseToProps(problem: ProblemResponseType): ProblemProps {
        return {
            key: problem.key,
            commonDesc: problem.commonDesc || null,
            desc: problem.desc,
            answer: problem.answer || null
        }
    }

    static oneResponseToProps(response: ProblemResponse): ProblemProps {
        const {key, desc, problemsType, solution, answer} = response
        if (!problemsType) throw InstanceError.create("problemsType")
        return {key, desc, solution, answer, commonDesc: problemsType.desc}
    }
}