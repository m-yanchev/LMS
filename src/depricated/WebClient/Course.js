// @flow

import type {CourseProps} from "../rules/Course";

export class Course {

    static get(): CourseProps {
        return window.data.content.courses[0]
    }
}