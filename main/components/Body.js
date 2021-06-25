import React from 'react'
import {Grid} from '@material-ui/core'
import ErrorBoundary from "../../ReactApp/smartComponents/ErrorBoundary";
import {EditableCards, Tests} from "./editable/EditableLists";
import {EditableLessonsBox} from "./editable/EditableBoxes";
import {VideoLesson} from "./VideoLesson";
import {TypeProblemsLesson} from "./TypeProblems";
import {EditableProblem} from "../../common/components/Problem";
import {Privacy, Term} from "./legal";
import {
    TestHeadingsData,
    VideoLessonsData,
    ProblemTypesData,
    TypeProblemsData,
    WebinarsData
} from "./editable/EditableItems";
import {CoursesData, Courses} from "./Courses";

export default class Body extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {content, legalType, ...rest} = this.props;
        const {userModeProps, avatarRootDiv} = rest

        if (legalType === "privacy") {
            return <Privacy/>
        } else if (legalType === "term") {
            return <Term/>
        } else {

            const coursesData = createCoursesData()
            const videoLessonsData = createVideoLessonsData({rootId: content.rootIdForLessons})
            const webinarsData = createWebinarsData({rootId: content.rootIdForLessons})
            const testsData = createTestsData({rootId: content.rootIdForLessons})
            const paidTestsData = createPaidTestsData({rootId: content.rootIdForLessons})
            const problemTypesData = createProblemTypesData({rootId: content.rootIdForLessons})
            const typeProblemsData = createTypeProblemsData({rootId: content.categoryId})
            const testDesc = "Работа оценивается автоматически. Для выполнения заданий и сохранения результатов " +
                "необходимо войти в систему"
            const paidTestDesc = "Работу оценивает учитель. Для выполнения заданий необходимо войти в систему. " +
                "Чтобы получить комментарий к решению и оценку за работу необходимо произвести онлайн оплату. " +
                "Проверка работы осуществляется в течение суток после отправки решения и оплаты. Результаты " +
                "отправляются на Вашу электроную почту."

            return (
                <ErrorBoundary>
                    <Grid container direction="column" alignItems="center">
                        <EditableProblem {...rest}
                                         content={content.problem}
                                         typeHeader={content.problemTypeHeader}/>
                        <TypeProblemsLesson desc={content.problemTypeHeader}
                                            {...rest}
                                            commonDesc={content.problemCommonDesc}
                                            contentData={typeProblemsData}/>
                        <VideoLesson content={content.videoLesson}/>
                        <EditableLessonsBox type="Курсы"
                                            Item={Courses}
                                            {...rest}
                                            contentData={coursesData}/>
                        <EditableLessonsBox type="Вебинары"
                                            Item={EditableCards}
                                            {...rest}
                                            contentData={webinarsData}/>
                        <EditableLessonsBox type="Видеоуроки"
                                            Item={EditableCards}
                                            {...rest}
                                            contentData={videoLessonsData}/>
                        <EditableLessonsBox subtitle="Задания с развернутым ответом"
                                            type="Самостоятельные работы"
                                            desc={paidTestDesc}
                                            {...rest}
                                            Item={Tests}
                                            contentData={paidTestsData}/>
                        <EditableLessonsBox subtitle="Задания с кратким ответом"
                                            type="Самостоятельные работы"
                                            desc={testDesc}
                                            {...rest}
                                            Item={Tests}
                                            contentData={testsData}/>
                        <EditableLessonsBox type="Задачник"
                                            Item={EditableCards}
                                            {...rest}
                                            contentData={problemTypesData}/>
                    </Grid>
                </ErrorBoundary>
            )

            function createCoursesData() {
                return content.coursesVisible(userModeProps.isEditMode) ?
                    new CoursesData({items: content.courses}) : null
            }

            function createVideoLessonsData({rootId}) {
                return content.videoLessonsVisible(userModeProps.isEditMode) ?
                    new VideoLessonsData({rootId, items: content.videoLessons}) : null
            }

            function createProblemTypesData({rootId}) {
                return content.problemTypesVisible(userModeProps.isEditMode) ?
                    new ProblemTypesData({rootId, items: content.problemTypes, avatarRootDiv}) : null
            }

            function createTypeProblemsData({rootId}) {
                return content.problemsVisible() ?
                    new TypeProblemsData({rootId, items: content.problems, avatarRootDiv}) : null
            }

            function createTestsData({rootId}) {
                return content.testsVisible(userModeProps.isEditMode) ?
                    new TestHeadingsData({rootId, items: content.tests}) : null
            }

            function createPaidTestsData({rootId}) {
                return content.paidTestsVisible(userModeProps.isEditMode) ?
                    new TestHeadingsData({rootId, items: content.paidTests, type: "paid-test"}) : null
            }

            function createWebinarsData({rootId}) {
                return content.webinarsVisible(userModeProps.isEditMode) ?
                    new WebinarsData({rootId, items: content.webinars}) : null
            }
        }
    }
}