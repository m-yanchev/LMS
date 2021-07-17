// @flow

import {KEY, KEY_ID} from "./accessConsts";
import {DateTime} from "../../depricated/rules/DateTime";
import * as crypto from "crypto";
import type {UploadingAuthResponse} from "../ApolloServer/Files";

export const REGION_NAME = "ru-central1"
export const SERVICE_NAME = "s3"
export const REQUEST_NAME = "aws4_request"
export const LIVE_TIME_COUNT_SEC = 3600
export const ACCESS_ALGORITHM = "AWS4-HMAC-SHA256"

export type GetAuthorisationData = GetAuthorisationProps => Array<UploadingAuthResponse>
type GetAuthorisationProps = {
    folder: "solutions",
    fileNames: Array<string>,
    id: string,
    contentType: string,
    maxContentLength: number,
}

type GetPolicy = GetPolicyProps => string
type GetPolicyProps = {
    date: DateTime,
    bucket: string,
    maxContentLength: number,
    key: string,
    contentType: string
}

type GetSigningKey = DateTime => Buffer
type GetSignature = (Buffer, string) => string

type Sign = (string | Buffer, string) => Buffer
const sign: Sign = (secretKey, data) => {
    const hmac = crypto.createHmac("SHA256", secretKey)
    hmac.update(data)
    return hmac.digest()
}

export default class YandexCloudObjectStorage {

    constructor() {
    }

    static create(): YandexCloudObjectStorage {
        return new YandexCloudObjectStorage()
    }

    getAuthorisationData: GetAuthorisationData = props => {
        const {folder, fileNames, id, contentType, maxContentLength} = props
        const date = DateTime.createNow()
        const signingKey = this.getSigningKey(date)
        return fileNames.map(fileName => {
            const policy = this.getPolicy({
                date,
                bucket: folder,
                maxContentLength,
                key: id + "/" + fileName,
                contentType
            })
            return {timeStamp: date.timeStamp, signature: this.getSignature(signingKey, policy), policy}
        })
    }

    getPolicy: GetPolicy = props => {
        const {date, bucket, maxContentLength, key, contentType} = props
        const timeStamp = date.addSecs(LIVE_TIME_COUNT_SEC).iso8601
        const policy = {
            expiration: timeStamp,
            conditions: [
                ["eq", "$bucket", bucket],
                ["content-length-range", 0, maxContentLength],
                ["eq", "$key", key],
                ["eq", "$Content-Type", contentType],
                ["eq", "$x-amz-algorithm", ACCESS_ALGORITHM],
                ["eq", "$x-amz-credential", [KEY_ID, date.yyyymmdd, REGION_NAME, SERVICE_NAME, REQUEST_NAME].join("/")],
                ["eq", "$x-amz-date", date.iso8601WithoutDiv],
            ]
        }
        return (new Buffer(JSON.stringify(policy))).toString("base64")
    }

    getSigningKey: GetSigningKey = date => {
        const dateKey = sign("AWS4" + KEY, date.yyyymmdd)
        const regionKey = sign(dateKey, REGION_NAME)
        const serviceKey = sign(regionKey, SERVICE_NAME)
        return sign(serviceKey, REQUEST_NAME)
    }

    getSignature: GetSignature = (signingKey, policy) => {
        return sign(signingKey, policy).toString("hex")
    }
}