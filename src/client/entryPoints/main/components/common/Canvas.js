import React from 'react'
import {getImageBoxIntroCanvas} from '../../../../../depricated/common/helpers'

class Canvas extends React.Component {

    ref = React.createRef();

    componentDidMount() {
        this.loadImage();
    }

    componentDidUpdate() {
        this.loadImage();
    }

    render() {
        return <canvas className={'image'} ref={this.ref} style={{position: 'relative'}}/>
    }

    loadImage() {
        try {
            const canvasElem = this.ref.current;

            createImageBitmap(this.props.data).then(image => {
                const imageSize = {
                    w: image.width,
                    h: image.height
                };

                const {x, y, w, h} = this.props.size ?
                    getImageBoxIntroCanvas(this.props.size, imageSize) :
                    {x: 0, y: 0, w: imageSize.w, h: imageSize.h};

                canvasElem.style.top = `${y}px`;
                canvasElem.style.left = `${x}px`;
                canvasElem.width = w;
                canvasElem.height = h;

                const ctx = canvasElem.getContext('2d');
                ctx.drawImage(image, 0, 0, w, h)
            })
        } catch (e) {
            console.error(e)
        }
    }
}

export default Canvas