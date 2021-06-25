import React from 'react'
import styles from './styles.css'
import {getImageBoxIntroCanvas} from '../../../../common/helpers'
import {IMAGE_PREFIX, IMAGE_SUFFIX} from "../../../../common/constants";

class Img extends React.Component {

    imgRef = React.createRef();

    render() {

        const {path, rootKey, index, isAlt, isDateId, isResize} = this.props;
        const alt = isAlt ? `Рисунок ${index + 1}` : null;
        const imgId = rootKey + (index !== undefined ? '_' + index : '');

        return (
            <img
                className={styles.root}
                style={isResize && {position: 'relative', display: 'none'}}
                ref={this.imgRef}
                src={[path, `${IMAGE_PREFIX}${imgId}.${IMAGE_SUFFIX}${isDateId ? `?${new Date().getTime()}` : ''}`].join('/')}
                alt={alt}
                onLoad={isResize && this.resizeImage}
            />
        )
    }

    resizeImage = () => {
        try {
            const imgElem = this.imgRef.current;

            const imageSize = {
                w: imgElem.naturalWidth,
                h: imgElem.naturalHeight
            };

            const {x, y, w, h} = this.props.size ?
                getImageBoxIntroCanvas(this.props.size, imageSize) :
                {x: 0, y: 0, w: imageSize.w, h: imageSize.h};

            imgElem.style.top = `${y}px`;
            imgElem.style.left = `${x}px`;
            imgElem.style.display = 'block';
            imgElem.width = w;
            imgElem.height = h;

        } catch (e) {
            console.error(e)
        }
    }
}

export default Img