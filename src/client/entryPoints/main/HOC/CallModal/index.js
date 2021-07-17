import React from 'react'
import styles from './styles.css'
import Modal from '../Modal'
import ConfirmButtons from '../../components/modal/ConfirmButtons'
import Inform from "../../components/modal/Inform";

function CallModal(WrappedComponent, otherProps) {

    return class extends React.Component {

        state = {
            key: 0,
            modeModal: null
        };

        render() {

            const confirmMessage = {
                inputItem: 'Введите данные и нажмите "Ok" для подтверждения.',
                removeItem: 'Элемент будет удален без возвратно. Вы подтверждаете удаление элемента?'
            };

            const mode = this.state.modeModal;
            const content = mode && mode.data ? mode.data : {};
            const errorMessage = mode && mode.data ? mode.data : '';
            const inputItem = mode && mode.task === 'input';
            const removeItem = mode && mode.task === 'remove';
            const inform = mode && mode.task === 'inform';

            if (!otherProps || typeof otherProps !== 'object')
                throw new TypeError('Expected "otherProps" argument is an object');
            const ModalConfirm = Modal(ConfirmButtons, otherProps.modalRootDiv);
            const ModalInform = Modal(Inform, otherProps.modalRootDiv);

            const modalProps = {
                onInput: this.handleInputItem,
                onConfirmRemove: this.handleRemoveItem,
                onInform: this.handleInform,
                onRestart: this.handleRestart
            };

            return (
                <>
                    <WrappedComponent
                        key={this.state.key}
                        modalProps={modalProps}
                        {...this.props}
                    />
                    {inputItem &&
                    <mode.Component
                        content={content}
                        modalRootDiv={otherProps.modalRootDiv}
                        parentKey={mode.key}
                        onConfirm={this.handleConfirm}
                        message={confirmMessage.inputItem}
                    />}
                    {removeItem &&
                    <ModalConfirm
                        contextStyles={styles}
                        onClick={this.handleClick}
                        onConfirm={this.handleConfirm}
                        message={confirmMessage.removeItem}
                    />}
                    {inform &&
                    <ModalInform
                        onClick={this.handleClick}
                        onConfirm={this.handleConfirm}
                        message={[confirmMessage[mode.type] || '', errorMessage || ''].join(' ')}
                    />}
                </>
            )
        }

        handleClick = ({name}, event) => {

            event.stopPropagation()

            if (name === 'ok') {
                this.resolve(event.values)
            }
            if (name === 'cancel') {
                this.resolve(null)
            }

            this._removeModal()
        };

        handleConfirm = (isConfirm, values) => {
            if (isConfirm) {
                this.resolve(values)
            } else {
                this.resolve(null)
            }
            this._removeModal()
        };

        _removeModal = () => {
            this.setState({modeModal: null})
        };

        handleInputItem = (Component, content, key) => {
            try {
                const promise = new Promise(resolve => {
                    this.resolve = resolve;
                });
                this.setState(
                    {modeModal: {task: 'input', data: content, Component, key}});
                return promise;
            } catch (e) {
                console.error(e)
            }
        };

        handleRemoveItem = () => {
            try {
                const promise = new Promise(resolve => {
                    this.resolve = resolve;
                });
                this.setState({
                    modeModal: {task: 'remove'}
                });
                return promise;
            } catch (e) {
                console.error(e)
            }
        };

        handleInform = (type, errorMessage) => {
            try {
                this.setState({modeModal: {task: 'inform', type, data: errorMessage}})
            } catch (e) {
                console.error(e)
            }
        };

        handleRestart = () => {
            try {
                this.setState(prevState => {
                    const key = prevState.key + 1;
                    return {key}
                })
            } catch (e) {
                console.error(e)
            }
        };
    }
}

export default CallModal