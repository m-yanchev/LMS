import React from "react";
import {EditableGrid} from "./editable/EditableLists";
import {CONTENT_IMAGE_PATH} from "../constants";
import ItemComponents from "../HOC/ItemComponents";
import HandleDragAndDrop from "../HOC/HandleDragAndDrop";
import fileOpenWnd from "../HOC/fileOpenWnd";
import WrapComponentFunctionStack from "../HOC/WrapComponentFunctionStack";
import {ImagesData} from "./editable/EditableItems";
import {BackDropDataRequest} from "../../../../depricated/common/components/DataRequest";

export default function Images(props) {

    const {options, name, onChange} = props
    const {key, avatarRootDiv} = options
    const path = [CONTENT_IMAGE_PATH, "tasks"].join('/');

    if (key) {
        const query = `query ImageCount($key: ID!) {imageCount(key: $key)}`

        return <BackDropDataRequest query={query}
                                     args={{key}}
                                     WrappedComponent={ImageList}/>
    } else {
        return <ImageList content={0}/>
    }

    function ImageList(props) {

        const {imageCount} = props.content
        const contentData = new ImagesData({imageCount, key})

        const listFuncStack = [{
            name: ItemComponents,
            otherProps: {
                path,
                onChange: handleChange,
                noCopying: true,
                isEditMode: true
            }
        }, {
            name: HandleDragAndDrop,
            otherProps: {avatarRootDiv}
        }, {
            name: fileOpenWnd
        }];
        const WrapperComponent = WrapComponentFunctionStack(EditableGrid, listFuncStack)

        return <WrapperComponent contentData={contentData} editableItemProps={{direction: "column"}}/>
    }

    function handleChange(contentList) {
        onChange(name, contentList);
    }
}