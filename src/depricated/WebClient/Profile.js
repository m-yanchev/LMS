//@flow

import type {ProfileProps} from "../rules/Profile";
import {gql} from "@apollo/client/core";
import type {GetSendingSolutionsAvailable} from "../rules/DataSource/Profile";
import {WebClient} from "./WebClient";
import Subscription from "../common/logic/Subscription";

const SENDING_SOLUTIONS_AVAILABLE_QUERY = gql`
    query SendingSolutionsAvailable {
        profile {
            checkCount
            subscription
        }
    }
`

export class Profile {

    static get(): ProfileProps {
        return window.data.profile
    }

    static getSendingSolutionsAvailable: GetSendingSolutionsAvailable = async () => {
        const client = WebClient.create()
        const {profile} = (await client.query({query: SENDING_SOLUTIONS_AVAILABLE_QUERY})).data
        return Subscription.isActiveByTimeStampString(profile.subscription) || Boolean(profile.checkCount)
    }
}