// @flow

import {DocumentNode, gql} from "@apollo/client/core";
import {IResolvers} from "graphql-tools";
import {GraphQLScalarType, Kind} from "graphql";

export const TYPE_DEFS = gql`
    scalar TimeStamp
`

export class TimeStamp {

    static timeStampValue = (value: mixed) => {
        return (Number.isInteger(value) && Number(value) >= 0) ? value : null
    }

    static get typeDefs(): DocumentNode {
        return TYPE_DEFS
    }

    static get resolvers(): IResolvers {
        return {
            TimeStamp: new GraphQLScalarType({
                name: "TimeStamp",
                description: "Time stamp type",
                parseValue: TimeStamp.timeStampValue,
                serialize: TimeStamp.timeStampValue,
                parseLiteral(ast) {
                    if (ast.kind === Kind.INT) {
                        return TimeStamp.timeStampValue(parseInt(ast.value, 10))
                    }
                    return null
                },
            })
        }
    }
}