const NumbModel = require('./NumbModel');

class ProblemListModel extends NumbModel {

    constructor(db) {
        super(db, "tasks")
    }

    async find() {
        try {
            const [problems, headings] = await Promise.all([super.find(), this._findProblemCategories()]);
            //console.log("ProblemListModel.find: problems = %o", lists[0])
            return {problems, headings};
        } catch (e) {
            //console.log("ProblemListModel.find: error = %o", e)
            throw e
        }
    }

    async _findProblemCategories(parentId = "0", level = 0) {
        try {
            const headingsModel = new NumbModel(this.db, 'headings');
            let headings = level < 2 ? await headingsModel.find({parentId}) : await this._findTaskTypes(parentId);

            if (level < 2) {
                const promises = [];
                headings.forEach(heading => promises.push(this._findProblemCategories(heading.id, level + 1)));
                (await Promise.all(promises)).forEach(children => {headings = headings.concat(children)});
            }
            //console.log("ProblemListModel._findProblemCategories: headings = %o, level = %o", headings, level)
            return headings;
        } catch (e) {
            throw e
        }
    }

    async _findTaskTypes(parentId) {
        try {
            const headingsModel = new NumbModel(this.db, 'headings');
            const headings = await headingsModel.find({parentId});
            const promises = [];
            const taskTypes = [];
            headings.forEach(heading => promises.push(super.find({parentId: heading.id})));
            (await Promise.all(promises)).forEach((problems, i) => {
                if (problems.length > 0) taskTypes.push(headings[i]);
            });
            return taskTypes;
        } catch (e) {
            throw e
        }
    }
}

module.exports = ProblemListModel;