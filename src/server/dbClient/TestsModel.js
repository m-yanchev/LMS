const NumbModel = require('./NumbModel');

class TestsModel extends NumbModel {

    constructor(db) {
        super(db, "headings")
    }

    async remove({id}) {
        try {
            const testProblemsModel = new NumbModel(this.db, 'testProblems')
            const testProblems = await testProblemsModel.find({parentId: id})
            if (testProblems.length > 0) return this.result.remove.withChildren
            return await super.remove({id});
        } catch (e) {
            throw e
        }
    }
}

module.exports = TestsModel;