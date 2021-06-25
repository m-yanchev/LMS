import React, {Component} from 'react'
import styles from './styles.css'
import Button from "../../common/Button";

class Inform extends Component {
    render() {
        const { onClick, onKeyUp } = this.props;
        if (typeof onKeyUp !== 'function') throw new Error('Expected "onKeyUp" to be a function');
        if (typeof onClick !== 'function') throw new Error('Expected "onKeyUp" to be a function');
        return (
            <div className={ styles.root } onKeyUp={onKeyUp}>
                <Button contextStyles={styles} type='ok' onClick={event => onClick({},event)}/>
            </div>
        )
    }
}

export default Inform