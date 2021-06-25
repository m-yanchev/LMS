import React from 'react';
import {DialogContent, DialogContentText, Button, IconButton, SvgIcon, Grid} from '@material-ui/core';
import {FormTextField, InputDialog} from "./Dialog";
import Loader from "../../WebClient/Loader";
import {Informer} from "./Informer";
import BackdropSpinner from "./BackDropSpinner";
import {redirect} from "../redirect"
import EmailInput from "./EmailInput";
import Profile from "../logic/Profile";
import type {ActiveServiceProps} from "../logic/ActiveService";
import VKIcon from "./VKIcon";
import ActiveService from "../logic/ActiveService";

export type UserModeProps = {
    isLoaded: boolean,
    isEditMode: boolean,
    onAuth: ({ callback: (void) => void, activeService: ActiveServiceProps, message: string }) => void,
    onTeacherAuth: void => boolean,
    onClick: ({ name: string, value: ?mixed }),
    profile: Profile,
    activeService: ActiveService
}

export default function UserMode(WrappedComponent) {

    class UserMode extends React.Component {

        constructor(props) {
            super(props);
            const {profile, activeService, ...rest} = props
            this.restProps = rest
            this.state = {
                activeService: activeService || ActiveService.create(),
                profile: profile || Profile.create(),
                isEditMode: false,
                warningMessage: null,
                modalWnd: profile.isRestore ? 'password-restore' : null,
                informerMessage: null,
                backdropOpen: false
            };
        }

        render = () => {
            const {modalWnd, isEditMode, warningMessage, message, informerMessage, backdropOpen} = this.state
            const isLoaded = !backdropOpen
            const ModalPasswordRestoreForm = Input(PasswordRestore);
            const ModalAuthForm = Input(Auth);
            const ModalEmailAddressInputForm = Input(EmailAddressInput);
            const ModalPasswordUpdateForm = Input(PasswordUpdate);
            const ModalProfileUpdateForm = Input(ProfileUpdate);
            const ModalRegistrationForm = Input(Registration);
            const userModeProps = {
                activeService: this.state.activeService,
                setActiveService: activeService => this.setState({activeService}),
                profile: this.state.profile,
                setProfile: profile => this.setState({profile}),
                isLoaded,
                isEditMode,
                onAuth: this.handleAuth,
                onTeacherAuth: this.handleTeacherAuth,
                onClick: this.handleClick
            }
            return (
                <>
                    <WrappedComponent
                        userModeProps={userModeProps}
                        {...this.restProps}
                    />
                    <ModalPasswordRestoreForm
                        open={modalWnd === 'password-restore'}
                        onConfirm={this.handleConfirm}
                        onCancel={this.handleCancel}/>
                    <ModalAuthForm
                        open={modalWnd === 'auth'}
                        message={message}
                        warningMessage={warningMessage}
                        onConfirm={this.handleConfirm}
                        onCancel={this.handleCancel}
                        onClick={this.handleClick}/>
                    <ModalEmailAddressInputForm
                        open={modalWnd === 'email-address-input'}
                        warningMessage={warningMessage}
                        onConfirm={this.handleConfirm}
                        onCancel={this.handleCancel}/>
                    <ModalPasswordUpdateForm
                        open={modalWnd === 'password-update'}
                        warningMessage={warningMessage}
                        onConfirm={this.handleConfirm}
                        onCancel={this.handleCancel}
                        onClick={this.handleClick}/>
                    <ModalProfileUpdateForm
                        name={this.state.profile.name}
                        email={this.state.profile.email}
                        open={modalWnd === 'profile-update'}
                        warningMessage={warningMessage}
                        onConfirm={this.handleConfirm}
                        onCancel={this.handleCancel}/>
                    <ModalRegistrationForm
                        open={modalWnd === 'registration'}
                        warningMessage={warningMessage}
                        onConfirm={this.handleConfirm}
                        onCancel={this.handleCancel}
                        onClick={this.handleClick}/>
                    <Informer onClose={this.handleCancel} message={informerMessage}/>
                    <BackdropSpinner open={backdropOpen}/>
                </>)

        };

        handleConfirm = (event) => {

            const {name, value} = event;

            switch (name) {
                case 'password-restore':
                    this._updatePasswordAfterRestore(value);
                    break;
                case 'auth':
                    this._auth(value);
                    break;
                case 'email-address-input':
                    this._sendRequestForPasswordRestoreLink(value);
                    break;
                case 'password-update':
                    this._updatePassword(value);
                    break;
                case 'profile-update':
                    this._updateProfile(value);
                    break;
                case 'registration':
                    this._registration(value);
                    break;
            }
        };

        handleAuth = ({callback, activeService, message}) => {
            const {profile} = this.state
            if (profile.isStudentAccess) {
                this.state.activeService.reset()
                if (callback) callback()
            } else {
                this.state.activeService.set(activeService)
                this._modalWnd({name: 'auth', message})
            }
        }

        handleTeacherAuth = () => {
            if (this.state.profile.isTeacherAccess) {
                return true
            } else {
                this._modalWnd({name: 'auth'});
                return false
            }
        }

        handleClick = (event) => {

            const {name, value} = event

            switch (name) {
                case 'google':
                case 'vkontakte':
                    this._authOfSrc(name);
                    break;
                case 'password-restore':
                    this._modalWnd({name: 'email-address-input'});
                    break;
                case 'auth':
                case 'profile-update':
                case 'password-update':
                case 'registration':
                    this._modalWnd({name, ...value});
                    break;
                case 'logout':
                    this._logout();
                    break;
                case 'edit-on':
                    this._editOn();
                    break;
                case 'edit-off':
                    this._editOff();
                    break;
            }
        };

        handleCancel = () => {
            this.state.activeService.reset()
            this._closeWnd();
        };

        _registration(fields) {

            const {verPassword, ...body} = fields;
            const props = {
                body,
                action: "registration",
                src: fields.src,
                successAction: profile => this._setProfile(profile),
                wrongAction: () => this._modalWnd({
                    name: 'registration',
                    warningMessage: 'Пользователь с таким электронным адресом уже зарегистрирован.'
                }),
                failMsg: "Извините, не получилось произвести регистрацию. Пожалуйста, попробуйте повторить позже."
            }

            this._sendRequest(props)
        }

        _auth(body) {

            const props = {
                body,
                action: "auth",
                successAction: profile => this._setProfile(profile),
                wrongAction: () => this._modalWnd({
                    name: 'auth',
                    warningMessage: 'Нет пользователя с таким электронным адресом или неверный пароль.'
                }),
                failMsg: "Извините, не получилось произвести вход. Пожалуйста, попробуйте повторить позже."
            }

            this._sendRequest(props)
        }

        _authOfSrc(src) {
            this._closeWnd()
            this._onSetBackdrop()
            if (this.state.activeService.id) {
                const form = redirect(`/auth/${src}`, false)
                form.input("activeServiceName", this.state.activeService.name)
                form.input("activeServiceId", this.state.activeService.id)
                form.submit()
            } else {
                redirect(`/auth/${src}`)
            }
        }

        _sendRequestForPasswordRestoreLink(body) {

            const props = {
                body,
                action: "sendPasswordRestoreLink",
                successAction: () => this._inform("На указанный Вами электронный адрес была выслана ссылка для изменения пароля."),
                wrongAction: () => this._modalWnd({
                    name: 'email-address-input',
                    warningMessage: 'Нет пользователя с таким электронным адресом.'
                }),
                failMsg: "Извините, не получилось отправить запрос на изменение пароля. Пожалуйста, попробуйте повторить позже."
            }

            this._sendRequest(props)
        }

        _logout() {

            const props = {
                action: "logout",
                successAction: profile => this._setProfile(profile),
                failMsg: "Извините, не получилось произвести выход. Пожалуйста, попробуйте повторить позже."
            }
            this.state.activeService.reset()
            this._sendRequest(props)
        }

        _editOn() {
            this.setState(prevState => ({isEditMode: prevState.profile.isTeacherAccess}));
        }

        _editOff() {
            this.setState({isEditMode: false});
        }

        _updateProfile(values) {

            const props = {
                body: {src: this.state.profile.src, ...values},
                action: "updateProfile",
                successAction: profile => {
                    this._setProfile(profile)
                    this._inform("Профиль успешно обновлен.")
                },
                wrongAction: () => this._modalWnd({
                    name: 'profile-update',
                    warningMessage: 'Такой адрес электронной почты обнаружен у другого пользователя.'
                }),
                failMsg: "Извините, не получилось сохранить изменения профиля. Пожалуйста, попробуйте повторить позже."
            }

            this._sendRequest(props)
        }

        _updatePassword(body) {

            const props = {
                body,
                action: "updatePassword",
                successAction: () => this._inform("Пароль успешно обновлен."),
                wrongAction: () => this._modalWnd({
                    name: 'password-update',
                    warningMessage: 'Введен неверный старый пароль.'
                }),
                failMsg: "Извините, не получилось сохранить изменения пароля. Пожалуйста, попробуйте повторить позже."
            }

            this._sendRequest(props)
        }

        _updatePasswordAfterRestore(values) {
            const {newPassword} = values
            const props = {
                body: {id: this.state.profile.id, password: newPassword},
                action: "updatePasswordAfterRestore",
                successAction: () => this._inform("Пароль восстановлен. Выполните вход с новым паролем."),
                failMsg: "Извините, не получилось восстановить пароль. Пожалуйста, попробуйте повторить позже."
            }

            this._sendRequest(props)
            history.pushState(null, null, "/");
        }

        _sendRequest(props) {

            const {body, action, src, successAction, wrongAction, failMsg, options} = props

            Loader.request(body, this._path(action, src), options).then(response => {
                this._onResetBackdrop()
                if (response.status === 200) {
                    successAction(response["profile"])
                }
            }).catch(error => {
                this._onResetBackdrop()
                if (error["status"] === 401) {
                    if (wrongAction) wrongAction()
                } else {
                    console.error(error)
                    this._inform(failMsg)
                }
            })
            this._closeWnd()
            this._onSetBackdrop()
        }

        _onSetBackdrop() {
            this.setState({backdropOpen: true})
        }

        _onResetBackdrop() {
            this.setState({backdropOpen: false})
        }

        _inform(message) {
            this.setState({informerMessage: {desc: message}})
        }

        _closeWnd() {
            this.setState({
                modalWnd: undefined,
                warningMessage: undefined,
                informerMessage: null,
                backdropOpen: false,
                message: undefined
            })
        }

        _setProfile(profile) {
            this.state.activeService.activate()
            this.setState({profile: Profile.create(profile)})
        }

        _modalWnd({name, warningMessage, ...options}) {
            this.setState({modalWnd: name, warningMessage, ...options})
        }

        _path(action, src = '') {
            return `/api/access/${action}${src}`;
        }
    }

    UserMode.displayName = 'UserMode';
    return UserMode;
}

function Input(WrappedComponent) {

    class Input extends React.Component {

        values = {};

        state = {
            error: false
        };

        render() {
            const {error} = this.state;
            return (
                <WrappedComponent
                    inputProps={{
                        onLoad: this.handleLoad,
                        onChange: this.handleChange,
                        onConfirm: this.handleConfirm,
                        error
                    }}
                    {...this.props}/>
            )
        }

        handleLoad = (event) => {
            this.values = event.value;
        };

        handleChange = (event) => {
            const {name, value} = event;
            this.values[name] = value;
            if (this.validate()) this.setState({error: false})
        };

        handleConfirm = (event) => {
            const handle = this.props.onConfirm;
            if (handle && this.validate()) {
                handle({name: event.name, value: this.values})
            } else {
                this.setState({error: true})
            }
        };

        validate() {
            if ("email" in this.values && !this.values.email) {
                return false
            } else if ("password" in this.values && !this.values.password) {
                return false
            } else if ("newPassword" in this.values && !this.values.newPassword) {
                return false
            } else if ("name" in this.values && !this.values.name) {
                return false
            }
            return true
        }
    }

    Input.displayName = 'Input';
    return Input;
}

class Auth extends React.Component {

    constructor(props) {
        super(props);
        const {inputProps} = this.props;

        if (inputProps) {
            inputProps.onLoad({value: {email: null, password: null}})
        }
    }

    render() {
        const {open, warningMessage, message, inputProps} = this.props;
        const {error} = inputProps || {};
        return (
            <InputDialog open={open}
                         name="auth"
                         onClose={this.handleClose}
                         onConfirm={this.handleConfirm}
                         title="Вход"
                         message={message}
                         warningMessage={warningMessage}
                         confirmTitle="Войти"
                         actions={<>
                             <RegistrationButton onClick={this.handleClick}/>
                             <PasswordRestoreButton onClick={this.handleClick}/></>}>
                <EmailInput
                    autoFocus
                    error={error}
                    onChange={value => inputProps.onChange({name: "email", value})}
                    onConfirm={this.handleConfirm}
                    onClose={this.handleClose}/>
                <PasswordInput
                    error={error}
                    onChange={this.handleChange}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleClose}/>
                <OtherSource onClick={this.handleClick}>или войдите с помощью других сервисов</OtherSource>
            </InputDialog>);
    }

    handleChange = (event) => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onChange;
        if (handle) handle(event);
    };

    handleConfirm = () => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onConfirm;
        handle({name: 'auth'})
    };

    handleClose = () => {
        const handle = this.props.onCancel;
        handle()
    };

    handleClick = (event) => {
        const handle = this.props.onClick;
        handle(event)
    }
}

class EmailAddressInput extends React.Component {

    constructor(props) {
        super(props);
        const {inputProps} = this.props;

        if (inputProps) {
            inputProps.onLoad({value: {email: null}})
        }
    }

    render() {
        const message = 'Введите почту, указанную на сайте tetradkavkletochku.ru. На неё мы вышлем инструкции по ' +
            'восстановлению пароля. Обратите внимание, письмо может прийти в срок до 15 минут, возможно, раньше.' +
            'Это зависит от Вашего почтового провайдера.';
        const {open, warningMessage, inputProps} = this.props;
        const {error} = inputProps || {};
        return (
            <InputDialog open={open}
                         name="email"
                         onClose={this.handleClose}
                         onConfirm={this.handleConfirm}
                         title="Восстановление пароля"
                         message={message}
                         warningMessage={warningMessage}
                         confirmTitle="Восстановить">
                <EmailInput
                    autoFocus
                    error={error}
                    onChange={value => inputProps.onChange({name: "email", value})}
                    onConfirm={this.handleConfirm}
                    onClose={this.handleClose}/>
            </InputDialog>
        );
    }

    handleConfirm = () => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onConfirm;
        handle({name: 'email-address-input'})
    };

    handleClose = () => {
        const handle = this.props.onCancel;
        handle()
    };
}

class PasswordUpdate extends React.Component {

    constructor(props) {
        super(props);
        const {inputProps} = this.props;

        if (inputProps) {
            inputProps.onLoad({value: {password: null, newPassword: null}})
        }
    }

    render() {
        const {open, warningMessage, inputProps} = this.props;
        const {error} = inputProps || {};
        return (
            <InputDialog open={open}
                         name="password"
                         onClose={this.handleClose}
                         onConfirm={this.handleConfirm}
                         title="Изменение пароля"
                         warningMessage={warningMessage}
                         confirmTitle="Подтвердить"
                         actions={<>
                             <PasswordRestoreButton onClick={this.handleClick}/></>}>
                <PasswordInput
                    autoFocus
                    error={error}
                    onChange={this.handleChange}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleClose}
                    label="Старый пароль"/>
                <NewPasswordInput
                    error={error}
                    onChange={this.handleChange}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleClose}
                    label="Новый пароль"/>
            </InputDialog>
        );
    }

    handleChange = (event) => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onChange;
        if (handle) handle(event);
    };

    handleConfirm = () => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onConfirm;
        handle({name: 'password-update'})
    };

    handleClose = () => {
        const handle = this.props.onCancel;
        handle()
    };

    handleClick = (event) => {
        const handle = this.props.onClick;
        handle({name: event.name})
    }
}

class ProfileUpdate extends React.Component {

    constructor(props) {
        super(props);
        const {name, email} = this.props;
        const {inputProps} = this.props;

        if (inputProps) {
            inputProps.onLoad({value: {name, email}})
        }
    }

    render() {
        const {name, email} = this.props;
        const {open, warningMessage, inputProps} = this.props;
        const {error} = inputProps || {};
        return (
            <InputDialog open={open}
                         name="profile"
                         onClose={this.handleClose}
                         onConfirm={this.handleConfirm}
                         title="Редактирование профиля"
                         warningMessage={warningMessage}
                         confirmTitle="Изменить">
                <NameInput
                    autoFocus
                    error={error}
                    value={name}
                    onChange={this.handleChange}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleClose}/>
                <EmailInput
                    error={error}
                    defaultValue={email}
                    onChange={value => inputProps.onChange({name: "email", value})}
                    onConfirm={this.handleConfirm}
                    onClose={this.handleClose}/>
            </InputDialog>
        );
    }

    handleChange = (event) => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onChange;
        if (handle) handle(event);
    };

    handleConfirm = () => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onConfirm;
        handle({name: 'profile-update'})
    };

    handleClose = () => {
        const handle = this.props.onCancel;
        handle()
    };
}

class PasswordRestore extends React.Component {

    constructor(props) {
        super(props);
        const {inputProps} = this.props;

        if (inputProps) {
            inputProps.onLoad({value: {newPassword: null}})
        }
    }

    render() {
        const {open, inputProps} = this.props;
        const {error} = inputProps || {};
        return (
            <InputDialog open={open}
                         name="password-restore"
                         onClose={this.handleClose}
                         onConfirm={this.handleConfirm}
                         title="Восстановление пароля"
                         confirmTitle="Сменить пароль">
                <NewPasswordInput
                    autoFocus
                    error={error}
                    onChange={this.handleChange}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleClose}
                    label="Новый пароль"/>
            </InputDialog>
        );
    }

    handleChange = (event) => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onChange;
        if (handle) handle(event);
    };

    handleConfirm = () => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onConfirm;
        handle({name: 'password-restore'})
    };

    handleClose = () => {
        const handle = this.props.onCancel;
        handle()
    };
}

class Registration extends React.Component {

    constructor(props) {
        super(props);
        const {inputProps} = this.props;

        if (inputProps) {
            inputProps.onLoad({value: {name: null, email: null, newPassword: null}})
        }
    }

    render() {
        const {open, warningMessage, inputProps} = this.props;
        const {error} = inputProps || {};
        return (
            <InputDialog
                open={open}
                name="registration"
                onClose={this.handleClose}
                onConfirm={this.handleConfirm}
                title="Регистрация"
                warningMessage={warningMessage}
                confirmTitle="Подтвердить">
                <NameInput
                    autoFocus
                    error={error}
                    onChange={this.handleChange}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleClose}/>
                <EmailInput
                    error={error}
                    onChange={value => inputProps.onChange({name: "email", value})}
                    onConfirm={this.handleConfirm}
                    onClose={this.handleClose}/>
                <NewPasswordInput
                    error={error}
                    onChange={this.handleChange}
                    onConfirm={this.handleConfirm}
                    onCancel={this.handleClose}/>
                <OtherSource onClick={this.handleClick}>или зарегистрируйтесь с помощью других сервисов</OtherSource>
            </InputDialog>
        );
    }

    handleChange = (event) => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onChange;
        if (handle) handle(event);
    };

    handleConfirm = () => {
        const inputProps = this.props.inputProps || {};
        const handle = inputProps.onConfirm;
        handle({name: 'registration'})
    };

    handleClose = () => {
        const handle = this.props.onCancel;
        handle()
    };

    handleClick = (event) => {
        const handle = this.props.onClick;
        handle(event.name)
    }
}

class PasswordRestoreButton extends React.Component {

    render() {
        return (
            <Button
                onClick={this.handleClick}>
                Восстановить пароль
            </Button>
        )
    }

    handleClick = () => {
        const handle = this.props.onClick || function () {
        };
        handle({name: 'password-restore'})
    }
}

class RegistrationButton extends React.Component {

    render() {
        return (
            <Button onClick={this.handleClick}>Регистрация</Button>
        )
    }

    handleClick = () => {
        const handle = this.props.onClick || function () {
        };
        handle({name: 'registration'})
    }
}

class NameInput extends React.Component {

    errorMessage = 'Вы не ввели своё имя';

    state = {
        value: this.props.value || '',
        message: '',
        isError: false
    };

    render() {
        const {value} = this.state;
        const {autoFocus, onCancel} = this.props;
        let error = this.state.isError;
        let message = this.state.message;
        if (!error && this.props.error && !this.validate(value)) {
            error = true;
            message = this.errorMessage;
        }
        return (
            <FormTextField
                autoFocus={autoFocus}
                id="name"
                type="text"
                value={value}
                label="Ваше имя"
                error={error}
                helperText={message}
                onChange={this.handleChange}
                onBlur={this.handleFocusOut}
                onConfirm={this.handleConfirm}
                onClose={onCancel}
                required/>)
    }

    handleConfirm = () => {
        const handleConfirm = this.props.onConfirm;
        if (!this.validate(this.state.value)) {
            this.setError()
        } else {
            if (handleConfirm) handleConfirm();
        }
    };

    handleFocusOut = () => {
        if (!this.validate(this.state.value)) {
            this.setError()
        } else {
            this.resetError()
        }
    };

    handleChange = (value) => {
        const handle = this.props.onChange;
        this.setState({value});
        if (this.validate(value)) {
            handle({name: 'name', value});
            this.resetError()
        } else {
            handle({name: 'name', value: null});
        }
    };

    validate(value) {
        return value !== '';
    }

    setError() {
        this.setState({message: this.errorMessage, isError: true});
    }

    resetError() {
        this.setState({message: '', isError: false});
    }
}

class PasswordInput extends React.Component {

    errorMessage = 'Необходимо ввести пароль';

    state = {
        value: '',
        message: '',
        isError: false
    };

    render() {
        const {autoFocus, label, onCancel} = this.props;
        const {value} = this.state;
        let error = this.state.isError;
        let message = this.state.message;
        if (!error && this.props.error && !this.validate(value)) {
            error = true;
            message = this.errorMessage;
        }
        return (
            <FormTextField
                autoFocus={autoFocus}
                id="password"
                type="password"
                value={value}
                label={label || 'Пароль'}
                error={error}
                helperText={message}
                onChange={this.handleChange}
                onConfirm={this.handleConfirm}
                onBlur={this.handleFocusOut}
                onClose={onCancel}
                required/>
        )
    }

    handleConfirm = () => {
        const handleConfirm = this.props.onConfirm;
        if (!this.validate(this.state.value)) {
            this.setError()
        } else {
            if (handleConfirm) handleConfirm();
        }
    };

    handleFocusOut = () => {
        if (!this.validate(this.state.value)) {
            this.setError()
        } else {
            this.resetError()
        }
    };

    handleChange = (value) => {
        const handle = this.props.onChange;
        this.setState({value});
        if (this.validate(value)) {
            handle({name: 'password', value});
            this.resetError()
        } else {
            handle({name: 'password', value: null});
        }
    };

    validate(value) {
        return value !== '';
    }

    setError() {
        this.setState({message: this.errorMessage, isError: true});
    }

    resetError() {
        this.setState({message: '', isError: false});
    }
}

class NewPasswordInput extends React.Component {

    newPassMessage = 'Пароль не может быть меньше 8 символов. В пароле должна присутствовать хотя бы одна цифра и буква.';
    verPassMessage = 'Последовательность отличается от пароля';

    state = {
        newPassValue: '',
        verPassValue: '',
        newPassMessage: '',
        verPassMessage: '',
        newPassError: false,
        verPassError: false
    };

    render() {
        const {newPassValue, verPassValue} = this.state;
        const {label, autoFocus, onCancel} = this.props;
        let newPassError = this.state.newPassError;
        let verPassError = this.state.verPassError;
        let newPassMessage = this.state.newPassMessage;
        let verPassMessage = this.state.verPassMessage;
        if (!newPassError && this.props.error && !this.newPassValidate(newPassValue)) {
            newPassError = true;
            newPassMessage = this.newPassMessage;
        }
        if (!verPassError && this.props.error && !this.verPassValidate(verPassValue, newPassValue)) {
            verPassError = true;
            verPassMessage = this.verPassMessage;
        }
        return (<>
            <FormTextField
                autoFocus={autoFocus}
                autoComplete="new-password"
                id="new-password"
                type="password"
                value={newPassValue}
                label={label || 'Пароль'}
                error={newPassError}
                helperText={newPassMessage}
                onChange={this.newPassHandleChange}
                onConfirm={this.handleConfirm}
                onBlur={this.newPassHandleFocusOut}
                onClose={onCancel}
                required/>
            <FormTextField
                autoComplete="off"
                id="ver-password"
                type="password"
                value={verPassValue}
                label="Подтвердите пароль"
                error={verPassError}
                helperText={verPassMessage}
                onChange={this.verPassHandleChange}
                onConfirm={this.handleConfirm}
                onBlur={this.verPassHandleFocusOut}
                onFocus={this.verPassHandleFocusIn}
                onClose={onCancel}
                required/>
        </>)
    }

    handleConfirm = () => {
        const handleConfirm = this.props.onConfirm;
        const newPassCheck = this.newPassUpdateError();
        const verPassCheck = this.verPassUpdateError();
        if (newPassCheck && verPassCheck && handleConfirm) handleConfirm();
    };

    newPassHandleFocusOut = () => {
        this.newPassUpdateError();
        this.verPassUpdateError()
    };

    verPassHandleFocusOut = () => {
        this.verPassUpdateError()
    };

    verPassHandleFocusIn = () => {
        this.verPassResetError()
    };

    newPassHandleChange = (value) => {
        const handle = this.props.onChange;
        this.setState({newPassValue: value});
        if (this.verPassValidate(this.state.verPassValue, value)) {
            this.verPassResetError();
        }
        if (this.newPassValidate(value)) {
            this.newPassResetError();
            if (this.verPassValidate(this.state.verPassValue, value)) {
                handle({name: 'newPassword', value});
                this.verPassResetError()
            } else {
                handle({name: 'newPassword', value: null});
            }
        } else {
            handle({name: 'newPassword', value: null});
        }
    };

    verPassHandleChange = (value) => {
        const handle = this.props.onChange;
        this.setState({verPassValue: value});
        if (this.verPassValidate(value, this.state.newPassValue)) {
            this.verPassResetError();
            if (this.newPassValidate(this.state.newPassValue)) handle({
                name: 'newPassword',
                value: this.state.newPassValue
            });
        } else {
            handle({name: 'newPassword', value: null});
        }
    };

    newPassUpdateError() {
        if (this.newPassValidate(this.state.newPassValue)) {
            this.newPassResetError();
            return true;
        } else {
            this.newPassSetError();
            return false;
        }
    }

    verPassUpdateError() {
        const {verPassValue, newPassValue} = this.state;
        if (this.verPassValidate(verPassValue, newPassValue)) {
            this.verPassResetError();
            return true;
        } else {
            this.verPassSetError();
            return false;
        }
    }

    newPassValidate(value) {
        return value.length >= 8 && value.match(/\d/) && value.match(/\w/);
    }

    verPassValidate(verValue, newValue) {
        return verValue === newValue;
    }

    newPassSetError() {
        this.setState({newPassMessage: this.newPassMessage, newPassError: true});
    }

    verPassSetError() {
        this.setState({verPassMessage: this.verPassMessage, verPassError: true});
    }

    newPassResetError() {
        this.setState({newPassMessage: '', newPassError: false});
    }

    verPassResetError() {
        this.setState({verPassMessage: '', verPassError: false});
    }
}

class LoginProviders extends React.Component {

    render() {
        return (
            <Grid container item justify="space-around">
                <IconButton
                    className={'google-btn'}
                    onClick={() => this.handleClick({name: 'google'})}>
                    <SvgIcon viewBox="0 0 512 512">
                        <g>
                            <path
                                d="M42.4,145.9c15.5-32.3,37.4-59.6,65-82.3c37.4-30.9,80.3-49.5,128.4-55.2c56.5-6.7,109.6,4,158.7,33.4 c12.2,7.3,23.6,15.6,34.5,24.6c2.7,2.2,2.4,3.5,0.1,5.7c-22.3,22.2-44.6,44.4-66.7,66.8c-2.6,2.6-4,2.4-6.8,0.3 c-64.8-49.9-159.3-36.4-207.6,29.6c-8.5,11.6-15.4,24.1-20.2,37.7c-0.4,1.2-1.2,2.3-1.8,3.5c-12.9-9.8-25.9-19.6-38.7-29.5   C72.3,169,57.3,157.5,42.4,145.9z"
                                fill="#E94335"/>
                            <path
                                d="M126,303.8c4.3,9.5,7.9,19.4,13.3,28.3c22.7,37.2,55.1,61.1,97.8,69.6c38.5,7.7,75.5,2.5,110-16.8   c1.2-0.6,2.4-1.2,3.5-1.8c0.6,0.6,1.1,1.3,1.7,1.8c25.8,20,51.7,40,77.5,60c-12.4,12.3-26.5,22.2-41.5,30.8   c-43.5,24.8-90.6,34.8-140.2,31C186.3,501.9,133,477.5,89,433.5c-19.3-19.3-35.2-41.1-46.7-66c10.7-8.2,21.4-16.3,32.1-24.5   C91.6,329.9,108.8,316.9,126,303.8z"
                                fill="#34A853"/>
                            <path
                                d="M429.9,444.9c-25.8-20-51.7-40-77.5-60c-0.6-0.5-1.2-1.2-1.7-1.8c8.9-6.9,18-13.6,25.3-22.4   c12.2-14.6,20.3-31.1,24.5-49.6c0.5-2.3,0.1-3.1-2.2-3c-1.2,0.1-2.3,0-3.5,0c-40.8,0-81.7-0.1-122.5,0.1c-4.5,0-5.5-1.2-5.4-5.5   c0.2-29,0.2-58,0-87c0-3.7,1-4.7,4.7-4.7c74.8,0.1,149.6,0.1,224.5,0c3.2,0,4.5,0.8,5.3,4.2c6.1,27.5,5.7,55.1,2,82.9   c-3,22.2-8.4,43.7-16.7,64.5c-12.3,30.7-30.4,57.5-54.2,80.5C431.6,443.8,430.7,444.3,429.9,444.9z"
                                fill="#4285F3"/>
                            <path
                                d="M126,303.8c-17.2,13.1-34.4,26.1-51.6,39.2c-10.7,8.1-21.4,16.3-32.1,24.5C34,352.1,28.6,335.8,24.2,319   c-8.4-32.5-9.7-65.5-5.1-98.6c3.6-26,11.1-51,23.2-74.4c15,11.5,29.9,23.1,44.9,34.6c12.9,9.9,25.8,19.7,38.7,29.5   c-2.2,10.7-5.3,21.2-6.3,32.2c-1.8,20,0.1,39.5,5.8,58.7C125.8,301.8,125.9,302.8,126,303.8z"
                                fill="#FABB06"/>
                        </g>
                    </SvgIcon>
                </IconButton>
                <IconButton
                    onClick={() => this.handleClick({name: 'vkontakte'})}>
                    <VKIcon/>
                </IconButton>
            </Grid>
        )
    }

    handleClick = (event) => {
        this.props.onClick(event)
    }
}

function OtherSource(props) {
    return (
        <DialogContent dividers>
            <DialogContentText>{props.children}</DialogContentText>
            <LoginProviders onClick={props.onClick}/>
        </DialogContent>
    )
}

