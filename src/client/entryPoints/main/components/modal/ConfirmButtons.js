import React, {Component} from 'react'
import Buttons from "../common/Buttons";

class ConfirmButtons extends Component {

    render() {
        const {onKeyUp} = this.props;
        if (typeof onKeyUp !== 'function') throw new Error('Expected "onKeyUp" to be a function');
        return (
            <div onKeyUp={onKeyUp}>
                <Buttons
                    contextStyles={this.props.contextStyles}
                    onClick={this.handle}
                    data={[{
                        type: 'cancel',
                        title: 'Нажмите для отмены.'
                    }, {
                        type: 'ok',
                        title: 'Нажмите для подтверждения.'
                    }]}
                />
            </div>
        )
    }

    handle = (type, event) => {
        this.props.onClick(type, event);
    }
}

export default ConfirmButtons