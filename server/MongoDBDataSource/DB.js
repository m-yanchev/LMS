import {sendToTeacher} from "../ErrorHandler";
import {Tests} from "./Tests";
import {TestProblems} from "./TestProblems";
import {Solutions} from "./Solutions";
import {Users} from "./Users";
import {ProblemResults} from "./ProblemResults";
import {Problems} from "./Problems";
import {Items, JournalItems, NumbItems} from "./Items";
import {VideoLessons} from "./VideoLessons";
import {ProblemsTypes} from "./ProblemsTypes";
import {DB_ACCESS} from "./accessConsts";

const {MongoClient} = require('mongodb');

class CourseTopics extends JournalItems {

    constructor(db) {
        super("courseTopics", db);
    }
}

class CourseWebinars extends Items {
    constructor(db) {
        super("courseWebinars", db);
    }
}

class CourseVideoLessons extends NumbItems {
    constructor(db) {
        super("courseVideoLessons", db);
    }
}

class CourseTests extends NumbItems {
    constructor(db) {
        super("courseTests", db);
    }
}

class Topics extends Items {
    constructor(db) {
        super("topics", db);
    }
}

class Courses extends NumbItems {
    constructor(db) {
        super("courses", db);
    }
}

class TestResults extends JournalItems {
    constructor(db) {
        super("testResults", db);
    }
}

class ProblemChecks extends JournalItems {
    constructor(db) {
        super("problemChecks", db);
    }
}

class Headings extends NumbItems {
    constructor(db) {
        super("headings", db);
    }
}

class Webinars extends JournalItems {
    constructor(db) {
        super("webinars", db);
    }
}

class ServiceRegistrations extends JournalItems {

    constructor(db) {
        super("serviceRegistrations", db);
    }

    findOne(filter) {
        return super.findOne({...filter, status: "succeeded"})
    }

    async insert(data) {
        const {result} = await this._collection.insert({status: "pending", date: Items.getCurrentDate(), ...data})
        return result.ok
    }

    async updatePendingStatus({userId}) {
        const registration = await this._collection.findOne({userId}, {sort: {date: -1}})
        await this._collection.updateOne({_id: registration._id}, {$set: {status: "succeeded"}})
        return registration
    }
}

class Payments extends Items {
    constructor(db) {
        super("payments", db);
    }
}

class CourseSolutions extends JournalItems {

    constructor(db) {
        super("courseSolutions", db);
    }

    updateStatus({userId, courseTestId}) {
        const filter = {userId, courseTestId, status: "sent"}
        return this._collection.findOneAndUpdate(filter, {$set: {status: "verified"}})
    }
}

class DB {

    constructor({client, db}) {
        this._client = client
        this._db = db
    }

    static async open() {

        const client = new MongoClient(DB_ACCESS, {useUnifiedTopology: true})
        await client.connect()
        const db = await client.db('LMSData')
        return new DB({client, db})
    }

    get collection() {
        return (name) => this._db.collection(name)
    }

    close() {
        this._client.close().catch(e => {
            const log = {module: "DB.open", message: `Ошибка закрытия БД: ${e.message}`}
            sendToTeacher(e, {log})
        })
    }

    get courseTopics() {
        return new CourseTopics(this._db)
    }

    get courseWebinars() {
        return new CourseWebinars(this._db)
    }

    get courseVideoLessons() {
        return new CourseVideoLessons(this._db)
    }

    get courseTests() {
        return new CourseTests(this._db)
    }

    get topics() {
        return new Topics(this._db)
    }

    get courses() {
        return new Courses(this._db)
    }

    get videoLessons() {
        return new VideoLessons(this._db)
    }

    get testResults() {
        return new TestResults(this._db)
    }

    get problemChecks() {
        return new ProblemChecks(this._db)
    }

    get testProblems() {
        return new TestProblems(this._db)
    }

    get headings() {
        return new Headings(this._db)
    }

    get problems() {
        return new Problems(this._db)
    }

    get webinars() {
        return new Webinars(this._db)
    }

    get serviceRegistrations() {
        return new ServiceRegistrations(this._db)
    }

    get users() {
        return new Users(this._db)
    }

    get solutions() {
        return new Solutions(this._db)
    }

    get payments() {
        return new Payments(this._db)
    }

    get tests() {
        return new Tests(this._db)
    }

    get courseSolutions() {
        return new CourseSolutions(this._db)
    }

    get problemResults() {
        return new ProblemResults(this._db)
    }

    get sessions() {
        return new Items("sessions", this._db)
    }

    get subscriptions() {
        return new JournalItems("subscriptions", this._db)
    }

    get webinarRegistrations() {
        return new Items("webinarRegistrations", this._db)
    }

    get problemsTypes() {
        return new ProblemsTypes(this._db)
    }
}

export default DB