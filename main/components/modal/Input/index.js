import React from 'react'
import styles from './styles.css'
import ConfirmButtons from "../ConfirmButtons.js";
import ErrorBoundary from "../../../../ReactApp/smartComponents/ErrorBoundary";

export default class Input extends React.Component {

    constructor(props) {
        super(props);
        this.values = this.getValuesFromProps();
    }

    render() {
        const {onKeyUp, contextStyles} = this.props;
        const inputFieldComponents = this.getInputFieldComponentsFromProps();
        return (
            <ErrorBoundary>
                <div className={styles.root}>
                    {inputFieldComponents}
                    <ConfirmButtons contextStyles={contextStyles} onClick={this.handleClick} onKeyUp={onKeyUp}/>
                </div>
            </ErrorBoundary>
        )
    }

    handleClick = (event) => {
        const {onConfirm} = this.props;
        onConfirm(event.name === 'ok');
    };

    getValuesFromProps() {
        const values = {};
        this.props.fields.forEach(field => values[field.name] = field.value);
        return values
    };

    getInputFieldComponentsFromProps() {
        const {fields, contextStyles, onKeyUp} = this.props;
        const components = [];
        fields.forEach(field => {
            const Field = field.component;
            const value = this.values[field.name];
            components.push(
                <Field
                    onKeyUp={onKeyUp}
                    contextStyles={contextStyles}
                    key={field.name + value}
                    name={field.name}
                    label={field.label}
                    value={value}
                    options={field.options}
                    onChange={this.handleChangeField}/>)
        });
        return components
    }

    handleChangeField = (name, value) => {
        this.values[name] = value;
        const {onChange} = this.props;
        if (onChange) onChange(this.values)
    }
}