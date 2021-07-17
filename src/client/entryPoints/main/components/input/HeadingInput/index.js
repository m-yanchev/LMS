import React from 'react'
import styles from './styles.css'
import ErrorBoundary from "../../../../../ReactApp/smartComponents/ErrorBoundary";
import ConfirmButtons from "../../modal/ConfirmButtons";
import HeadingAliasField from "../../HeadingAliasField";

export default class HeadingInput extends React.Component {

    render() {
        const {values} = this.props;
        this.values = values;
        return (
            <ErrorBoundary>
                <div className={styles['heading-input']}>
                    <HeadingAliasField
                        values={values}
                        onChange={this.handleChange}
                        onConfirm={() => this.props.onConfirm(true, this.values)}
                        onClose={() => this.props.onConfirm(false)}
                    />
                    <ConfirmButtons contextStyles={styles} onClick={this.handleClick} onKeyUp={this.handleKeyUp}/>
                </div>
            </ErrorBoundary>
        )
    }

    handleChange = (name, value) => {
        this.values[name] = value;
    };

    handleClick = (event) => {
        const {onConfirm} = this.props;
        onConfirm(event.name === 'ok', this.values);
    };

    handleKeyUp = (event) => {
        const {onConfirm} = this.props;
        switch (event.key) {
            case 'Enter' :
                onConfirm(true, this.values);
                break;
            case 'Escape' :
                onConfirm(false);
                break;
            default:
        }
    };
}