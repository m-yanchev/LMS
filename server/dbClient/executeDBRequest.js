const Model = require('./Model');
const NumbModel = require('./NumbModel')
const WebinarsModel = require("./WebinarsModel")
const ProblemListModel = require('./ProblemListModel')
const ProblemModel = require('./ProblemModel')
const TestProblemsModel = require('./TestProblemsModel')
const ProblemChecksModel = require("./ProblemChecksModel")
const TestsModel = require('./TestsModel')
const TestResultsModel = require('./TestResultsModel')
const SolutionsModel = require("./SolutionsModel")
const ProblemTypesModel = require("./ProblemTypesModel")
const HeadingsModel = require("./HeadingsModel")
const PaymentsModel = require("./PaymentsModel")

function executeDBRequest(db, {model, task, data, user}) {

    //console.log('processDataBaseRequest: data = %o, result = %o, user = %o', data, result, user);
    let modelObj;
    switch (model) {
        case "payments":
            modelObj = new PaymentsModel(db)
            break
        case 'users':
        case 'links':
        case "purchases":
            modelObj = new Model(db, model);
            break;
        case "webinars":
            modelObj = new WebinarsModel(db)
            break
        case 'problem-list':
            modelObj = new ProblemListModel(db);
            break;
        case 'problem':
            modelObj = new ProblemModel(db);
            break;
        case 'testProblems':
            modelObj = new TestProblemsModel(db);
            break;
        case "problemChecks":
            modelObj = new ProblemChecksModel(db);
            break
        case "tests":
            modelObj = new TestsModel(db);
            break
        case "testResults":
            modelObj = new TestResultsModel(db)
            break
        case "solutions":
            modelObj = new SolutionsModel(db)
            break
        case "problemTypes":
            modelObj = new ProblemTypesModel(db)
            break
        case "headings":
            modelObj = new HeadingsModel(db)
            break
        default:
            modelObj = new NumbModel(db, model)
    }
    modelObj.user = user;

    return modelObj[task](data)
}

module.exports = executeDBRequest;