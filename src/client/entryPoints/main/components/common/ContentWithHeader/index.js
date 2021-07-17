import React from 'react'
import styles from './styles.css'
import Content from "../Content";
import {getComponentClassName} from "../../../../../../depricated/common/helpers";

class ContentWithHeader extends React.Component {
    render() {
        const {header, taskKey, imageList, model, children, contextStyles} = this.props;
        return (
            <div className={getComponentClassName(styles, contextStyles, 'content-with-header')}>
                <h5 className={getComponentClassName(styles, contextStyles, 'content-with-header-header')}>
                    {header}
                </h5>
                <Content contextStyles={contextStyles} taskKey={taskKey} model={model} imageList={imageList}>
                    {children}
                </Content>
            </div>
        )
    }
}

export default ContentWithHeader