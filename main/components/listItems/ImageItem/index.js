import React from 'react'
import styles from "./styles.css"
import {ContentList, ContentItemType} from "../../../ContentData"
import ImageBox from "../../common/ImageBox";

export class ImageComponent extends React.Component {

    render() {
        const {content} = this.props;
        if (typeof content !== 'object') throw new Error('Expected content prop as object');
        const {type} = content;
        if (type === 'client') {
            const {fileData} = content;
            if (typeof fileData !== 'object')
                throw new Error('In the "content" object, a "fileData" field of type object is expected');
            return <ImageBox image={fileData} contextStyles={styles}/>
        } else if (type === 'server') {
            const {index} = content;
            const {parentId, path} = this.props;
            if (typeof path !== 'string')
                throw new Error('Expected path prop as string');
            if (typeof parentId !== 'string')
                throw new Error('Expected parentId prop as string');
            if (typeof index !== 'number')
                throw new Error('In the "content" object, a "index" field of type object is expected');
            return (
                <ImageBox
                    rootKey={parentId}
                    path={path}
                    index={index}
                    contextStyles={styles}
                    isResize
                    isDateId
                />
            )
        } else throw new Error('Expected value of type "server" or "client"');
    }
}

export class ImagesData extends ContentList {

    constructor(count) {

        const items = [];
        for (let index = 0; index < count; index++) {
            items.push({id: String(index), content: {index, type: 'server'}});
        }

        const types = [new ContentItemType({name: 'Image', Component: ImageComponent})];

        super(null, types, items);
    }
}