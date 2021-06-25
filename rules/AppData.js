// @flow

import Content from "./Content";
import {Profile} from "./Profile";
import ActiveService from "../common/logic/ActiveService";
import type {ActiveServiceProps} from "../common/logic/ActiveService";
import type {ContentProps} from "./Content";
import type {ProfileProps} from "./Profile";
import type {CourseProps} from "./Course";

type AppDataProps = {
    legalType?: LegalType,
    content: ?ContentProps,
    profile: ProfileProps,
    activeService?: ActiveServiceProps,
}

type Meta = {
    description: string
}

export type LegalType = "term" | "privacy"

class AppData {

    _content: ?Content
    _profile: Profile
    _activeService: ActiveService
    _legalType: ?LegalType

    constructor(props: AppDataProps) {
        this._content = props.content ? Content.create(props.content) : null
        this._profile = Profile.create(props.profile)
        this._activeService = ActiveService.create(props.activeService)
        this._legalType = props.legalType || null
    }

    get status(): number {
        return this._legalType || this._content ? 200 : 404
    }

    get profile(): Profile {
        return this._profile
    }

    get content(): Content | null {
        return this._content || null
    }

    get activeService(): ActiveService {
        return this._activeService
    }

    get legalType(): LegalType | null {
        return this._legalType || null
    }

    get meta(): Meta | null {

        const mainDesc = (spec: ?string): string => {
            return `Материалы для подготовки к ЕГЭ по математике${spec ? ' ' + spec: ''}.`
        }

        const getDescriptionByContent = (content: Content): string => {
            switch(content.view) {
                case "sections":
                    return mainDesc()
                case "topics":
                    if (!content.breadCrumbs) throw new Error("breadCrumbs == null")
                    return mainDesc(`из раздела ${content.breadCrumbs[0].heading}`)
                case "topic":
                    if (!content.breadCrumbs) throw new Error("breadCrumbs == null")
                    return mainDesc(`по теме ${content.breadCrumbs[1].heading}`)
                case "video-lesson":
                    if (!content.breadCrumbs) throw new Error("breadCrumbs == null")
                    return `Видеоурок ${content.breadCrumbs[2].heading}`
                case "type-problems":
                    if (!content.breadCrumbs) throw new Error("breadCrumbs == null")
                    return `Задания на тему ${content.breadCrumbs[1].heading}. ${content.breadCrumbs[2].heading}`
                case "problem":
                    if (!content.breadCrumbs) throw new Error("breadCrumbs == null")
                    return `Задание на тему ${content.breadCrumbs[1].heading}. ${content.breadCrumbs[2].heading}`
                case "course":
                    return `Страница курса ${content.course.heading}`
            }
            throw new Error("Недопустимый view")
        }

        if (this._content) {
            return {description: getDescriptionByContent(this._content)}
        } else if (this._legalType) {
            return null
        } else {
            return null
        }
    }

    serialize(): string {
        return JSON.stringify({
            content: this._content && this._content.replica,
            profile: this._profile.replica,
            activeService: this._activeService.item,
            legalType: this._legalType
        })
    }

    static create(props: AppDataProps): AppData {
        return new AppData(props)
    }

    static createCourseApp(props: {course: CourseProps, profile: ProfileProps}): AppData {
        return new AppData({profile: props.profile, content: Content.getCourseContentProps(props.course)})
    }
}

export default AppData