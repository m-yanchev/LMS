import React from 'react'

export default class Loader {

    static async requestBySchema(props) {
        const {query, args, files} = props
        const body = Loader.makeBody({query, args, files})
        const response = await Loader.request(body)
        if (response.errors) throw new Error(response.errors[0])
        return response.data
    }

    static makeBody({query, args = {}, files}) {
        return {query, variables: JSON.stringify(args), files}
    }

    static request(body, path = "/api/data", options = {}) {
        const formData = new FormData();
        for (let key in body) {
            if (!body.hasOwnProperty(key)) continue;
            if (key === "files") {
                (body[key] || []).forEach(file => {
                    formData.append('file', file)
                })
            } else {
                formData.append(key, body[key]);
            }
        }
        return Loader._sendRequest(path, formData, options);
    }

    static async _sendRequest(path, formData, options = {}) {
        const fetchResponse = await fetch(path, {method: 'POST', body: formData, ...options});
        if (fetchResponse.status >= 500) throw new Error("Ошибка получения данных из сервера.")
        if (fetchResponse.status >= 400) {
            const e = new Error("Плохой запрос.")
            e["status"] = fetchResponse.status
            throw e
        }
        const response = await fetchResponse.json();
        return {status: fetchResponse.status, ...response};
    }

    static preparePoster(data) {
        const {poster, ...rest} = data
        return {files: [poster], ...rest}
    }
}
