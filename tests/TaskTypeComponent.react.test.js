import React from 'react';
import {shallow} from "enzyme";
import {TaskTypeComponent, TaskTypesData} from "../main/components/TaskTypeComponent";
import {TaskComponent} from "../main/components/listItems/TaskComponent";
import TypeTasksView from "../main/components/views/TypeTasksView";
import {getFinalPath} from "../common/helpers";
import {ContentList} from "../main/ContentData";
import ModalTaskTypeInput from "../main/components/modal/ModalTaskTypeInput";

jest.mock('../common/helpers', () => ({
    getFinalPath: jest.fn(() => 'final path')
}));
jest.mock('../client/components/listItems/TaskTypeComponent/styles.css', () => ({
    'task-type-component': 'task-type-component-classname'
}));

jest.mock('../client/ContentData', () => ({
    ContentList: jest.fn()
}));

jest.mock("../client/components/modal/ModalTaskTypeInput");

describe('TaskTypeComponent', () => {
    // given
    const component = (
        <TaskTypeComponent
            path={'/algebra/vynesenie-obshchego-mnozhitelya-za-skobki/'}
            content={{
                heading: 'Пример 1',
                alias: 'primer-1',
                taskDesc: 'Разложите многочлен на множители'
            }}
            componentList={{length: 5}}
            avatarRootDiv={'avatarRootDiv'}
        />
    );

    test(' Should render', () => {
        // when
        const wrapper = shallow(component);
        // then
        expect(wrapper.find('div')).toHaveLength(1);
        expect(wrapper.find('a')).toHaveLength(1);
        expect(wrapper.find('h3')).toHaveLength(1);
        expect(wrapper.find(TypeTasksView)).toHaveLength(1);
        expect(wrapper.find({className: 'task-type-component-classname'})).toHaveLength(1);
        expect(wrapper.find({href: 'final path'})).toHaveLength(1);
        expect(wrapper.find({children: 'Пример 1'})).toHaveLength(1);
        expect(wrapper.find({
            contextStyles: {
                'task-type-component': 'task-type-component-classname'
            }
        })).toHaveLength(1);
        expect(wrapper.find({
            itemProps: {componentList: {length: 5}, commonData: {taskDesc: 'Разложите многочлен на множители'}}
        })).toHaveLength(1);
        expect(wrapper.find({avatarRootDiv: 'avatarRootDiv'})).toHaveLength(1);

        expect(wrapper.containsMatchingElement(
            <div className={'task-type-component-classname'}>
                <a href={'final path'}>
                    <h3>Пример 1</h3>
                </a>
                <TypeTasksView
                    contextStyles={{
                        'task-type-component': 'task-type-component-classname'
                    }}
                    itemProps={{componentList: {length: 5}, commonData: {taskDesc: 'Разложите многочлен на множители'}}}
                    avatarRootDiv={'avatarRootDiv'}
                />
            </div>)).toEqual(true)
    });

    test(' Should transmitted getFinalPath arguments', () => {
        // when
        shallow(component);
        // then
        expect(getFinalPath).toHaveBeenCalled();
        expect(getFinalPath.mock.calls[0][0]).toEqual('/algebra/vynesenie-obshchego-mnozhitelya-za-skobki/');
        expect(getFinalPath.mock.calls[0][1]).toEqual('primer-1');
    });
});

describe('TaskTypesData', () => {

    test(' Should call ContentData constructor', () => {
        // given
        const rootId = '18';
        const modelItems = [];
        const avatarRootDiv = {type: 'avatarRootDiv'};
        // when
        new TaskTypesData(rootId, modelItems, avatarRootDiv);
        // then
        expect(ContentList).toHaveBeenCalled();
    });

    test(' Should call constructor argument for difference items', () => {
        // given
        const rootId = '18';
        const modelItems = [{
            id: 19,
            parentId: 18,
            heading: 'Пример 1',
            alias: 'primer-1',
            taskDesc: 'Разложите многочлен на множители'
        }, {
            id: 20,
            parentId: 18,
            heading: 'Пример 2',
            alias: 'primer-2',
            taskDesc: ''
        }, {
            id: 15,
            parentId: 19,
            isExample: true,
            desc: '`3x + 3y`',
            solution: 'В этом поле должно быть решение этой задачи.',
            answer: '`3(x+y)`',
            isPattern: false,
            client: 'Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев',
            clientNumb: '28.2.а.'
        }, {
            id: 16,
            parentId: 19,
            isExample: true,
            desc: '`5a-5b``',
            solution: 'В этом поле должно быть решение этой задачи.',
            answer: '`5(a-b)`',
            isPattern: false,
            client: 'Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев',
            clientNumb: '28.2.б.'
        }];
        // when
        new TaskTypesData(rootId, modelItems);
        // then
        expect(ContentList.mock.calls[0][0]).toEqual('18');
        expect(ContentList.mock.calls[0][1]).toMatchObject([{
            name: 'task-type',
            model: 'headings',
            InputComponent: ModalTaskTypeInput
        }, {
            name: 'task',
            Component: TaskComponent,
            model: 'tasks'
        }]);
        expect(ContentList.mock.calls[0][2]).toEqual([{
            id: 19,
            parentId: 18,
            content: {
                heading: 'Пример 1',
                alias: 'primer-1',
                taskDesc: 'Разложите многочлен на множители'
            }
        }, {
            id: 20,
            parentId: 18,
            content: {
                heading: 'Пример 2',
                alias: 'primer-2',
                taskDesc: ''
            }
        }, {
            id: 15,
            parentId: 19,
            content: {
                isExample: true,
                desc: '`3x + 3y`',
                solution: 'В этом поле должно быть решение этой задачи.',
                answer: '`3(x+y)`',
                isPattern: false,
                client: 'Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев',
                clientNumb: '28.2.а.'
            }
        }, {
            id: 16,
            parentId: 19,
            content: {
                isExample: true,
                desc: '`5a-5b``',
                solution: 'В этом поле должно быть решение этой задачи.',
                answer: '`5(a-b)`',
                isPattern: false,
                client: 'Алгебра. 7 класс. Задачник. Часть 2. А. Г. Мордкович, Н. П. Николаев',
                clientNumb: '28.2.б.'
            }
        }])
    })
});