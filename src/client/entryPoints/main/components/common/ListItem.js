import React, {Component} from 'react'
import {Grid} from '@material-ui/core';
import Buttons from './Buttons'
import {getComponentClassName} from "../../../../../depricated/common/helpers";

class ListItem extends Component {

    render() {

        const updateTitle = 'Нажмите для изменения элемента.';
        const removeTitle = 'Нажмите для удаления элемента.';

        const {children, className, contextStyles, isEditMode, onClick} = this.props;

        const buttonsData = [
            {type: 'update', title: updateTitle},
            {type: 'remove', title: removeTitle}];

        return (
            <Grid container
                  direction="row"
                  className={getComponentClassName(null, contextStyles, 'list-item', className)}
                  onContextMenu={e => e.preventDefault()}>
                {children}
                {isEditMode &&
                <Buttons onClick={onClick} className={className} contextStyles={contextStyles} data={buttonsData}/>}
            </Grid>
        )
    }
}

export default ListItem