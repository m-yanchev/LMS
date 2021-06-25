import React, {Component} from 'react'
import styles from './styles.css'
import {getComponentClassName} from "../../../../common/helpers";

class Button extends Component {
    render() {
        const props = this.props;
        const type = props.type;
        const title = props.title || '';
        const onClick = props.onClick || function () {
        };
        let buttonView;
        switch (type) {
            case 'update':
                buttonView = (
                    <svg width="20" height="20">
                        <line className={styles.stroke} strokeWidth="2" x1="15" y1="3" x2="8" y2="10"/>
                        <line className={styles.stroke} strokeWidth="1" x1="8" y1="10" x2="5" y2="13"/>
                        <line className={styles.stroke} strokeWidth="1" x1="4" y1="16" x2="18" y2="16"/>
                    </svg>
                );
                break;
            case 'remove':
                buttonView = (
                    <svg width="20" height="20">
                        <line className={styles.stroke} strokeWidth="2" x1="5" y1="5" x2="15" y2="15"/>
                        <line className={styles.stroke} strokeWidth="2" x1="15" y1="5" x2="5" y2="15"/>
                    </svg>
                );
                break;
            case 'cancel' :
                buttonView = 'Отмена';
                break;
            case 'ok' :
            default:
                buttonView = 'oк'
        }
        return (
            <button
                className={getComponentClassName(styles, this.props.contextStyles, type)}
                id={type}
                type={'button'}
                title={title}
                onClick={onClick}
            >
                {buttonView}
            </button>
        )
    }
}

export default Button