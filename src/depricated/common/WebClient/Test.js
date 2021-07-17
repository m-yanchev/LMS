// @flow

import Problem from "../logic/Problem";

class TestClient {

    static fields = `
        id
        heading
        isPaid
    `

    static testProblemFields = `
        id
        time
        rating
        problem {
            ${Problem.fields}
        }
    `

    static query = `test {
        ${TestClient.fields}
        testProblems {
            ${TestClient.testProblemFields}
        }
    }`
}

export default TestClient