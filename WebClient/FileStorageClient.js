// @flow

import {DateTime} from "../rules/DateTime";

const HOST = "https://storage.yandexcloud.net"
const REGION_NAME = "ru-central1"
const SERVICE_NAME = "s3"
const LIVE_TIME_COUNT_SEC = 3600
const ACCESS_ALGORITHM = "AWS4-HMAC-SHA256"
const SIGNED_HEADERS = "host;x-amz-algorithm;x-amz-expires;x-amz-signed-headers;x-amz-signature;x-amz-date;x-amz-credential"

type Put = Props => Promise<void>
type Props = {
    storageName: string,
    key: string,
    accessData: AccessData,
    files: Array<File>
}
type AccessData = {
    signature: string,
    date: DateTime
}

export class FileStorageClient {

    static put: Put = props => {
        const {storageName, key, accessData, files} = props
        const startURL = [HOST, storageName, key].join("/")
        const credential = [accessData.key, accessData.date.yyyymmdd, REGION_NAME, SERVICE_NAME, "aws4_request"].join("/")
        const params = [
            `X-Amz-Algorithm=${ACCESS_ALGORITHM}`,
            `X-Amz-Expires=${LIVE_TIME_COUNT_SEC}`,
            `X-Amz-SignedHeaders=${SIGNED_HEADERS}`,
            `X-Amz-Signature=${accessData.signature}`,
            `X-Amz-Date=${accessData.date.iso8601}`,
            `X-Amz-Credential=${credential}`
        ].join("&")
    }
}