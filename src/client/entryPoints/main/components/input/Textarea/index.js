import React from 'react'
import styles from './styles.css'
import {changeSubString, getComponentClassName} from "../../../../../../depricated/common/helpers";
import {LINE_BREAK} from "../../../constants";

class Textarea extends React.Component {

    state = {
        value: changeSubString(this.props.value || '', LINE_BREAK,'\n')
    };

    render() {
        const { name, options, contextStyles }  = this.props;
        const { rows, cols, autoFocus } = options || {};
        const label = this.props.label;
        return (
            <div className={ getComponentClassName(styles, contextStyles, 'textarea')} >
                <label htmlFor={ name }>{ label }</label>
                <textarea
                    id={name}
                    value={this.state.value}
                    onChange={this.changeValue}
                    rows={ rows || 3 }
                    cols={ cols || 30 }
                    autoFocus={autoFocus}
                />
            </div>
        )
    }

    changeValue = event => {
        const { onChange, name } = this.props;
        const value = event.target.value;
        this.setState({ value } );
        onChange( name, changeSubString( value,'\n', LINE_BREAK) );
    }
}

export default Textarea