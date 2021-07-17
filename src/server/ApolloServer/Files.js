// @flow

import {DocumentNode, gql} from "@apollo/client/core";
import {IResolvers} from "graphql-tools";
import {Solution} from "../../depricated/rules/Solution";
import type {SyncResolver} from "./index";
import {ONE_MB_SIZE_B} from "../../depricated/common/constants";

export const TYPE_DEFS = gql`
    type UploadingAuth {
        timeStamp: TimeStamp,
        signature: String,
        policy: String
    }
    extend type Solution {
        uploadingAuths(fileNames: [String!]): [UploadingAuth!]!
    }
`

type GetUploadingAuths = SyncResolver<UploadingAuthsParent, UploadingAuthsVars, Array<UploadingAuthResponse> | null>
type UploadingAuthsParent = {
    id: string
}
type UploadingAuthsVars = {
    fileNames: Array<string> | null
}
export type UploadingAuthResponse = {
    timeStamp: number,
    signature: string,
    policy: string
}

export class Files {

    static getUploadingAuths: GetUploadingAuths = (parent, vars, context) => {
        const {fileNames} = vars
        const {dataSources} = context
        const {objectStorage} = dataSources
        return fileNames ? objectStorage.getAuthorisationData({
            folder: "solutions",
            fileNames,
            id: parent.id,
            contentType: Solution.contentType,
            maxContentLength: Solution.MAX_FILE_SIZE_MB * ONE_MB_SIZE_B
        }) : null
    }

    static get typeDefs(): DocumentNode {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            Solution: {
                uploadingAuths: Files.getUploadingAuths
            }
        }
    }
}