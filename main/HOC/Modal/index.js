import React from 'react';
import ReactDOM from "react-dom";
import styles from './styles.css'
import {getComponentClassName} from "../../../common/helpers";

export default function Modal(WrappedComponent, modalRootDiv) {

    return class extends React.Component {
        render = () => {
            const {message, ...passThroughProps} = this.props;
            const modalContent = (
                <div
                    className={styles.overlay}
                    onContextMenu={e => {
                        e.preventDefault()
                    }}
                    style={{
                        position: 'fixed',
                        zIndex: 200,
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        className={getComponentClassName(styles, this.props.contextStyles, 'modal')}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {message &&
                        <p
                            className={
                                getComponentClassName(styles, this.props.contextStyles, 'message')
                            }
                        >
                            {message}
                        </p>}
                        {<WrappedComponent
                            onKeyUp={this.handleKeyUp}
                            {...passThroughProps}
                        />}
                    </div>
                </div>
            );
            if (!modalRootDiv && typeof modalRootDiv !== 'object')
                throw new TypeError('Expected "modalRootDiv" is an object');
            return ReactDOM.createPortal(modalContent, modalRootDiv)
        };

        handleKeyUp = (event) => {
            try {
                const {onConfirm} = this.props;
                switch (event.key) {
                    case 'Enter' :
                        onConfirm(true);
                        break;
                    case 'Escape' :
                        onConfirm(false);
                        break;
                    default:
                }
            } catch (e) {
                console.error(e)
            }
        }
    }
}