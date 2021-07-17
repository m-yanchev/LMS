import React from 'react'
import styles from "./styles.css";
import {getComponentClassName} from "../../../../../../depricated/common/helpers";

class TextInput extends React.Component {

    state = {
        value: this.props.value || ''
    };

    render() {
        const {name, label, contextStyles, options, onKeyUp} = this.props;
        if (typeof onKeyUp !== 'function') throw new Error('Expected "onKeyUp" to be a function');

        const {size, autoFocus} = options || {};
        const {value} = this.state;
        return (
            <div className={getComponentClassName(styles, contextStyles, 'text-input')}>
                <label htmlFor={name}>{label}</label>
                <input
                    onKeyUp={onKeyUp}
                    id={name}
                    name={name}
                    type='text'
                    value={value}
                    size={size}
                    autoComplete="on"
                    onChange={this.changeValue}
                    autoFocus={autoFocus}/>
            </div>
        )
    }

    changeValue = event => {
        const {onChange, name} = this.props;
        const value = event.target.value;
        this.setState({value});
        onChange(name, value);
    }
}

export default TextInput