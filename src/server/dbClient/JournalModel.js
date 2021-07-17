const Model = require('./Model');

class JournalModel extends Model {

    constructor(db, modelName, user) {
        super(db, modelName, user)
    }

    find(filter) {
        return this.user ? super.find({...filter, userId: this.user.id}, {sort: {date: -1}}) : []
    }

    insert(data) {
        //console.log("JournalModel.insert (14): data = %o", data)
        const date = JournalModel.date()
        return super.insert({userId: this.user.id, date, ...data})
    }

    static date() {
        return (new Date()).getTime()
    }
}

module.exports = JournalModel;