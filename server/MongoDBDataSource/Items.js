// @flow

import DB from "./DB";
import {InstanceError} from "../../rules/ErrorHandler/InstanceError";

const {ObjectID} = require('mongodb');

type MongoDBCollection = {
    findOne: (any, ?OptionsType) => Promise<any>,
    find: (any, ?OptionsType) => any,
    updateOne: (any, {$set?: any, $inc?: any}) => Promise<void>,
    deleteOne: any => Promise<void>,
    insertOne: any => Promise<ResultType>,
    bulkWrite: OperationsType => Promise<ResultType>
}

export type OptionsType = any
type OperationsType = Array<{
    insertOne?: {document: any},
    updateMany?: {
        filter: {number: {$gte: number }, parentId?: string},
        update: {
            $inc: {number: -1 | 1}
        }
    },
    updateOne?: {
        filter: {_id: ObjectID},
        update: {$set: {number: number}}
    },
    deleteOne?: {
        filter: {
            _id: {
                $eq: ObjectID
            }
        }
    }
}>

export type RemoveResultType = {
    ok: boolean,
    message: string
}
export type InsertResultType = {
    id: string,
    key: string
}
type ResultType = {
    insertedId: ObjectID,
    result: {
        insertedIds: Array<{_id: string}>
    }
}

type DocumentIDType = ObjectID | string | number

type CollectionNameType = "users" | "tasks" | "solutions" | "testProblems" | "problemResults" | "headings"
    | "videoLessons"

export class Items {

    _collection: MongoDBCollection

    constructor(name: CollectionNameType, db: DB) {
        this._collection = db.collection(name)
    }

    update = async ({item}: {item: any}): Promise<boolean> => {
        const {number, id, ...content} = item
        await this._collection.updateOne({_id: Items.toIdFormat(id)}, {$set: content})
        return true
    }

    remove = async (filter: any): Promise<RemoveResultType> => {
        const {id, ...rest} = filter
        await this._collection.deleteOne(id ? {...rest, _id: Items.toIdFormat(id)} : rest)
        return {ok: true, message: "Элемент без проблем демонтирован"}
    }

    async insert({item}: {item: any}): Promise<InsertResultType> {
        const {id, ...rest} = item
        const result = await this._collection.insertOne(id ? {...rest, _id: Items.toIdFormat(id)} : rest)
        const newId = id || result.insertedId.toString()
        return {id: newId, key: newId}
    }

    async findWithKeys(filter: any, options: OptionsType  = {}): Promise<Array<any>> {
        const documents = await this._collection.find(filter, options).toArray()
        return documents.map(document => {
            return Items.makeKey(Items.makeId(document))
        })
    }

    async find(filter: any, options: OptionsType  = {}): Promise<Array<any>> {
        const documents = await this._collection.find(Items.make_Id(filter), options).toArray()
        return documents.map(document => Items.makeId(document))
    }

    async findOne(filter: any, options: OptionsType  = {}): Promise<any>  {
        const _filter =  filter.id ? Items.make_Id(filter) : filter
        return Items.makeId(await this._collection.findOne(_filter, options))
    }

    static toIdFormat(id?: string): DocumentIDType {
        if (!id) throw InstanceError.create("id")
        return id.length === 24 ? ObjectID(id) : isNaN(+id) ? id : +id;
    }

    static getCurrentDate() {
        return (new Date()).getTime()
    }

    static make_Id(document: any): any {
        const {id, ...rest} = document || {}
        return id ? {...rest, _id: Items.toIdFormat(id)} : {...rest}
    }

    static makeId(document: any): any {
        const {_id, ...rest} = document || {}
        return _id ? {id: _id.toString(), ...rest} : {rest}
    }

    static makeKey(document: any): any {
        return document && !document.key ? {key: document.id, ...document} : document
    }
}

export class NumbItems extends Items {

    constructor(name: CollectionNameType, db: DB) {
        super(name, db);
    }

    find(filter: any, options: OptionsType  = {}): Promise<Array<any>> {
        return this.findWithKeys(filter, {projection: {number: 0}, sort: {number: 1}})
    }

    remove = async (filter: any) => {
        const document = await this.findOne(filter)
        if (!document) return {ok: false, message: "Это выглядит странным, но элемент не был найден в БД"}
        if (!document.parentId) throw InstanceError.create("parentId")
        const operations = [{
            updateMany: {
                filter: {number: {$gte: +document.number}, parentId: document.parentId},
                update: {$inc: {number: -1}}
            }
        }, {
            deleteOne: {
                filter: {_id: {$eq: Items.toIdFormat(filter.id)}}
            }
        }]
        await this._collection.bulkWrite(operations)
        return {ok: true, message: "Элемент без проблем демонтирован"}
    }

    async insert({item}: {item: any}) {
        const {id, ...content} = item
        const operations = [{
            updateMany: {
                filter: {number: {$gte: +content.number}, parentId: content.parentId},
                update: {$inc: {number: 1}}
            }
        }, {
            insertOne: {document: content}
        }]
        const resID = (await this._collection.bulkWrite(operations)).result.insertedIds[0]._id
        return {id: resID, key: resID}
    }

    replace = async ({number, parentId, id}: {number: number, parentId: string, id: string}) => {
        const document = await this.findOne({id})
        const operations = [{
            updateMany: {
                'filter': {number: {$gte: +document.number}, parentId},
                'update': {$inc: {number: -1}}
            }
        }, {
            updateMany: {
                'filter': {number: {$gte: +number}, parentId},
                'update': {$inc: {number: 1}}
            }
        }, {
            updateOne: {
                'filter': {_id: Items.toIdFormat(id)},
                'update': {$set: {number}}
            }
        }]
        await this._collection.bulkWrite(operations)
        return true
    }
}

export class JournalItems extends Items {

    constructor(name: CollectionNameType, db: DB) {
        super(name, db);
    }

    async insert({item}: {item: any}) {
        const {id, ...content} = item
        const date = Date.now()
        return await super.insert({item: {date, ...content}})
    }

    async findOne(filter: any, options: OptionsType = {}): Promise<any> {
        const documents = await this.find(filter, options)
        return documents[0]
    }

    find(filter: any, options: OptionsType = {}): Promise<any> {
        const {date, ...filterRest} = filter || {}
        const {revers, ...optionsRest} = options
        try {
            const filter = date ? {...filterRest, date: {$gt: +date}} : filterRest
            const options = revers ? {sort: {date: 1}, ...optionsRest} : {sort: {date: -1}, ...optionsRest}
            return super.find(filter, options)
        } catch (e) {
            console.error(e)
            throw e
        }
    }
}
