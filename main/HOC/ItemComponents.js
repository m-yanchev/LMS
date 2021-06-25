import React from 'react'
import {ContentReplaceTarget} from "../ContentData";

export default function ItemComponents(WrappedComponent, otherProps = {}) {

    class ItemComponents extends React.Component {

        constructor(props) {
            super(props);
            this.initialization();
        }

        initialization = () => {

            const {contentData} = this.props;
            this.state = {
                dragData: null,
                contentData: contentData
            };

            const {onChange} = otherProps;

            if (this.state.contentData.on) {
                if (onChange !== undefined) {
                    if (typeof onChange !== 'function') throw new Error('"onChange" is not function');
                    this.state.contentData.on('change', () => {
                        onChange(this.state.contentData)
                    })
                }

                this.state.contentData.on('keysUpdate', ({prevId, nextId}) => this.setState(state => {
                    if (state.dragData && state.dragData.id === prevId) {
                        return {dragData: {id: nextId, box: state.dragData.box}}
                    } else {
                        return {}
                    }
                }))
            }
        };

        render = () => {
            return <WrappedComponent itemProps={{componentList: this.getComponentList()}} {...this.props}/>
        };

        getComponentList = () => {

            const {contextStyles, path} = otherProps;
            const isEditMode = this._isEditMode()

            const editProps = {
                onMouseDown: this.handleMouseDown,
                onComponentMount: this.handleComponentMount,
                onComponentUnmount: this.handleComponentUnmount,
                onClick: this.handleClick
            };
            const {userModeProps} = this.props
            return this.state.contentData.getComponentList({
                editProps,
                userProps: userModeProps,
                dragData: this.state.dragData,
                isEditMode,
                contextStyles,
                path,
            });
        };

        handleComponentMount = (node, id, componentName) => {
            const {dragAndDropProps} = this.props;
            if (dragAndDropProps === undefined) return;
            if (!dragAndDropProps || typeof dragAndDropProps !== "object")
                throw new Error('Expected "dragAndDropProps" prop is an object');
            if (dragAndDropProps.onComponentMount) {
                dragAndDropProps.onComponentMount(node, id, componentName);
            }
        };

        handleComponentUnmount = (id) => {
            const {dragAndDropProps} = this.props;
            if (dragAndDropProps === undefined) return;
            if (dragAndDropProps.onComponentUnmount) {
                dragAndDropProps.onComponentUnmount(id);
            }
        };

        handleMouseDown = (event, id) => {
            const {dragAndDropProps} = this.props;
            if (dragAndDropProps === undefined) return;
            if (!dragAndDropProps || typeof dragAndDropProps !== "object")
                throw new Error('Expected "dragAndDropProps" prop is an object');
            if (dragAndDropProps.onMouseDown && this._isEditMode()) {
                dragAndDropProps.onMouseDown(event, id, this.handleDragAndDrop);
            }
        };

        handleDragAndDrop = async (typeEvent, data) => {

            switch (typeEvent) {
                case 'dragStart':
                    if (data.buttonSide === 'right' && !otherProps.noCopying) {
                        const id = this.state.contentData.copy(data.startItemId);
                        const {dragAndDropProps} = this.props;
                        if (typeof dragAndDropProps.onStartItemIdChange !== 'function')
                            throw new Error('Expected "dragAndDropProps.onStartItemIdChange" is a function');
                        dragAndDropProps.onStartItemIdChange(id);
                        this.setState({dragData: {id, box: data.startBox}})
                    } else {
                        this.setState({dragData: {id: data.startItemId, box: data.startBox}})
                    }
                    break;
                case 'dragEnter':
                    this.setState(state => {
                        if (state.dragData.id === data.closestItemId)
                            throw new Error('Call of "dragEnter" case expected for different elements');
                        if (state.contentData.getItem(data.closestItemId)) {
                            const closestDropTarget = new ContentReplaceTarget(
                                state.contentData,
                                state.dragData.id,
                                data.closestItemId);
                            if (closestDropTarget.type !== 'not-replace') {
                                this.isDragEnterCall = true;
                                state.contentData.replace(this.state.dragData.id, closestDropTarget.dataToReplace)
                            }
                            return {};
                        }
                    });
                    break;
                case 'drop':
                    this.setState((state, props) => {
                            const {modalProps} = props;
                            if (data.buttonSide === 'right' && !otherProps.noCopying) {
                                const InputComponent = state.contentData.getInputComponentById(state.dragData.id);
                                modalProps.onInput(InputComponent, state.contentData.getContentById(state.dragData.id)).then(
                                    content => {
                                        this.setState((state, props) => {
                                            const {loaderProps} = props;
                                            if (!content) {
                                                state.contentData.restoreInsertedItem(state.dragData.id)
                                            } else {
                                                state.contentData.update(content, state.dragData.id);
                                                if (loaderProps) {
                                                    const inserted = {
                                                        content,
                                                        number: state.contentData.getNumberById(state.dragData.id),
                                                        parentId: state.contentData.getParentIdById(state.dragData.id),
                                                        name: state.contentData.getNameById(state.dragData.id),
                                                        restore: () => state.contentData.restoreInsertedItem(state.dragData.id),
                                                        setKeys: keys => state.contentData.setKeys(state.dragData.id, keys)
                                                    };
                                                    loaderProps.insert(inserted);
                                                }
                                            }
                                            return {dragData: null};
                                        })
                                    })
                            } else {
                                const {loaderProps} = props;
                                if (loaderProps) {
                                    if (this.isDragEnterCall) {
                                        loaderProps.replace({
                                            id: state.dragData.id,
                                            parentId: state.contentData.getParentIdById(state.dragData.id),
                                            number: state.contentData.getNumberById(state.dragData.id),
                                            name: state.contentData.getNameById(state.dragData.id),
                                            "releaseStory": () => state.contentData.releaseReplacedStory(state.dragData.id),
                                            restore: () => state.contentData.restoreReplacedItem(state.dragData.id)
                                        });
                                    }
                                }
                                return {dragData: null};
                            }
                        }
                    )
            }
        };

        handleClick = async (event) => {

            this.setState((state, props) => {
                const {modalProps} = props;
                if (modalProps === undefined) return;
                if (!modalProps || typeof modalProps !== "object")
                    throw new Error('Expected "modalProps" prop is an object');
                const InputComponent = state.contentData.getInputComponentByParentId(event.parentId);
                if (event.name === 'insert-box') {
                    modalProps.onInput(InputComponent).then(
                        content => {
                            if (content) {
                                this.setState((state, props) => {
                                    this._insert(state, props, content, event.number, event.parentId);
                                    return {}
                                })
                            }
                        })
                } else if (event.name === 'update') {
                    const keys = state.contentData.getKeys(event.number, event.parentId);
                    if (!keys || typeof keys !== 'object') throw new Error('Expected "keys" is object');
                    modalProps.onInput(InputComponent, state.contentData.getContentById(keys.id), keys.key).then(
                        content => {
                            if (content) {
                                this.setState((state, props) => {
                                    this._update(state, props, content, keys);
                                    return {}
                                })
                            }
                        })
                } else if (event.name === 'remove') {
                    if (typeof modalProps.onConfirmRemove === 'function') {
                        modalProps.onConfirmRemove().then(confirm => {
                            if (confirm !== null) {
                                this.setState((state, props) => {
                                    this._remove(state, props, event.number, event.parentId);
                                    return {};
                                })
                            }
                        })
                    } else {
                        this._remove(state, props, event.number, event.parentId);
                        return {};
                    }
                }
            });
        };

        _isEditMode = () => {
            const {userModeProps} = this.props;
            const {isEditMode} = otherProps;
            if (userModeProps && typeof userModeProps !== 'object')
                throw new Error('Expected "userModeProps" is an object or undefined');
            return Boolean(isEditMode || (userModeProps && userModeProps.isEditMode));
        };

        _insert = (state, props, content, number, parentId) => {
            const {loaderProps} = props;
            const inserted = state.contentData.insert(content, number, parentId);
            if (loaderProps) {
                if (typeof loaderProps !== 'object')
                    throw new Error('LoaderProps object expected');
                const {insert} = loaderProps;
                if (typeof insert !== 'function')
                    throw new Error('In the loaderProps object is expected insert function');
                insert(inserted);
            }
        };

        _update = (state, props, content, keys) => {
            const {loaderProps} = props;
            const updated = state.contentData.update(content, keys.id);
            if (loaderProps) {
                if (typeof loaderProps !== 'object')
                    throw new Error('LoaderProps object expected');
                const {update} = loaderProps;
                if (typeof update !== 'function')
                    throw new Error('In the loaderProps object is expected update function');
                update(updated);
            }
        };

        _remove = (state, props, number, parentId) => {
            const {loaderProps} = props;
            const removed = state.contentData.remove(state.contentData.getId(number, parentId));
            if (loaderProps) {
                if (typeof loaderProps !== 'object')
                    throw new Error('LoaderProps object expected');
                const {remove} = loaderProps;
                if (typeof remove !== 'function')
                    throw new Error('In the loaderProps object is expected remove function');
                remove(removed);
            }
        }
    }

    ItemComponents.displayName = 'ItemComponents';
    return ItemComponents;
}