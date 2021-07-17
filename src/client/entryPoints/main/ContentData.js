import React from 'react'
import Emitter from './Emitter'
import {DOMHelpers} from "../../../depricated/common/helpers";
import {getFullPath} from "./path"

class ContentItem {

    constructor(ItemData) {
        const {id, key, parentId, content} = ItemData;
        this._id = id;
        this._key = key;
        this._parentId = parentId;
        this._content = content;
        this._story = {
            contents: [],
            parentId: null
        };
    }

    get keys() {
        return {id: this._id, key: this._key || this._id}
    }

    set keys(keys) {
        if (typeof keys !== 'object') throw new Error('Expected to be used keys object');
        const {id, key} = keys;
        if (id === undefined) throw new Error('In the keys object is expected id field');
        this._id = id;
        this._key = key;
    }

    get parentId() {
        return this._parentId
    };

    replace(parentId) {
        if (!this._story.parentId) this._story.parentId = this._parentId;
        this._parentId = parentId;
    }

    restoreReplacedItem() {
        this._parentId = this._story.parentId;
    }

    releaseReplacedStory() {
        this._story.parentId = null;
    }

    get id() {
        return this._id;
    }

    get key() {
        return this._key || this._id;
    }

    set id(id) {
        this._id = id;
    }

    get content() {
        return this._content;
    }

    set content(content) {
        this._content = content;
    }

    update(content) {
        this._story.contents.push(this._content);
        this._content = content;
    }

    restoreUpdatedItem() {
        this._content = this._story.contents.pop();
    }
}

export class ContentItemType {

    constructor(type) {
        if (typeof type !== 'object') throw new Error('Type argument expected');
        const {name, Component, model, InputComponent} = type;
        if (!name || name === '') throw new Error('Name argument expected');
        if (!Component) throw new Error('Component argument expected');
        this._name = name;
        this._Component = Component;
        this._model = model;
        this._InputComponent = InputComponent
    }

    get name() {
        return this._name
    }

    get Component() {
        return this._Component
    }

    get model() {
        return this._model
    }

    get InputComponent() {
        return this._InputComponent
    }

}

export class ContentList extends Emitter {

    constructor(rootId, types, items) {

        super();

        this._rootId = rootId;
        this._types = types;

        if (this._rootId !== null) {
            const badItem = items.find(itemData => {
                if (itemData.parentId === this._rootId) return false;
                const parent = items.find(parentData => parentData.id === itemData.parentId);
                return parent === undefined
            });
            if (badItem !== undefined) {
                console.error("rootId = %o, items = %o", rootId, items)
                throw new Error('All elements must have a parent');
            }
        }

        this._items = items.map(itemData => new ContentItem(itemData));
        this._curOwnKey = 0;
        this._story = {
            removedItems: [],
            replacedItemData: []
        };
    }

    isItemsByParentId(id) {
        if (!id) return Boolean(this._items.length);
        const item = this._items.find(item => item.parentId === id);
        return Boolean(item);
    };

    checkRootItem(id) {
        return this._rootId === id;
    }

    forParentId(parentId, callback) {
        this._items.forEach((item, index) => {
            if (!parentId || item.parentId === parentId) callback(item, index);
        })
    }

    get length() {
        return this._items.length;
    }

    forEach(fn) {
        this._items.forEach(fn)
    }

    map(fn) {
        return this._items.map(fn)
    }

    getComponentList(props) {
        return new ComponentList({contentData: this, parentId: this._rootId, ...props});
    };

    getContent(index) {
        if (typeof index !== 'number') throw new Error('"index" is expected to be number');
        if (index >= this._items.length) throw new Error('Index value expected less than contentData size');
        return this._items[index].content;
    }

    getContentById(id) {
        return this._items[this._getIndexById(id)].content;
    }

    getTypeItemNameById(id) {
        return this.getTypeById(id).name;
    }

    getModelByParentId(id) {
        return this.getTypeByParentId(id).model;
    }

    getNameByParentId(id) {
        return this.getTypeByParentId(id).name;
    }

    getModelById(id) {
        return this.getTypeById(id).model;
    }

    getNameById(id) {
        return this.getTypeById(id).name;
    }

    getComponentById(id) {
        return this.getTypeById(id).Component;
    }

    getInputComponentByParentId(id) {
        return this.getTypeByParentId(id).InputComponent;
    }

    getInputComponentById(id) {
        return this.getTypeById(id).InputComponent;
    }

    getTypeById(id) {
        const level = this._getLevelById(id);
        if (!(level < this._types.length)) throw new Error('missing type for item');
        return this._types[level];
    }

    getTypeByParentId(id) {
        const level = this._getLevelByParentId(id);
        if (!(level < this._types.length)) throw new Error('missing type for item');
        return this._types[level];
    }

    getParentIdById(id) {
        const item = this.getItem(id);
        if (!item) throw new Error('Item with this id is not listed');
        return item.parentId;
    }

    getNumberById(id) {
        const parentId = this.getParentIdById(id);
        let count = 0;
        this._items.find(item => {
            if (item.parentId === parentId) count++;
            return item.id === id
        });
        return count
    }

    update(content, id) {
        const item = this.getItem(id);
        if (!item) throw new Error('Item with this id is not listed');
        item.update(content);
        this.emit('change');
        return {
            content: content,
            name: this.getNameById(id),
            id,
            key: item.keys.key,
            restore: () => this.restoreUpdatedContent(id),
        };
    };

    restoreUpdatedContent = async (id) => {
        const i = this._getIndexById(id);
        this._items[i].restoreUpdatedItem();
        this.emit('change')
    };

    remove(id) {
        const item = this.getItem(id);
        if (!item) throw new Error('Item with this id is not listed');
        const index = this._getIndexById(id);
        const name = this.getNameById(id);
        this._story.removedItems.push(this._items[index]);
        this._items.splice(index, 1);
        this.emit('change');
        return {
            id,
            //key: item.keys.key,
            name,
            restore: () => this.restoreRemovedItem(id, index)
        };
    };

    restoreRemovedItem = (id, toIndex) => {
        const delIndex = this._story.removedItems.findIndex(item => item.id === id);
        const itemsIndex = toIndex > this._items.length ? this._items.length : toIndex;
        this._items.splice(itemsIndex, 0, this._story.removedItems[delIndex]);
        this._story.removedItems.splice(delIndex, 1);
        this.emit(['change']);
    };

    replace(id, {parentId, number}) {
        this._saveBeginStateBeforeReplace(id);
        const item = this.getItem(id);
        if (!item) throw new Error('Item with this id is not listed');
        item.replace(parentId);
        this._replace(id, this._getIndexByNumber(number, parentId));
        this.emit(['change']);
    };

    restoreReplacedItem(id) {
        const storyIndex = this._getReplacedStoryIndexById(id);
        const {nextId} = this._story.replacedItemData.splice(storyIndex, 1)[0];
        const toIndex = nextId ? this._getIndexById(nextId) : this.length - 1;
        const fromIndex = this._getIndexById(id);
        this._items[fromIndex].restoreReplacedItem();
        this._items.splice(toIndex, 0, this._items.splice(fromIndex, 1)[0]);
        this.emit(['change']);
    };

    releaseReplacedStory(id) {
        const index = this._getReplacedStoryIndexById(id);
        this._story.replacedItemData.splice(index, 1);
        const item = this.getItem(id);
        if (!item) throw new Error('Item with this id is not listed');
        item.releaseReplacedStory();
    }

    copy(id) {
        const content = this.getContentById(id);
        const number = this.getNumberById(id);
        const parentId = this.getParentIdById(id);
        const model = this.getModelById(id);
        const Component = this.getComponentById(id);
        const {ownId} = this.insert(content, number, parentId, model, Component);
        return ownId;
    };

    insert(content, number, parentId) {
        const ownId = this._curOwnId;
        const index = this._getIndexByNumber(number, parentId);
        this._items.splice(index, 0, new ContentItem({id: ownId, parentId, content}));
        this.emit('change');
        return {
            ownId,
            content: content,
            number,
            parentId,
            name: this.getNameByParentId(parentId),
            restore: () => this.restoreInsertedItem(ownId),
            setKeys: keys => this.setKeys(ownId, keys)
        };
    }

    restoreInsertedItem(ownId) {
        this._items.splice(this._getIndexById(ownId), 1);
        this.emit('change');
    }

    setKeys = (ownId, keys) => {
        const item = this.getItem(ownId);
        if (!item) throw new Error('Item with this id is not listed');
        item.keys = keys;
        this.emit(['change', 'keysUpdate'], {prevId: ownId, nextId: keys.id});
    };

    getId = (number, parentId) => {
        const keys = this.getKeys(number, parentId);
        return keys ? keys.id : undefined
    };

    getKeys = (number, parentId) => {
        if (typeof number !== 'number') throw new Error('Expected "number" is number');
        if (typeof parentId !== 'string') throw new Error('Expected "parentId" is string');
        let count = 1;
        const item = this._items.find(item => item.parentId === parentId && count++ === number);
        return item ? item.keys : undefined
    };

    _getLevelById(id) {
        if (!this._rootId) return 0;
        const item = this.getItem(id);
        if (!item) throw new Error('Item with this id is not listed');
        if (item.parentId === this._rootId) return 0;
        return this._getLevelById(item.parentId) + 1
    }

    _getLevelByParentId(id) {
        if (!this._rootId || id === this._rootId) return 0;
        const parent = this.getItem(id);
        if (!parent) throw new Error('Parent with this id is not listed');
        return this._getLevelByParentId(parent.parentId) + 1
    }

    _getReplacedStoryIndexById(id) {
        const storyIndex = this._story.replacedItemData.findIndex(storyItem => storyItem.id === id);
        if (storyIndex === -1) throw new Error('Id not found in story');
        return storyIndex;
    }

    _saveBeginStateBeforeReplace(id) {
        const index = this._story.replacedItemData.findIndex(dataItem => dataItem.id === id);
        if (index === -1) {
            this._story.replacedItemData.push({id, nextId: this._getNextId(id)})
        }
    }

    getItem(id) {
        return this._items.find(item => item.id === id);
    }

    _replace(id, toIndex) {
        if (toIndex > this._items.length) throw new Error('Index exceeds item array size');
        this._items.splice(toIndex, 0, this._items.splice(this._getIndexById(id), 1)[0]);
    }

    get _curOwnId() {
        return `own${this._curOwnKey++}`
    }

    _getIndexById(id) {
        const index = this._items.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Item with this id is not listed');
        return index
    }

    _getIndexByNumber(number, parentId) {
        let count = 0;
        const index = this._items.findIndex(item => {
            if (item.parentId === parentId) {
                count++;
                return count === number;
            }
        });
        return index > -1 ? index : this._items.length;
    }

    _getNextId(id) {
        let parentId = undefined;
        const nextItem = this._items.find(item => {
            if (item.id === id) {
                parentId = item.parentId;
            } else if (parentId !== undefined) {
                return item.parentId === parentId
            }
        });
        return parentId === undefined ? undefined : (nextItem ? nextItem.id : null)
    }
}

export class ContentReplaceTarget {

    constructor(contentData, srcId, trgId) {
        this._contentData = contentData;
        if (!contentData.getItem(srcId)) throw new Error('Missing item with id equal "srcId"');
        if (!contentData.getItem(trgId)) throw new Error('Missing item with id equal "trgId"');
        this._srcId = srcId;
        this._trgId = trgId;
    }

    get dataToReplace() {
        return this.type === 'sibling' ? {
            parentId: this._contentData.getParentIdById(this._trgId),
            number: this._contentData.getNumberById(this._trgId)
        } : {
            parentId: this._trgId,
            number: 1
        }
    }

    get type() {
        return this.checkCommonType() ? 'sibling' : this.checkContactChildParent() ? 'parent' : 'not-replace'
    }

    checkCommonType() {
        return this._contentData.getTypeItemNameById(this._srcId) === this._contentData.getTypeItemNameById(this._trgId)
    }

    checkContactChildParent() {
        const childParentId = this._contentData.getParentIdById(this._srcId);
        return !this._contentData.checkRootItem(childParentId) ?
            this._contentData.getTypeItemNameById(childParentId) === this._contentData.getTypeItemNameById(this._trgId) :
            false;
    }
}

export class ComponentList {

    constructor({
                    contentData,
                    parentId,
                    editProps,
                    dragData,
                    isEditMode,
                    contextStyles,
                    path,
                    ...rest
                },
                onDragChild = false) {

        this._editProps = editProps;
        this._isEditMode = parentId ? isEditMode : false;
        this._components = [];
        this._contextStyles = contextStyles;
        this._parentId = parentId;
        this._dragComponentItem = null;
        this._dragData = null;
        this._restProps = rest
        if (contentData.isItemsByParentId(parentId)) this._type = contentData.getTypeByParentId(parentId);

        contentData.forParentId(parentId, item => {
            if (dragData && dragData.id === item.id) {
                this._dragData = dragData;
                this._dragComponentItem = this._createComponentItem(
                    'dragItem',
                    item,
                    dragData,
                    path,
                    contentData,
                    true)
            }
            this._components.push(this._createComponentItem(
                onDragChild ? 'drag-item-' + item.id : item.id,
                item,
                dragData,
                path,
                contentData
            ))
        })
    }

    map(callback) {
        return this._components.map(callback);
    }

    get model() {
        return this._type.model
    }

    get parentId() {
        return this._parentId
    }

    get Component() {
        return this._type.Component
    }

    get type() {
        return this._type
    }

    get length() {
        return this._components.length;
    }

    get contextStyles() {
        return this._contextStyles
    }

    get editModeOn() {
        return this._isEditMode
    }

    get dragComponentItem() {
        return this._dragComponentItem;
    }

    get dragComponentNumber() {
        return this._dragData ?
            this._components.findIndex(component => component.id === this._dragData.id) + 1 :
            null;
    }

    get dragData() {
        return this._dragData;
    }

    handleMouseDown = (event) => {
        if (!this._isEditMode || !this._editProps.onMouseDown) return;
        const target = new DOMHelpers(event.target);
        const item = this._components.find(item => (target.checkParentById(item.id)));
        if (!item) return;
        this._editProps.onMouseDown(event, item.id)
    };

    handleClick = (event, number, options) => {
        return this._isEditMode ?
            this._editProps.onClick && this._editProps.onClick(event, number, options) :
            undefined;
    };

    handleComponentMount = (node, id, componentName) => {
        return this._editProps.onComponentMount && this._editProps.onComponentMount(node, id, componentName);
    };

    handleComponentUnmount = (id) => {
        return this._editProps.onComponentUnmount && this._editProps.onComponentUnmount(id);
    };

    _createComponentItem(id, item, dragData, path, contentData, onDragChild = false) {
        return {
                id,
                component: (
                    <this._type.Component
                        {...this._restProps}
                        contextStyles={this._contextStyles}
                        key={item.id}
                        id={item.id}
                        itemKey={item.key}
                        parentId={this._parentId}
                        path={path}
                        number={contentData.getNumberById(item.id)}
                        content={item.content}
                        componentList={
                            contentData.getModelByParentId(this._parentId) !== 'tasks' &&
                            new ComponentList({
                                    contentData,
                                    parentId: item.id,
                                    editProps: this._editProps,
                                    dragData,
                                    isEditMode: this._isEditMode,
                                    contextStyles: this._contextStyles,
                                    path: path && getFullPath(path, item.content.alias)
                                },
                                onDragChild
                            )
                        }
                    />
                )
            }
    };
}