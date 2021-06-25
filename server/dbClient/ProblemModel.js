const NumbModel = require('./NumbModel');

class ProblemModel extends NumbModel {

    constructor(db) {
        super(db, "tasks")
    }

    async find(filter) {
        if (!filter.id) throw new Error("is not id")
        const problem = await super.findOneById(filter.id)
        if (!problem) {
            throw new Error(`Problem not found, filter.id = ${filter.id}`)
        }
        const problemTypeModel = new NumbModel(this.db, "headings")
        const problemType = await problemTypeModel.find({id: problem.parentId})
        return {...problem, commonDesc: problemType.taskDesc}
        //console.log("ProblemModel.find: problem = %o", problem)
    }

    async remove({id}) {
        try {
            const testProblemsModel = new NumbModel(this.db, "testProblems")
            const testProblems = await testProblemsModel.find({problemId: id})
            console.log("ProblemModel.remove: testProblems = %o", testProblems)
            if (testProblems.length) {
                return {ok: false, message: "Задача является частью самостоятельных работ."}
            }
            return super.remove({id});
        } catch (e) {
            throw e
        }
    }
}

module.exports = ProblemModel;