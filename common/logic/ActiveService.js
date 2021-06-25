// @flow

export type ActiveServiceProps = {
    id: string,
    name: ActiveServiceName,
    isActivated: ?boolean
}

type ActiveServiceItem = {
    id: ?string,
    name: ?ActiveServiceName,
    isActivated: boolean
}

type ActivatedProps = {
    id: string,
    name: ActiveServiceName
}

export type ActiveServiceName =
    "testCheck" | "course" | "solutionSending" | "webinar" | "paymentDialog" | "submitSolutionsDialog"

class ActiveService {

    _id: ?string
    _name: ?ActiveServiceName
    _isActivated: boolean

    constructor(props: ?ActiveServiceProps) {
        if (props) {
            this.set(props)
        } else {
            this.reset()
        }
    }

    get id(): ?string {
        return this._id
    }

    get name(): ?string {
        return this._name
    }

    get item(): ActiveServiceItem {
        return {
            id: this._id,
            name: this._name,
            isActivated: this._isActivated
        }
    }

    serialize(): ?string {
        return this._id ? JSON.stringify({id: this._id, name: this._name, isActivated: this._isActivated}) : null
    }

    static deserialize(data: ?string): ActiveService {
        return new ActiveService(data ? JSON.parse(data): null)
    }

    activate(): void {
        if (this._id) this._isActivated = true
    }

    set(props: ActiveServiceProps): void {
        this._id = props.id
        this._name = props.name
        this._isActivated = Boolean(props.isActivated)
    }

    reset(): void {
        this._id = null
        this._name = null
        this._isActivated = false
    }

    isActivated(props: ?ActivatedProps): boolean {
        return props ? this._isActivated && this._name === props.name && this._id === props.id : this._isActivated
    }

    static create(props: ?ActiveServiceProps): ActiveService {
        return new ActiveService(props)
    }
}

export default ActiveService