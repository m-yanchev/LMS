//@flow

import type {ProfileProps} from "../rules/Profile";

export class Profile {

    static get(): ProfileProps {
        return window.data.profile
    }
}