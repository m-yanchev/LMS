import React from 'react'
import styles from "./styles.css"
import Canvas from '../Canvas'
import Img from '../Img'
import {getComponentClassName} from "../../../../../../depricated/common/helpers";

export default class ImageBox extends React.Component {

    constructor(props) {
        super(props);

        const {isNumber} = this.props;
        if (isNumber) {
            const {number} = this.props;
            if (typeof number !== 'number') throw new Error('Expected number prop as number');
            this.altComponent = <p>{`Рисунок ${number}`}</p>;
        }

        this.wrapperImageRef = React.createRef();

        this.state = {
            isLoaded: false,
        };
    }

    componentDidMount() {
        const {isNaturalSize} = this.props;
        if (!isNaturalSize) this.setCanvasSize();
    }

    render() {

        const {image, isResize, isDateId} = this.props;
        let imageComponent;
        if (image) {
            if (typeof image !== 'object') throw new Error('Expected image prop as object');
            imageComponent = <Canvas data={image} size={this.canvasSize}/>
        } else {
            const {rootKey, path, index} = this.props;
            if (typeof path !== 'string') throw new Error('Expected path prop as string');
            if (typeof rootKey !== 'string') throw new Error('Expected taskKey prop as string');
            if (index !== undefined && typeof index !== 'number') throw new Error('Expected index prop as number');
            imageComponent =
                <Img
                    path={path}
                    rootKey={rootKey}
                    index={index}
                    size={this.canvasSize}
                    isResize={isResize}
                    isDateId={isDateId}
                />
        }

        const {isNaturalSize, contextStyles} = this.props;

        return (
            <div className={getComponentClassName(contextStyles, styles, 'image-box')}>
                <div ref={this.wrapperImageRef}>
                    {(this.state.isLoaded || isNaturalSize) && imageComponent}
                </div>
                {this.altComponent}
            </div>
        )
    }

    setCanvasSize = () => {
        const wrapperImageElem = this.wrapperImageRef.current;
        this.canvasSize = {
            w: wrapperImageElem.clientWidth,
            h: wrapperImageElem.clientHeight,
        };

        this.setState({isLoaded: true})
    };
}