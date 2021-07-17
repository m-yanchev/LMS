import React from 'react'

class Composition extends React.Component {

    render() {

        const {id, className, onClick, items} = this.props;
        const handleClick = onClick || function () {
        };

        return (
            <div id={id} className={className} onClick={handleClick}>
                {items}
            </div>
        )
    }
}

export default Composition