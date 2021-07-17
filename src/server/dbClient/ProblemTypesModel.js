const NumbModel = require('./NumbModel');

class ProblemTypesModel extends NumbModel {

    constructor(db) {
        super(db, "headings")
    }

    async remove({id}) {
        try {
            const problemsModel = new NumbModel(this.db, 'tasks');
            const problemChildren = await problemsModel.find({parentId: id})
            //console.log("ProblemTypesModel.remove: (13) this.result.remove.withChildren = %o", this.result.remove.withChildren)
            if (problemChildren.length > 0) return this.result.remove.withChildren
            return await super.remove({id});
        } catch (e) {
            throw e
        }
    }

}

module.exports = ProblemTypesModel;