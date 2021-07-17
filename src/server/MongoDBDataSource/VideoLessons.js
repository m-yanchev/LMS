// @flow

import {NumbItems} from "./Items";
import DB from "./DB";

export class VideoLessons extends NumbItems {
    constructor(db: DB) {
        super("videoLessons", db);
    }
}