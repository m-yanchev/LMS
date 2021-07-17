const NumbModel = require('./NumbModel');

class TestProblemsModel extends NumbModel {

    constructor(db) {
        super(db, "testProblems")
    }

    async fullMark(testId) {
        try {
            const problems = await this.findTestProblems({parentId: testId})
            return problems.reduce((prevMark, problem) => problem.rating + prevMark, 0)
        } catch (e) {
            throw e
        }
    }

    findTestProblems(filter) {
        return super.find(filter)
    }
}

module.exports = TestProblemsModel;