import React from 'react'
import styles from './styles.css'
import ComponentListView from "../ComponentListView";

class ImagesView extends React.Component {

    render() {

        const {itemProps, avatarRootDiv, id} = this.props;

        return (
            <div id={id}>
                <ComponentListView
                    contextStyles={styles}
                    itemProps={itemProps}
                    avatarRootDiv={avatarRootDiv}
                />
            </div>
        )
    }
}

export default ImagesView