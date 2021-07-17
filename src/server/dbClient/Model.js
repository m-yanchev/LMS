const {ObjectID} = require('mongodb');

class Model {

    constructor(db, modelName, user) {
        this.db = db;
        this.modelName = modelName;
        this._collection = db ? db.collection(modelName) : null;
        this.user = user
    }

    set user(user) {
        this._user = user;
    }

    get user() {
        return this._user;
    }

    set result(result) {
        this._result = result;
    }

    get result() {
        return this._result;
    }

    async find(filter, options = {}) {
        try {
            const result = await this._find(filter, options);
            result.forEach(document => this._makeKey(this._makeId(document)));
            return result;
        } catch (e) {
            console.error("Model.find (35): e = %o", e);
            throw e
        }
    }

    async insert(data) {
        try {
            data.key = String(await this._incKey());
            const inserted = await this._bulkWrite('insert', this._make_id(data))
            const {_id} = inserted.result.insertedIds[0];
            return {id: _id.toString(), key: data.key}
        } catch (e) {
            throw e
        }
    };

    async _incKey() {
        try {
            const lastIdModel = new Model(this.db, 'lastId');
            const lastIdObject = await lastIdModel._findOne({model: this.modelName});
            let key = 1;
            if (!lastIdObject) {
                await lastIdModel._bulkWrite('insert', {model: this.modelName, value: key})
            } else {
                key = +lastIdObject.value + 1;
                await lastIdModel.updateOneById(lastIdObject._id, {value: key});
            }
            return key;
        } catch (e) {
            throw e
        }
    }

    async findOneById(id) {
        const document = await this._collection.findOne({_id: Model.toIdFormat(id)})
        return this._makeId((document))
    }

    _makeId(document) {
        if(!document) return null
        document.id = document._id.toString();
        delete document._id;
        return document;
    }

    _make_id(data) {
        if (data.id !== undefined) {
            data._id = Model.toIdFormat(data.id);
            delete data.id;
        }
        return data
    }

    _makeKey(document) {
        if (!document.key) document.key = document.id;
        return document;
    }

    updateOneById(id, document = {}) {
        return this._collection.updateOne({_id: id}, {$set: document});
    }

    _find(filter = {}, options) {
        //console.log("Model._find (81): filter = %o, options = %o", filter, options);
        if (filter._id !== undefined) {
            filter._id = Model.toIdFormat(filter._id);
        }
        return this._collection.find(this._make_id(filter), options).toArray();
    }

    _findOne(filter) {
        return this._collection.findOne(filter);
    }

    async update({id, ...document}) {
        const operationData = {id, document};
        //console.log("Model.update: id = %o, document = %o", id, document);
        return (await this._bulkWrite('update', operationData)).ok
    };

    _bulkWrite(method, operationData) {
        return this._collection.bulkWrite(this.getOperations(method, operationData), {})
    };

    getOperations(method, data) {

        const operations = [];

        switch (method) {
            case 'insert':
                operations.push({insertOne: {'document': data}});
                break;
            case 'delete':
                operations.push({deleteOne: {'filter': {_id: Model.toIdFormat(data.id)}}});
                break;
            case 'update':
                operations.push({
                    updateOne: {
                        'filter': {_id: Model.toIdFormat(data.id)},
                        'update': {$set: data.document}
                    }
                });
                break;
        }
        return operations;
    };

    static toIdFormat(id) {
        return id.length === 24 ? ObjectID(id) : isNaN(+id) ? id : +id;
    }
}

module.exports = Model;
