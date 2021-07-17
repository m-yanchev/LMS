// @flow

export class InstanceError extends Error {

    constructor(name: string) {
        super(`Expected existence ${name} instance`)
    }

    static create(name: string): InstanceError {
        return new InstanceError(name)
    }
}