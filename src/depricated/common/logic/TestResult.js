class TestResult {

    constructor({userId, test, earnedMark, fullMark}) {
        this._userId = userId || null
        this._testId = test ? test.id : null
        this._name = test ? test.heading : null
        this._earnedMark = earnedMark || (earnedMark === 0 ? 0 : null)
        this._fullMark = fullMark || (fullMark === 0 ? 0 : null)
    }

    get isSuccess() {
        const LIMIT = 2/3
        return this._earnedMark/this._fullMark > LIMIT
    }

    makeEarnedMark(marks) {
        this._earnedMark = marks.reduce((sum, {mark}) => sum + mark, 0)
    }

    makeFullMark(testProblems) {
        this._fullMark = testProblems.reduce((sum, {rating}) => sum + rating, 0)
    }

    get item() {
        return {
            userId: this._userId,
            testId: this._testId,
            name: this._name,
            earnedMark: this._earnedMark,
            fullMark: this._fullMark
        }
    }

    static folder = "results"

    static create(data) {
        return new TestResult(data)
    }
}

export default TestResult