import React, {Component} from 'react'
import styles from './styles.css'
import {getComponentClassName} from "../../../../../../depricated/common/helpers";

class InsertBox extends Component {

    render() {

        const {className, contextStyles, onClick} = this.props;

        return (
            <div
                className={getComponentClassName(styles, contextStyles, 'insert-box', className)}
                id={'insert-box'}
                onClick={onClick}
                onContextMenu={e => e.preventDefault()}
            >
                <svg width="20" height="20">
                    <line className={styles.stroke} strokeWidth="2" x1="10" y1="0" x2="10" y2="20"/>
                    <line className={styles.stroke} strokeWidth="2" x1="0" y1="10" x2="20" y2="10"/>
                </svg>
            </div>
        )
    }
}

export default InsertBox