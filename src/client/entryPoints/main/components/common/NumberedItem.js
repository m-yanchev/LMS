import React from 'react'
import ReactDOM from 'react-dom'
import {Grid} from '@material-ui/core';
import ListItem from './ListItem'

class NumberedItem extends React.Component {

    ref = React.createRef();

    componentDidMount() {
        if (this.props.onMount) {
            this.props.onMount(this.ref.current);
        }
    }

    componentWillUnmount() {
        if (this.props.onUnmount) {
            this.props.onUnmount()
        }
    }

    render() {

        const {children, isEditMode, onClick, style, className, contextStyles, id, isDragItem} = this.props;

        style['boxSizing'] = 'border-box';
        style['marginTop'] = '0px';
        style['marginLeft'] = '0px';

        const itemComponent = (
            <Grid item
                  id={id}
                  ref={this.ref}
                  style={style}
                  onContextMenu={e => e.preventDefault()}>
                <ListItem onClick={onClick} className={className} contextStyles={contextStyles} isEditMode={isEditMode}>
                    {children}
                </ListItem>
            </Grid>
        );

        if (isDragItem) {
            const {avatarRoot} = this.props;
            if (!avatarRoot || typeof avatarRoot !== 'object')
                throw TypeError('Expected "avatarRoot" prop is an object');
            return ReactDOM.createPortal(itemComponent, avatarRoot)
        } else {
            return itemComponent
        }
    }
}

export default NumberedItem


