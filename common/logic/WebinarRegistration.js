// @flow

import type {MakeResponse} from "../../server/Schema/Schema";

export type WebinarRegistrationConfirmProps = {
    userId: string,
    webinarId: ?string,
    makeResponse: MakeResponse
}

type ConfirmVariables = {
    userId: string,
    webinarId: string
}

class WebinarRegistration {

    static async confirm(props: WebinarRegistrationConfirmProps): Promise<void> {

        const {userId, webinarId, makeResponse} = props
        if (!webinarId) throw new Error("Ожидалось наличие значения у webinarId")
        const query = `mutation InsertWebinarRegistration($userId: ID!, $webinarId: ID!) {
            insertWebinarRegistration(userId: $userId, webinarId: $webinarId)
        }`
        const variables = {userId, webinarId}
        await makeResponse<ConfirmVariables, boolean>(query, variables)
    }
}

export default WebinarRegistration