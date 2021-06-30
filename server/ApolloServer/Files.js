// @flow

import { GraphQLUpload } from 'graphql-upload';
import {DocumentNode, gql} from "@apollo/client/core";
import {IResolvers} from "graphql-tools";

export const TYPE_DEFS = gql`
    scalar Upload
`

export class Files {

    static get typeDefs(): DocumentNode {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            Upload: GraphQLUpload
        }
    }
}