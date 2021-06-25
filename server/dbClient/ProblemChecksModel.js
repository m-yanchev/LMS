const JournalModel = require('./JournalModel');
//const TestProblemsModel = require('./TestProblemsModel');
const NumbModel = require("./NumbModel")

class ProblemChecksModel extends JournalModel {

    constructor(db, user) {
        super(db, "problemChecks", user)
    }

    async insert({testId, problemId}) {
        try {
            await super.insert({testId, problemId, check: false})
            return true
        } catch (e) {
            throw e
        }
    }

    async update({testId, problemId}) {
        try {
            const lastProblem = await this.findLast({testId, problemId})
            await super.update({id: lastProblem.id, check: true});
            return true;
        } catch (e) {
            throw e
        }
    }

    async findLast(filter) {
        try {
            return (await super.find(filter))[0]
        } catch (e) {
            throw e
        }
    }

    async earnedMark(testId) {
        try {

            //const testProblemsModel = new TestProblemsModel(this.db)
            const testProblemsModel = new NumbModel(this.db, "testProblems")
            const [checks, testProblems] = await Promise.all([
                this.find({testId}),
                testProblemsModel.find({parentId: testId})
            ])

            checks.length = testProblems.length
            return checks.reduce((prevMark, {check}, i) => check ? testProblems[i].rating + prevMark : prevMark, 0)

        } catch (e) {
            throw e
        }
    }
}

module.exports = ProblemChecksModel;