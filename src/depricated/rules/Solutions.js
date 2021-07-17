// @flow

import {Solution} from "./Solution";
import type {SolutionProps} from "./Solution";
import Loader from "../WebClient/Loader";
import {Test} from "./Test";
import {InstanceError} from "./ErrorHandler/InstanceError";

export class Solutions {

    _solutions: Array<Solution>

    constructor(solutions: Array<SolutionProps>) {
        this._solutions = solutions.map(solution => Solution.create(solution))
    }

    set array(solutions: Array<Solution>) {
        this._solutions = solutions
    }

    /*get item(): Array<SolutionProps> {
        return this._solutions.map(sol => sol.replica)
    }

    get copy(): Solutions {
        return Solutions.create(this.item)
    }*/

    get actualTest(): Test | null {
        let actualTest: Test | null
        const didNotVerifySolution = this._solutions.find(solution => !solution.isVerified)
        if (didNotVerifySolution) actualTest = didNotVerifySolution.test
        else {
            const oldestSolution = this._solutions.reduce((oldestSolution: Solution | null, solution: Solution) => {
                if (!oldestSolution) return solution
                const curSentTimeStamp = solution.sentTimeStamp
                const oldSentTimeStamp = oldestSolution.sentTimeStamp
                if (!curSentTimeStamp || !oldSentTimeStamp) throw InstanceError.create("sentTimeStamp")
                return curSentTimeStamp < oldSentTimeStamp ? solution : oldestSolution
            }, null)
            actualTest = oldestSolution ? oldestSolution.test : null
        }
        if (actualTest) actualTest.resetResults()
        return actualTest
    }

    get isSuccess(): boolean {
        return this._solutions.findIndex(solution => solution.isSuccess) !== - 1
    }

    getItem(index: number): ?Solution {
        return this._solutions[index]
    }

    get length(): number {
        return this._solutions.length
    }

    delete(index: number): number{
        this._solutions.splice(index, 1)
        return (index > this.length - 2 && index) ? index - 1 : index
    }

    static folder = "solutions"

    static async load(): Promise<Solutions> {
        const query = `query Solutions {
            solutions {
                id
                sentTimeStamp
                test {
                    id
                    heading
                    isPaid
                    testProblems {
                        id
                        time
                        rating
                        problem {
                            commonDesc
                            desc
                            solution
                            answer
                            key
                        }
                    }
                }
                profile {
                    id
                    access
                    name
                    email
                    isRestore
                    src
                }
            }
        }`
        const {solutions} = await Loader.requestBySchema({query})
        return Solutions.create(solutions.map(solution => ({
            id: solution.id,
            sentTimeStamp: Number(solution.sentTimeStamp),
            test: solution.test,
            profile: solution.profile
        })))
    }

    static create(props: Array<SolutionProps>): Solutions {
        return new Solutions(props)
    }

    static createFromObjectArray(solutionArray: Array<Solution>): Solutions {
        const solutions = new Solutions([])
        solutions.array = solutionArray
        return solutions
    }
}