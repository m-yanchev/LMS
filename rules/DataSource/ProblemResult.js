// @flow

import {ObjectDS} from "./ObjectDS";

export interface IProblemResultDS {

}

export class ProblemResultDS extends ObjectDS<{}> {

    constructor(props: ?IProblemResultDS) {
        super(props)
    }

    static create(props: ?IProblemResultDS): ProblemResultDS {
        return new ProblemResultDS(props)
    }
}