import React from 'react'
import ContentMainView from "../../../client/entryPoints/main/components/views/ContentMainView";
import {DataTransferObject} from "../../common/DataTransferObject";
import renderer from "react-test-renderer";

describe('taskDesc', () => {

    test(' Should display in task-types view', () => {
        //given
        const path = '/algebra/ponyatie-arifmeticheskogo-kvadratnogo-kornya';
        const response = DataTransferObject.getResponse({
            "status": 200,
            "body": {
                "access": "student",
                "content": {
                    "id": "",
                    "key": "",
                    "parentId": null,
                    "view": "topic",
                    "breadCrumbs": ["Алгебра", "Понятие арифметического квадратного корня"],
                    "headings": null,
                    "videoLessons": {
                        "id": "",
                        "key": "",
                        "parentId": "5dc914cbb7154457fcc389d8",
                        "view": "video-lessons",
                        "items": []
                    },
                    "taskTypes": {
                        "id": "",
                        "key": "",
                        "parentId": "5dc914cbb7154457fcc389d8",
                        "view": "task-types",
                        "items": [{
                            "parentId": "5dc914cbb7154457fcc389d8",
                            "view": "task-type",
                            "heading": "Пример 1",
                            "alias": "primer-1",
                            "taskDesc": "При каких значениях x имеет смысл выражение",
                            "key": "26",
                            "id": "5dc91514b7154457fcc389d9"
                        }, {
                            "parentId": "5dc914cbb7154457fcc389d8",
                            "view": "task-type",
                            "heading": "Пример 2",
                            "alias": "primer-2",
                            "taskDesc": "Вычислите",
                            "key": "27",
                            "id": "5e04642f96adee6ec1093e6f"
                        }, {
                            "parentId": "5dc914cbb7154457fcc389d8",
                            "view": "task-type",
                            "heading": "Пример 3",
                            "alias": "primer-3",
                            "taskDesc": "Найдите корень уравнения",
                            "key": "28",
                            "id": "5e04668596adee6ec1093e75"
                        }, {
                            "parentId": "5dc91514b7154457fcc389d9",
                            "view": "task",
                            "commonDesc": "",
                            "isExample": true,
                            "desc": "`sqrt x`",
                            "solution": "",
                            "src": "Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев",
                            "srcNumb": "10.11.а.",
                            "answer": "x>=0",
                            "isPattern": false,
                            "key": "51",
                            "id": "5dc93694b7154457fcc389da"
                        }, {
                            "parentId": "5e04642f96adee6ec1093e6f",
                            "view": "task",
                            "commonDesc": "",
                            "isExample": true,
                            "desc": "(sqrt5)^2",
                            "solution": "",
                            "src": "Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев",
                            "srcNumb": "10.12.а.",
                            "answer": "5",
                            "isPattern": true,
                            "key": "55",
                            "id": "5e04650296adee6ec1093e70"
                        }, {
                            "parentId": "5e04668596adee6ec1093e75",
                            "view": "task",
                            "commonDesc": "",
                            "isExample": true,
                            "desc": "sqrt(28-2x)=2",
                            "solution": "",
                            "src": "fipi.ru",
                            "srcNumb": "D6D480",
                            "answer": "12",
                            "isPattern": true,
                            "key": "60",
                            "id": "5e04679596adee6ec1093e76"
                        }]
                    },
                    "typeTasks": null,
                    "task": null,
                    "videoLesson": null,
                    "countImages": 0
                }
            }
        });
        //when
        const component = renderer.create(
            <ContentMainView path={path} response={response}/>
        );
        //then
        expect(component.root.findAllByProps({
            children: "При каких значениях x имеет смысл выражение:"
        })).toHaveLength(1);
        expect(component.root.findAllByProps({
            children: "Вычислите:"
        })).toHaveLength(1);
        expect(component.root.findAllByProps({
            children: "Найдите корень уравнения:"
        })).toHaveLength(1);
    });

    test(' Should display in type-tasks view', () => {
        //given
        const path = '/algebra/ponyatie-arifmeticheskogo-kvadratnogo-kornya/primer-1';
        const response = DataTransferObject.getResponse({
            "status": 200,
            "body": {
                "access": "student",
                "content": {
                    "id": "",
                    "key": "",
                    "parentId": null,
                    "view": "type-tasks",
                    "breadCrumbs": ["Алгебра", "Понятие арифметического квадратного корня", "Пример 1"],
                    "headings": null,
                    "videoLessons": {
                        "id": "",
                        "key": "",
                        "parentId": "5dc914cbb7154457fcc389d8",
                        "view": "video-lessons",
                        "items": []
                    },
                    "typeTasks": {
                        "id": "",
                        "key": "",
                        "parentId": "5dc91514b7154457fcc389d9",
                        "view": "type-tasks",
                        "items": [{
                            "parentId": "5dc91514b7154457fcc389d9",
                            "view": "task",
                            "commonDesc": "",
                            "isExample": true,
                            "desc": "`sqrt x`",
                            "solution": "",
                            "src": "Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев",
                            "srcNumb": "10.11.а.",
                            "answer": "x>=0",
                            "isPattern": false,
                            "key": "51",
                            "id": "5dc93694b7154457fcc389da"
                        }, {
                            "parentId": "5dc91514b7154457fcc389d9",
                            "view": "task",
                            "commonDesc": "",
                            "isExample": false,
                            "desc": "`sqrt(x^2)`",
                            "src": "Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев",
                            "srcNumb": "10.11.б.",
                            "solution": "",
                            "answer": "При любых.",
                            "isPattern": false,
                            "key": "52",
                            "id": "5dc937f3b7154457fcc389db"
                        }, {
                            "parentId": "5dc91514b7154457fcc389d9",
                            "view": "task",
                            "commonDesc": "",
                            "isExample": false,
                            "desc": "`sqrt(-x)`",
                            "src": "Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев",
                            "srcNumb": "10.11.в.",
                            "solution": "",
                            "answer": "`x<=0`",
                            "isPattern": false,
                            "key": "53",
                            "id": "5dc9384cb7154457fcc389dc"
                        }, {
                            "parentId": "5dc91514b7154457fcc389d9",
                            "view": "task",
                            "commonDesc": "",
                            "isExample": false,
                            "desc": "`sqrt(1/x)`",
                            "src": "Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев",
                            "srcNumb": "10.11.г.",
                            "solution": "",
                            "answer": "`x>0`",
                            "isPattern": false,
                            "key": "54",
                            "id": "5dc9389ab7154457fcc389dd"
                        }],
                        "taskDesc": "При каких значениях x имеет смысл выражение"
                    },
                    "task": null,
                    "videoLesson": null,
                    "countImages": 0
                }
            }
        });
        //when
        const component = renderer.create(
            <ContentMainView path={path} response={response}/>
        );
        //then
        expect(component.root.findAllByProps({
            children: "При каких значениях x имеет смысл выражение:"
        })).toHaveLength(1);
    });

    test(' Should display in task view', () => {
        //given
        const path = '/algebra/ponyatie-arifmeticheskogo-kvadratnogo-kornya/primer-1/1';
        const response = DataTransferObject.getResponse({
            "status": 200,
            "body": {
                "access": "student",
                "content": {
                    "id": "",
                    "key": "",
                    "parentId": null,
                    "view": "task",
                    "breadCrumbs": ["Алгебра","Понятие арифметического квадратного корня","Пример 1","1"],
                    "headings": null,
                    "videoLessons": {
                        "id": "",
                        "key": "",
                        "parentId": "5dc914cbb7154457fcc389d8",
                        "view": "video-lessons",
                        "items": []
                    },
                    "taskTypes": null,
                    "task": {
                        "parentId": "5dc91514b7154457fcc389d9",
                        "view": "task",
                        "commonDesc": "При каких значениях x имеет смысл выражение",
                        "isExample": true,
                        "desc": "`sqrt x`",
                        "solution": "",
                        "src": "Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев",
                        "srcNumb": "10.11.а.",
                        "answer": "x>=0",
                        "isPattern": false,
                        "key": "51",
                        "id": "5dc93694b7154457fcc389da"
                    },
                    "videoLesson": null,
                    "countImages": 0
                }
            }
        });
        //when
        const component = renderer.create(
            <ContentMainView path={path} response={response}/>
        );
        //then
        expect(component.root.findAllByProps({
            children: "При каких значениях x имеет смысл выражение:"
        })).toHaveLength(1);
    })
});