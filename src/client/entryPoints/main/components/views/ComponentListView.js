import React from 'react'
import {Grid} from '@material-ui/core';
import InsertBox from "../common/InsertBox";
import NumberedItem from "../common/NumberedItem";
import ErrorBoundary from "../../../../ReactApp/smartComponents/ErrorBoundary";

export default class ComponentListView extends React.Component {

    render() {

        const {className, contextStyles, itemProps, avatarRootDiv} = this.props;
        if (!itemProps || typeof itemProps !== 'object')
            throw new Error('Expected "itemProps" prop is an object');
        if (avatarRootDiv && typeof avatarRootDiv !== 'object') throw new TypeError('avatarRootDiv is not an object');

        const {componentList} = itemProps;
        if (!componentList || typeof componentList !== 'object')
            throw new Error('Expected "itemProps" prop is an object');

        return (
            <ErrorBoundary>
                {(componentList.length || componentList.editModeOn) &&
                <Grid
                    container
                    direction="row"
                    id={'component-list-view'}
                    onMouseDown={componentList.handleMouseDown}
                    onContextMenu={e => e.preventDefault()}
                >
                    {componentList.map((componentItem, index) => {
                            return (
                                <React.Fragment key={componentItem.id}>
                                    {componentList.editModeOn &&
                                    <InsertBox
                                        className={className}
                                        contextStyles={contextStyles}
                                        onClick={() => componentList.handleClick({
                                                name: 'insert-box',
                                                number: index + 1,
                                                parentId: componentList.parentId})}
                                    />}
                                    <NumberedItem
                                        id={componentItem.id}
                                        className={className}
                                        contextStyles={contextStyles}
                                        number={index + 1}
                                        onClick={(event) => {
                                            componentList.handleClick({
                                                name: event.name,
                                                number: index + 1,
                                                parentId: componentList.parentId})}
                                        }
                                        onMount={node =>
                                            componentList.handleComponentMount(
                                                node,
                                                componentItem.id,
                                                componentItem.component.type.displayName
                                            )}
                                        onUnmount={() => componentList.handleComponentUnmount(componentItem.id)}
                                        style={{
                                            visibility: index + 1 === componentList.dragComponentNumber ? 'hidden' : 'inherit'
                                        }}
                                        isEditMode={componentList.editModeOn}
                                    >
                                        {componentItem.component}
                                    </NumberedItem>
                                </React.Fragment>)
                        }
                    )}

                    {componentList.editModeOn &&
                    <InsertBox
                        className={className}
                        contextStyles={contextStyles}
                        onClick={() =>
                            componentList.handleClick({
                                name: 'insert-box',
                                number: componentList.length + 1,
                                parentId: componentList.parentId})}
                    />}

                    {componentList.dragComponentItem &&
                    <NumberedItem
                        id={componentList.dragComponentItem.id}
                        className={className}
                        isDragItem
                        avatarRoot={avatarRootDiv}
                        contextStyles={contextStyles}
                        number={componentList.dragComponentNumber}
                        onMount={node =>
                            componentList.handleComponentMount(
                                node,
                                componentList.dragComponentItem.id,
                                componentList.dragComponentItem.component.type.displayName
                            )}
                        onUnmount={() => componentList.handleComponentUnmount(componentList.dragComponentItem.id)}
                        style={{
                            position: 'fixed',
                            left: componentList.dragData.box.left + 'px',
                            top: componentList.dragData.box.top + 'px',
                            width: componentList.dragData.box.width + 'px',
                            height: componentList.dragData.box.height + 'px',
                        }}
                        isEditMode={true}
                    >
                        {componentList.dragComponentItem.component}
                    </NumberedItem>}
                </Grid>}
            </ErrorBoundary>
        );
    }
}