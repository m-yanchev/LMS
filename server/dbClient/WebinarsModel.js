const NumbModel = require('./NumbModel');

class WebinarsModel extends NumbModel {

    constructor(db) {
        super(db, "webinars")
    }

    find({parentId}) {
        return this.findByParentId({parentId})
    }

    findLocalItems({parentId}) {
        return super.find({parentId})
    }
}

module.exports = WebinarsModel;