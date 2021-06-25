import React from 'react'
import Input from '../Input'
import TextInput from "../../input/TextInput";
import Modal from "../../../HOC/Modal";
import styles from "./styles.css"

class LoginForm extends React.Component {

    ref = React.createRef();

    render() {
        const fields = [{
            name: 'username',
            component: TextInput,
            label: 'Логин',
            value: '',
            options: {autoFocus: true}
        }, {
            name: 'password',
            component: TextInput,
            label: 'Пароль',
            value: ''
        }];

        const message = 'Введите логин и пароль:';
        const LoginFields = (props) => {
            return (
                <>
                    <form ref={this.ref} action="/auth" method="POST">
                        <Input {...props}/>
                    </form>
                </>
            )
        };
        const ModalInput = Modal(LoginFields, this.props.modalRootDiv);
        return (
            <ModalInput
                contextStyles={styles}
                message={message}
                fields={fields}
                onConfirm={this.handleConfirm}
            />
        )
    }

    handleConfirm = (isConfirm) => {
        if (!isConfirm) this.ref.current.action = '/';
        this.ref.current.submit();
    };
}

export default LoginForm