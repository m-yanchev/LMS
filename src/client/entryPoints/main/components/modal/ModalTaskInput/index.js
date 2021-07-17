import React from 'react'
import styles from './styles.css'
import Modal from '../../../HOC/Modal'
import Input from '../Input'
import Textarea from "../../input/Textarea";
import Checkbox from "../../input/Checkbox";
import Images from '../../Images'
import TextInput from "../../input/TextInput";

class _ModalTaskInput extends React.Component {

    constructor(props) {
        super(props);
        const textareaCols = 190;
        const inputSize = 212;

        const {parentKey, avatarRootDiv} = this.props;
        if(avatarRootDiv && typeof avatarRootDiv !== 'object')
            throw new TypeError('avatarRootDiv is not an object');

        this.fields = [{
            name: 'isExample',
            component: Checkbox,
            label: 'Образец типа',
            value: props.content && props.content.isExample !== undefined ?
                props.content.isExample :
                props.defaultValues && props.defaultValues.isExample !== undefined ?
                    props.defaultValues.isExample : false
        }, {
            name: 'desc',
            component: Textarea,
            label: 'Индивидуальная часть задания',
            value: (this.props.content && this.props.content.desc) || '',
            options: {rows: 2, cols: textareaCols, autoFocus: true}
        }, {
            name: 'src',
            component: TextInput,
            label: 'Источник',
            value: (this.props.content && this.props.content.src) || '',
            options: {size: inputSize}
        }, {
            name: 'srcNumb',
            component: TextInput,
            label: 'Номер в источнике',
            value: (this.props.content && this.props.content.srcNumb) || '',
            options: {size: inputSize}
        }, {
            name: 'solution',
            component: Textarea,
            label: 'Решение',
            value: (this.props.content && this.props.content.solution) || '',
            options: {rows: 5, cols: textareaCols}
        }, {
            name: 'answer',
            component: Textarea,
            label: 'Ответ',
            value: (this.props.content && this.props.content.answer) || '',
            options: {rows: 1, cols: textareaCols}
        }, {
            name: 'imageList',
            component: Images,
            label: 'Рисунки к задаче',
            options: {key: parentKey, avatarRootDiv}
        }];

        this.values = {};
        this.fields.forEach(field => {
            this.values[field.name] = field.value
        });
    }

    render() {
        const message = this.props.message;
        const ModalInput = Modal(Input, this.props.modalRootDiv);
        return (
            <ModalInput
                contextStyles={styles}
                message={message}
                fields={this.fields}
                onConfirm={this.handleConfirm}
                onChange={this.handleChange}
            />)
    }

    handleChange = (values) => {
        this.values = values
    };

    handleConfirm = (isConfirm) => {
        const {onConfirm} = this.props;
        if ( typeof onConfirm !== 'function' ) throw new Error('Expected to be used onConfirm handler');
        onConfirm(isConfirm, this.values)
    }
}

export default function modalTaskInput(options = {}) {
    const {isExample, avatarRootDiv} = options;
    if(avatarRootDiv && typeof avatarRootDiv !== 'object')
        throw new TypeError('avatarRootDiv is not an object');
    return props =>
        <_ModalTaskInput
            defaultValues={{isExample: isExample !== undefined ? isExample : false}}
            avatarRootDiv={avatarRootDiv}
            {...props}
        />
}