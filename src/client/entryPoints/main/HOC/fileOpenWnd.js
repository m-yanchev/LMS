import React from 'react';
import {openImageOne} from "../../../../depricated/common/files";

function fileOpenWnd(WrappedComponent) {

    return class extends React.Component {
        render() {

            const modalProps = {
                onInput: this.handleInputItem,
            };

            return (
                <WrappedComponent
                    modalProps={modalProps}
                    {...this.props}
                />
            )
        }

        handleInputItem = async () => {
            const file = await openImageOne();
            return {fileData: file, type: 'client'}
        };
    }
}

export default fileOpenWnd