import React from 'react';
import {TaskComponent, TasksData} from '../main/components/listItems/TaskComponent/'
import {shallow} from 'enzyme'
import Content from "../main/components/common/Content";
import styles from '../main/components/listItems/TaskComponent/styles.css'
import {getComponentClassName, getFinalPath} from "../common/helpers";
import {ContentList} from "../main/ContentData";

jest.mock('../common/helpers', () => ({
    getComponentClassName: jest.fn(() => 'styles'),
    getFinalPath: jest.fn(() => 'path')}));
jest.mock('../client/ContentData', () => ({ContentList: jest.fn()}));

describe('TaskComponent', () => {

    //given
    const component = (
        <TaskComponent
            contextStyles={{styleName: 'style'}}
            path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
            itemKey={'20'}
            number={1}
            content={{desc: '`3x+3y`', imageList: 'imageList'}}
        />
    );

    test(' Should render component', () => {
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.find('a')).toHaveLength(1);
        expect(wrapper.find('a').find({className: 'styles'})).toHaveLength(1);
        expect(wrapper.find('a').find({href: 'path'})).toHaveLength(1);
        expect(wrapper.find('a').find(Content)).toHaveLength(1);
        expect(wrapper.find('a').find(Content).find({contextStyles: {styleName: 'style'}})).toHaveLength(1);
        expect(wrapper.find('a').find(Content).find({model: 'tasks'})).toHaveLength(1);
        expect(wrapper.find('a').find(Content).find({taskKey: '20'})).toHaveLength(1);
        expect(wrapper.find('a').find(Content).find({children: '`3x+3y`'})).toHaveLength(1);
        expect(wrapper.containsMatchingElement(
            <a className={'styles'} href={'path'}>
                <Content
                    contextStyles={{styleName: 'style'}}
                    model={'tasks'}
                    taskKey={'20'}
                    imageList={'imageList'}
                >
                    {'`3x+3y`'}
                </Content>
            </a>
        )).toEqual(true);
    });

    test(' Should transmitted getComponentClassName arguments', () => {
        //when
        shallow(component);
        //then
        expect(getComponentClassName.mock.calls[0]).toContain(styles);
        expect(getComponentClassName.mock.calls[0]).toContainEqual({styleName: 'style'});
        expect(getComponentClassName.mock.calls[0][2]).toEqual('task-item-link');
    });

    test(' Should transmitted getFinalPath arguments', () => {
        //when
        shallow(component);
        //then
        expect(getFinalPath.mock.calls[0][0]).toEqual('algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/');
        expect(getFinalPath.mock.calls[0][1]).toEqual(1);
    });
});


describe('TaskComponent, "contextStyles" prop is not an object', () => {

    let component;
    function callShallow () {
        shallow(component)
    }

    test(' Should throw exception', () => {

        //given
        component = (
            <TaskComponent
                contextStyles={'contextStyles'}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={1}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "contextStyles" prop is an object'));
    });
});

describe('TaskComponent, "path" prop is not a string or it is an empty string', () => {

    let component;
    function callShallow () {
        shallow(component);
    }

    test(' Should throw exception', () => {

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={10}
                itemKey={'20'}
                number={1}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "path" prop is not an empty string'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={''}
                itemKey={'20'}
                number={1}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "path" prop is not an empty string'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                itemKey={'20'}
                number={1}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "path" prop is not an empty string'));
    });
});

describe('TaskComponent, "itemKey" prop is not a string or it is an empty string', () => {

    let component;
    function callShallow () {
        shallow(component);
    }

    test(' Should throw exception', () => {

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={20}
                number={1}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "itemKey" prop is not an empty string'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={''}
                number={1}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "itemKey" prop is not an empty string'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                number={1}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "itemKey" prop is not an empty string'));
    });
});

describe('TaskComponent, "number" prop is not a number or it is not positive', () => {

    let component;
    function callShallow () {
        shallow(component);
    }

    test(' Should throw exception', () => {

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={'1'}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "number" prop is not a positive number'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={0}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "number" prop is not a positive number'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={-1}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "number" prop is not a positive number'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                content={{desc: '`3x+3y`', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "number" prop is not a positive number'));
    });
});

describe('TaskComponent, "content" prop is not an object', () => {

    let component;
    function callShallow () {
        shallow(component);
    }

    test(' Should throw exception', () => {

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={1}
                content={'`3x+3y`'}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "content" prop is an object'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={1}
                content={null}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "content" prop is an object'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={1}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "content" prop is an object'));
    });
});

describe('TaskComponent, "content.desc" is not a string or it is an empty string', () => {

    let component;
    function callShallow () {
        shallow(component);
    }

    test(' Should throw exception', () => {

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={1}
                content={{desc: 2, imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "content.desc" is not an empty string'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={1}
                content={{desc: '', imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "content.desc" is not an empty string'));

        //given
        component = (
            <TaskComponent
                contextStyles={{styleName: 'style'}}
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
                itemKey={'20'}
                number={1}
                content={{imageList: 'imageList'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "content.desc" is not an empty string'));
    });
});

describe('TaskData', () => {

    test(' Should call ContentData constructor', () => {
        // given
        const rootId = '19';
        const modelItems = [];
        // when
        new TasksData(rootId, modelItems);
        // then
        expect(ContentList).toHaveBeenCalled();
    });

    test(' Should transmitted argument to constructor', () => {
        // given
        const rootId = '19';
        const modelItems = [{
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
        new TasksData(rootId, modelItems);
        // then
        expect(ContentList.mock.calls[0][0]).toEqual('19');
        expect(ContentList.mock.calls[0][1]).toMatchObject([{
            name: 'task',
            Component: TaskComponent,
            model: 'tasks'
        }]);
        expect(ContentList.mock.calls[0][2]).toEqual([{
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
        }]);
    });
});
