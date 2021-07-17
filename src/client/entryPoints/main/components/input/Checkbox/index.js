import React from 'react'
import styles from "./styles.css";
import {getComponentClassName} from "../../../../../../depricated/common/helpers";

class Checkbox extends React.Component {

    state = {
        checked: this.props.value
    };

    render() {
        const {name, label, contextStyles} = this.props;
        return (
            <div className={getComponentClassName(styles, contextStyles, 'checkbox')}>
                <label htmlFor={name}>{label}</label>
                <input id={name} type={'checkbox'} onChange={this.changeValue} checked={this.state.checked}/>
            </div>
        )
    }

    changeValue = event => {
        const {onChange} = this.props;
        const name = this.props.name;
        onChange(name, event.target.checked);
        event.persist();
        this.setState(() => ({checked: event.target.checked}))
    }
}

export default Checkbox