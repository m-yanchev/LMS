const JournalModel = require('./JournalModel');

class PaymentsModel extends JournalModel {

    constructor(db) {
        super(db, "payments")
    }

    async find(data) {
        return (await super.find(data))[0]
    }

    async insert(data) {
        if (await this.findOneById(data.id)) {
            await this.update(data)
            return true
        } else {
            if (!this.user || !this.user.id) throw new Error(`PaymentsModel.insert: user is ${this.user}, expected user.id is string`)
            await super.insert(data)
            return true
        }
    }
}

module.exports = PaymentsModel;