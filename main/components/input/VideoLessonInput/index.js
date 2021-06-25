import React from 'react'
import styles from './styles.css'
import ErrorBoundary from "../../../../ReactApp/smartComponents/ErrorBoundary";
import HeadingAliasField from "../../HeadingAliasField";
import ConfirmButtons from "../../modal/ConfirmButtons";
import TextInput from "../TextInput";
import ImageField from "../../ImageField";

export default class VideoLessonInput extends React.Component {

    render() {
        const {values, parentKey} = this.props;
        this.values = values;
        const {heading, alias, videoId, poster} = this.values;
        return (
            <ErrorBoundary>
                <div className={styles['heading-input']}>
                    <HeadingAliasField
                        values={{heading, alias}}
                        onChange={this.handleChange}
                        onConfirm={() => this.props.onConfirm(true, this.values)}
                        onClose={() => this.props.onConfirm(false)}
                    />
                    <TextInput
                        contextStyles={styles}
                        name={'videoId'}
                        label={'Идентификатор видео'}
                        value={videoId}
                        options={{size: 50}}
                        onChange={this.handleChange}
                        onKeyUp={this.handleKeyUp}
                    />
                    <ImageField
                        file={poster}
                        id={parentKey}
                        prefix={"video"}
                        label={'Обложка'}
                        onChange={this.handleChange}/>
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