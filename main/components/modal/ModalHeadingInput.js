import React, {Component} from 'react'
import Modal from '../../HOC/Modal'
import HeadingInput from "../input/HeadingInput";

class ModalHeadingInput extends Component {

    render() {
        const {message, content, modalRootDiv} = this.props;
        const heading = (content && content.heading) || '';
        const alias = (content && content.alias) || '';
        const ModalInput = Modal(HeadingInput, modalRootDiv);

        return (
            <ModalInput
                message={message}
                values={{heading, alias}}
                onConfirm={this.handleConfirm}
            />)
    }

    handleConfirm = (isConfirm, values) => {
        const {onConfirm} = this.props;
        onConfirm(isConfirm, values)
    }
}

export default ModalHeadingInput