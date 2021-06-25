const JournalModel = require("./JournalModel")
const Model = require("./Model")

class SolutionsModel extends JournalModel {

    constructor(db, user) {
        super(db, "solutions", user)
    }

    async find(filter) {
        const solutions = await super.find(filter)
        const headingsModel = new Model(this.db, "headings")
        const tests = await Promise.all(solutions.map(solution =>
            solution.testId ? headingsModel.findOneById(solution.testId) : null))
        tests.forEach((test, index) => solutions[index].name = test ? test.heading : "Без имени")
        return solutions
    }

    async insert(data) {
        const usersModel = new Model(this.db, "users")
        const {numberOfTestChecks} = await usersModel.findOneById(this.user.id)
        if (numberOfTestChecks > 0) {
            await usersModel.update({id: this.user.id, numberOfTestChecks: numberOfTestChecks - 1})
        }
        const status = numberOfTestChecks ? "paid" : "sent"
        const {key} = await super.insert({...data, status})
        return {status, key}
    }

    async update({count, filter}) {
        try {
            const requests = await this._collection.find(filter, {sort: {date: 0}, limit: count}).toArray()
            const idArray = requests.map(request => request._id)
            await this._collection.updateMany({_id: {$in: idArray}}, {$set: {status: "на проверке"}})
            const rest = count - requests.length
            if (rest > 0) {
                const usersModel = new Model(this.db, "users")
                const objectUserId = Model.toIdFormat(filter.userId)
                await usersModel._collection.updateMany({_id: objectUserId}, {$inc: {paidCheckCount: rest}})
            }
            return count - requests.length
        } catch (e) {
            throw e
        }
    }
}

module.exports = SolutionsModel;