const Model = require('./Model');

class NumbModel extends Model {

    constructor(db, modelName) {
        super(db, modelName)
        this.result = {
            remove: {
                withChildren: {ok: false, message: "Звучит дико, но сначала надо убить детей."}
            }
        }
    }

    async replace({id, parentId, number}) {
        try {
            const document = await this.findOneById(id);
            if (!document) return false
            //console.log("NumbModel.replace: (27) document = %o", document)
            await this._updateGTENumber({
                method: 'dec',
                number: document.number,
                parentId: document.parentId,
                type: document.type
            });
            //console.log("NumbModel.replace: (34) number = %o, parentId", number, parentId)
            await this._updateGTENumber({method: 'inc', number, parentId, type: document.type});
            await this.updateOneById(Model.toIdFormat(id), {number, parentId});
            return true;
        } catch (e) {
            throw e
        }
    }

    async insert({parentId, type, number, ...content}) {
        try {
            const document = {parentId, number, ...content}
            if (type) document.type = type
            await this._updateGTENumber({method: 'inc', number, parentId, type});
            return super.insert(document)
        } catch (e) {
            throw e
        }
    };

    _updateGTENumber({method, number, parentId, type}) {
        //console.log('RouterModel._updateGTENumber: (53) method = %o, number = %o, parentId = %o, type = %o', method, number, parentId, type);
        return this._bulkWrite(method + 'GTENumber', {number, filter: {parentId, type}});
    }

    findLocalItems(filter) {
        this.find(filter)
    }

    find(filter) {
        //console.log('NumbModel.find (55): filter = %o', filter);
        return super.find(filter, {projection: {number: 0}, sort: {number: 1}});
    };

    async findByParentId(filter) {
        try {
            //console.log("TestsModel._findByParentId (29): filter=%o", filter)
            const {parentId, ...rest} = filter
            const localItems = (await this.findLocalItems(filter));
            const headingsModel = new NumbModel(dataSource, 'headings');
            const headings = await headingsModel.find({parentId})
            //console.log("TestsModel._findByParentId (34): headings=%o, tests=%o", headings, tests)
            const promises = headings.map(({id}) => this.findByParentId({parentId: id, ...rest}))

            const restItems = (await Promise.all(promises)).reduce((prevArray, items) => prevArray.concat(items), []);
            return localItems.concat(restItems);
        } catch (e) {
            throw e
        }
    }

    getOperations(method, data) {

        const operations = super.getOperations(method, data);

        switch (method) {
            case 'incGTENumber':
                operations.push({
                    updateMany: {
                        'filter': {number: {$gte: +data.number}, ...data.filter},
                        'update': {$inc: {number: 1}}
                    }
                });
                break;
            case 'decGTENumber':
                operations.push({
                    updateMany: {
                        'filter': {number: {$gte: +data.number}, ...data.filter},
                        'update': {$inc: {number: -1}}
                    }
                });
                break;
            case 'deleteAndDecNextNumber':
                operations.push({
                    updateMany: {
                        'filter': {number: {$gte: +data.number}, ...data.filter},
                        'update': {$inc: {number: -1}}
                    }
                });
                operations.push({
                    deleteOne: {
                        'filter': {_id: {$eq: Model.toIdFormat(data.id)}}
                    }
                });
                break;
        }
        return operations;
    };

    async remove({id}) {
        if (typeof id !== "string") {
            console.error('NumbModel.remove: id = %o, this.modelName = %o', id, this.modelName);
            throw new Error("id is not string.")
        }
        //const document = await this._findNumberAndFieldById(id, "parentId");
        const document = await super.findOneById(id)
        if (!document) return {ok: false, message: "Это выглядит странным, но элемент не был найден в БД"}
        //const filter = this._getFilterByNameFieldAndByDocument(document, "parentId");
        const filter = {parentId: document.parentId, type: document.type}
        const operationData = {id, number: document.number, filter};
        await this._bulkWrite('deleteAndDecNextNumber', operationData)
        return {ok: true, message: "Элемент без проблем демонтирован", key: document.key}
    }

    /*_getFilterByNameFieldAndByDocument(document, nameField) {
        const filter = {};
        filter[nameField] = document[nameField];
        return filter;
    }

    async _findNumberAndFieldById(id, nameField) {
        try {
            const projection = {number: 1};
            projection[nameField] = 1;
            const documents = await super.find({_id: id}, {projection});
            return documents[0];
        } catch (e) {
            throw e;
        }
    }*/
}

module.exports = NumbModel;