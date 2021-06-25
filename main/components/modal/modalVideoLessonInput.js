import React from 'react'
import Modal from "../../HOC/Modal";
import VideoLessonInput from "../input/VideoLessonInput";

export default class modalVideoLessonInput extends React.Component {

    constructor(props) {
        super(props);
        const {content} = this.props;
        const {heading, alias, videoId, poster} = content || {};
        this.values = {heading: heading || '', alias: alias || '', videoId: videoId || '', poster};
    }

    render() {
        const {message, modalRootDiv, parentKey} = this.props;
        const ModalInput = Modal(VideoLessonInput, modalRootDiv);
        return (
            <ModalInput
                message={message}
                values={this.values}
                parentKey={parentKey}
                onConfirm={this.handleConfirm}
            />
        )
    }

    handleConfirm = (isConfirm, values) => {
        const {onConfirm} = this.props;
        onConfirm(isConfirm, values);
    }
}