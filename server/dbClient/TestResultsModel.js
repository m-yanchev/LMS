const NumbModel = require("./NumbModel")
const JournalModel = require('./JournalModel');
const TestProblemsModel = require('./TestProblemsModel');
const ProblemChecksModel = require('./ProblemChecksModel');

class TestResultsModel extends JournalModel {

    constructor(db, user) {
        super(db, "testResults", user)
    }

    async find(filter) {
        try {
            //console.log("TestResultsModel.find (15): testResults = %o, filter = %o", testResults, filter)
            /*this.result.testResults = await super.find(filter)
            this.result.view = "testResults"
            this.result.status = 200*/
            return await super.find(filter)
        } catch (e) {
            throw e
        }
    }

    async insert({testId}) {
        try {
            //console.log("TestResultsModel.insert (15): date = %o", date)
            const fullMarkPromise = this.fullMark(testId)
            //console.log("TestResultsModel.insert (17): fullMarkPromise = %o", fullMarkPromise)
            const earnedMarkPromise = this.earnedMark(testId)
            //console.log("TestResultsModel.insert (19): earnedMarkPromise = %o", earnedMarkPromise)
            const testsPromise = (new NumbModel(this.db, "headings")).find({type: "test"})
            const [fullMark, earnedMark, tests] = await Promise.all([fullMarkPromise, earnedMarkPromise, testsPromise])
            const name = tests.find(test => test.id === testId).heading
            //console.log("TestResultsModel.insert (21): fullMark = %o, earnedMark = %o", fullMark, earnedMark)
            await super.insert({testId, name, earnedMark, fullMark})
            //console.log("TestResultsModel.insert (23)")
            return true

        } catch (e) {
            throw e
        }
    }

    async update({testId}) {
        try {

            const date = JournalModel.date()
            const [id, earnedMark] = Promise.all([this.lastTestResultId(testId), this.earnedMark(testId)])
            await super.update({id, earnedMark, date});

            this.result.status = 200;
            return this.result;

        } catch (e) {
            throw e
        }
    }

    async findLast(filter) {
        try {
            const results = await super.find(filter)
            return results[0]
        } catch (e) {
            throw e
        }
    }

    async lastTestResultId(testId) {
        try {
            const results = await super.find({testId})
            return results[0].id
        } catch(e) {
            throw e
        }
    }

    fullMark(testId) {
        const testProblemsModel = new TestProblemsModel(this.db)
        return testProblemsModel.fullMark(testId)
    }

    earnedMark(testId) {
        const problemChecksModel = new ProblemChecksModel(this.db, this.user)
        return problemChecksModel.earnedMark(testId)
    }
}

module.exports = TestResultsModel;