// @flow

import {DateTime} from "../rules/DateTime";
import type {UploadingAuthResponse} from "../../server/ApolloServer/Files";
import {KEY_ID} from "../../server/YandexCloudObjectStorage/accessConsts";
import {ACCESS_ALGORITHM, REGION_NAME, REQUEST_NAME, SERVICE_NAME} from "../../server/YandexCloudObjectStorage";

const HOST = "https://storage.yandexcloud.net"

type Put = Props => Promise<void>
type Props = {
    folder: string,
    id: string,
    uploadingAuths: Array<UploadingAuthResponse>,
    files: Array<File>
}

export class FileStorageClient {

    static put: Put = async props => {
        const {folder, id, uploadingAuths, files} = props
        const results = await Promise.all(files.map((file, i) => {
            const {timeStamp, signature, policy} = uploadingAuths[i]
            const date = DateTime.create(timeStamp)
            const params = [
                {name: "key", value: [id, file.name].join("/")},
                {name: "Content-Type", value: "image/jpeg"},
                {name: "policy", value: policy},
                {name: "x-amz-signature", value: signature},
                {name: "x-amz-algorithm", value: ACCESS_ALGORITHM},
                {
                    name: "x-amz-credential",
                    value: [KEY_ID, date.yyyymmdd, REGION_NAME, SERVICE_NAME, REQUEST_NAME].join("/")
                },
                {name: "x-amz-date", value: date.iso8601WithoutDiv},
                {name: "file", value: file},
            ]
            const formData = new FormData()
            params.forEach(param => formData.set(param.name, param.value))
            return fetch(HOST + "/" + folder, {method: "post", body: formData})
        }))
        if(results.find(res => !res.ok)) throw new Error("Ошибка отправки файла с решением в хранилище")
    }
}