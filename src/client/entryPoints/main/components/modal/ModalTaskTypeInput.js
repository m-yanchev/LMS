import React from 'react'
import Modal from "../../HOC/Modal"
import TaskTypeInput from "../input/TaskTypeInput";

class ModalTaskTypeInput extends React.Component {

    constructor(props) {
        super(props);
        const {content} = this.props;
        const {heading, alias, taskDesc} = content || {};
        this.values = {heading: heading || '', alias: alias || '', taskDesc: taskDesc || ''};
    }

    render() {
        const message = this.props.message;
        const ModalInput = Modal(TaskTypeInput, this.props.modalRootDiv);
        return (
            <ModalInput
                message={message}
                values={this.values}
                onConfirm={this.handleConfirm}
            />)
    }

    handleConfirm = (isConfirm, values) => {
        const {onConfirm} = this.props;
        onConfirm(isConfirm, values);
    }
}

export default ModalTaskTypeInput