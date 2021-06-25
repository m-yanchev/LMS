import React, {useState} from 'react';
import Loader from "../../WebClient/Loader";
import {Informer} from "../../common/components/Informer";

export default function ItemLoader(WrappedComponent) {

    return ItemLoaderComponent

    function ItemLoaderComponent(props) {
        try {
            const [error, setError] = useState()

            return <>
                <WrappedComponent loaderProps={{insert, update, remove, replace}} {...props}/>
                <Informer message={error && {desc: error, title: "Ошибка"}} onClose={() => setError()}/>
            </>

            async function update(props) {
                const {content, name, id, key, restore} = props
                try {
                    const {files, ...rest} = prepareContent({content, key, name})
                    const mutation = `mutation Update${name}($item: ${name}ItemInput!) {update${name}(item: $item)}`
                    const args = {item: {id, ...rest}}
                    const props = {query: mutation, args, files}
                    const ok = (await Loader.requestBySchema(props))[`update${name}`]
                    if (!ok) handleFail({restore, message: "Элемент не был изменен по непонятным причинам"})
                } catch (error) {
                    console.error("props = %o, error = %o", props, error)
                    handleFail({restore, message: "Ошибка на сервере. Элемент не был изменен"})
                }
            }

            async function insert(props) {
                const {content, number, parentId, name, restore, setKeys} = props
                try {
                    const {files, ...rest} = prepareContent({content, name})
                    const mutation = `mutation Insert${name}($item: ${name}ItemInserted!) {
                        insert${name}(item: $item) {
                            id
                            key
                        }
                    }`
                    const args = {item: {parentId, number, ...rest}}
                    const props = {query: mutation, args, files}
                    const item = (await Loader.requestBySchema(props))[`insert${name}`]
                    if (!item) {
                        handleFail({restore, message: "Элемент не был вставлен по непонятным причинам"})
                    } else {
                        setKeys({...item});
                    }
                } catch (error) {
                    console.error("props = %o, error = %o", props, error)
                    handleFail({restore, message: "Ошибка на сервере. Элемент не был вставлен"})
                }
            }

            async function remove(props) {
                const {name, id, restore} = props
                try {
                    const mutation = `mutation Remove${name}($id: ID!) {
                        remove${name}(id: $id) {
                            ok
                            message
                        }
                    }`
                    const props = {query: mutation, args: {id}}
                    const {ok, message} = (await Loader.requestBySchema(props))[`remove${name}`]
                    if (!ok) handleFail({restore, message: "Элемент не был удален." + (message ? " " + message : "")})
                } catch (error) {
                    console.error("props = %o, error = %o", props, error)
                    handleFail({restore, message: "Ошибка на сервере. Элемент не был удален"})
                }
            }

            async function replace(props) {
                const {name, restore, releaseStory, ...record} = props
                try {
                    const mutation = `mutation Replace${name}($id: ID!, $parentId: ID!, $number: Int!) {
                        replace${name}(id: $id, parentId: $parentId, number: $number)
                    }`
                    const props = {query: mutation, args: {...record}}
                    const ok = (await Loader.requestBySchema(props))[`replace${name}`]
                    if (!ok) {
                        handleFail({restore, message: "Элемент не был перемещён по непонятным причинам."})
                    } else {
                        releaseStory()
                    }
                } catch (error) {
                    console.error("props = %o, error = %o", props, error)
                    handleFail({restore, message: "Ошибка на сервере. Элемент не был перемещен"})
                }
            }

            function prepareContent({content, key, name}) {
                const {imageList, poster, ...rest} = content;
                if (imageList) {
                    const files = [];
                    let fileIndex = 0;
                    const imageItems = imageList.map(item => {
                        if (item.content.type === 'server') {
                            return {type: item.content.type, index: item.content.index}
                        } else if (item.content.type === 'client') {
                            files.push(item.content.fileData);
                            return {type: item.content.type, index: fileIndex++}
                        } else throw new Error('"imageList.type" is expected to be "server" or "client" string');
                    });
                    return {imageMap: {imageItems, key}, files, ...rest}
                } else if (name === "VideoLesson") {
                    return {
                        files: poster ? [poster] : undefined,
                        key,
                        ...rest
                    }
                } else {
                    return content;
                }
            }

            function handleFail({restore, message}) {
                restore()
                setError(message)
            }

        } catch (error) {
            console.error("props = %o, error = %o", props, error)
        }
    }
}
