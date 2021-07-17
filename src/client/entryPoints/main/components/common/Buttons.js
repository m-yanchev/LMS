import React, {Component} from 'react'
import Button from './Button'
import {getComponentClassName} from "../../../../../depricated/common/helpers";

class Buttons extends Component {
    render() {
        const {className, contextStyles, data, onClick} = this.props;
        if (!data) throw 'Expected to be used data props';

        const buttonComponents = data && data.map(button =>
            <Button
                contextStyles={contextStyles}
                key={button.type}
                type={button.type}
                title={button.title}
                onClick={event => {
                    onClick({name: button.type}, event)
                }}
            />
        );

        return (<>
                {buttonComponents &&
                <div
                    className={
                        getComponentClassName(
                            null,
                            contextStyles,
                            'buttons',
                            className)}>
                    {buttonComponents}
                </div>} </>
        )
    }
}

export default Buttons