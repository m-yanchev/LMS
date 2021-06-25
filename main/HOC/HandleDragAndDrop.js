import React from 'react'
import {DOMHelpers} from "../../common/helpers";

function HandleDragAndDrop( WrapComponent, otherProps = {} ) {

    return class extends React.Component {

        dragAndDropList = [];
        mouseDownData = undefined;
        isDragStart = false;

        render = () => {

            const {avatarRootDiv} = otherProps;
            if(avatarRootDiv && typeof avatarRootDiv !== 'object')
                throw new TypeError('avatarRootDiv is not an object');

            const dragAndDropProps = {
                onComponentMount: this.handleComponentMount,
                onComponentUnmount: this.handleComponentUnmount,
                onMouseDown: this.handleMouseDown,
                onStartItemIdChange: this.handleStartItemIdChange
            };

            return (
                <WrapComponent
                    dragAndDropProps={ dragAndDropProps }
                    avatarRootDiv={avatarRootDiv}
                    {...this.props}
                />)
        };

        handleComponentMount = ( node, id ) => {
            this.dragAndDropList.push({ node, id });
        };

        handleComponentUnmount = ( id ) => {
            const index = this.dragAndDropList.findIndex( item => item.id === id );
            if ( index !== -1 ) this.dragAndDropList.splice( index, 1 )
        };

        handleMouseDown = ( event, id, handleDragAndDrop ) => {

            event.preventDefault();

            if (this.mouseDownData) return;

            const startItemIndex = this.dragAndDropList.findIndex( item => item.id === id );

            this.mouseDownData = {
                startItemData: {
                    id: this.dragAndDropList[ startItemIndex ].id,
                    box: this.dragAndDropList[ startItemIndex ].node.getBoundingClientRect()
                },
                clientX: event.clientX,
                clientY: event.clientY,
                buttonSide: this._buttonSide( event ),
                handleDragAndDrop
            };

            document.addEventListener('mousemove', this.handleMouseMove );
            document.addEventListener('mouseup', this.handleMouseUp );
        };

        handleMouseMove = async  ( event ) => {

            event.preventDefault();

            if ( !this.mouseDownData || !this.mouseDownData.handleDragAndDrop ) return;

            const dX = event.clientX - this.mouseDownData.clientX;
            const dY = event.clientY - this.mouseDownData.clientY;

            const dragItemBox = {
                left: this.mouseDownData.startItemData.box.left + dX,
                top: this.mouseDownData.startItemData.box.top + dY,
                width: this.mouseDownData.startItemData.box.width,
                height: this.mouseDownData.startItemData.box.height
            };

            const startDragDistance = 3;
            if ( !this.isDragStart && ( Math.abs ( dX ) > startDragDistance || Math.abs ( dY ) > startDragDistance ) ) {
                await this.mouseDownData.handleDragAndDrop('dragStart', {
                        buttonSide: this._buttonSide(),
                        startItemId: this.mouseDownData.startItemData.id,
                        startBox: dragItemBox
                    });
                this.isDragStart = true
            }

            if ( !this.isDragStart ) return;

            const dragItem = this.dragAndDropList.find( item => item.id === 'dragItem' );

            if ( !dragItem ) return;

            dragItem.node.style.left = dragItemBox.left + 'px';
            dragItem.node.style.top = dragItemBox.top + 'px';
            const maxDistanceToDropItem = 200;
            let minDist = undefined;
            let itemIndex = undefined;
            this.dragAndDropList.forEach( ( item, index ) => {
                if ( item.id === 'dragItem' ) return;
                const dist = ( new DOMHelpers( dragItem.node ) ).getDistanceToDOMElement( item.node );
                if ( dist < maxDistanceToDropItem && ( !minDist || dist < minDist ) ) {
                    minDist = dist;
                    itemIndex = index;
                }
            });

            const startItemIndex = this.dragAndDropList.findIndex( item => item.id === this.mouseDownData.startItemData.id);
            const closestItemId = itemIndex !== undefined && itemIndex !== startItemIndex ? this.dragAndDropList[ itemIndex ].id : undefined;

            if ( !closestItemId ) return;

            this.mouseDownData.handleDragAndDrop( 'dragEnter', { closestItemId } );
        };

        handleMouseUp = ( event ) => {

            event.preventDefault();

            if ( this.isDragStart ) {
                this.mouseDownData.handleDragAndDrop( 'drop', {
                    buttonSide: this._buttonSide()
                } )
            }

            this._resetDragAndDrop()
        };

        handleStartItemIdChange = (id) => this.mouseDownData.startItemData.id = id;

        _resetDragAndDrop = () => {
            this.isDragStart = false;
            this.mouseDownData = undefined;
            document.removeEventListener('mousemove', this.handleMouseMove );
            document.removeEventListener('mouseup', this.handleMouseUp );
        };

        _buttonSide = ( event ) => {
            return this.mouseDownData ? this.mouseDownData.buttonSide : ( event.button === 0 ? 'left' : 'right' );
        }
    }
}

export default HandleDragAndDrop