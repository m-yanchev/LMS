import React, {Component} from 'react'
import styles from './styles.css'
import ItemComponents from '../../../HOC/ItemComponents'
import fileOpenWnd from '../../../HOC/fileOpenWnd'
import {CONTENT_IMAGE_PATH} from '../../../constants'
import WrapComponentFunctionStack from "../../../HOC/WrapComponentFunctionStack";
import ImagesView from "../../views/ImagesView";
import HandleDragAndDrop from "../../../HOC/HandleDragAndDrop";
import {getComponentClassName} from "../../../../common/helpers";
import ErrorBoundary from "../../../../ReactApp/smartComponents/ErrorBoundary";

class Images extends Component {

    constructor(props) {
        super(props);
        const {options, name} = this.props;
        const {key, model, avatarRootDiv} = options || {};
        const path = [CONTENT_IMAGE_PATH, model].join('/');
        if(!avatarRootDiv || typeof avatarRootDiv !== 'object')
            throw new TypeError('avatarRootDiv is not an object');

        const HOCData = [{
            name: ItemComponents,
            otherProps: {
                contextStyles: styles,
                path,
                key: key,
                onChange: this.handleChange,
                noCopying: true,
                isEditMode: true
            }
        }, {
            name: HandleDragAndDrop,
            otherProps: {avatarRootDiv}
        }, {
            name: fileOpenWnd
        }];

        const Component = WrapComponentFunctionStack(ImagesView, HOCData);
        if (key) {
            this.component = <Component/>;
        } else {
            this.component = <Component id={name} content={{view: 'images'}}/>;
        }
    }

    render() {
        const {name, label, contextStyles} = this.props;

        return (
            <ErrorBoundary>
                <div className={getComponentClassName(styles, contextStyles, 'images')}>
                    {label && <label htmlFor={name}>{label}</label>}
                    {this.component}
                </div>
            </ErrorBoundary>
        )
    }

    handleChange = (contentList) => {
        const {onChange, name} = this.props;
        if (typeof onChange !== 'function') throw new Error('"onChange" is not function');
        if (typeof name !== 'string') throw new Error('"name" is not string');
        if (typeof contentList !== 'object') throw new Error('"contentList" is not object');
        onChange(name, contentList);
    }
}

export default Images