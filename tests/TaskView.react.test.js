import React from 'react';
import TaskView from '../main/components/views/TaskView/'
import renderer from 'react-test-renderer'

jest.mock('../client/components/common/Content/');

test('TaskView', () => {

    let component = renderer.create(
        <TaskView
            itemProps={
                {
                    isEditMode: false,
                    contentData: {
                        id: 1,
                        desc: 'Задание'
                    }
                }
            }
        />,
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    component = renderer.create(
        <TaskView
            itemProps={
                {
                    isEditMode: false,
                    contentData: {
                        id: 1,
                        commonDesc: 'Общее задание',
                        desc: 'Задание',
                        src: 'источник',
                        srcNumb: 'номер в источнике',
                        solution: 'решение',
                        answer: 'ответ'
                    }
                }
            }
        />,
    );
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});