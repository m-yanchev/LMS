import React from 'react'
import styles from "../../client/entryPoints/main/components/views/TypeTasksView/styles.css";
import ComponentListView from "../../client/entryPoints/main/components/views/ComponentListView";
import {shallow} from "enzyme";
import {getComponentClassName} from "../common/helpers";
import TypeTasksView from "../../client/entryPoints/main/components/views/TypeTasksView";

jest.mock('../common/helpers', () => ({
    getComponentClassName: jest.fn().mockReturnValueOnce('styles1').mockReturnValueOnce('styles2')
}));

describe('TypeTasksView, fill taskDesc', () => {

    //given
    const component = (
        <TypeTasksView
            contextStyles={{styleName: 'style'}}
            itemProps={{
                componentList: {length: 5},
                commonData: {taskDesc: 'Разложите многочлен на множители'}}}
            avatarRootDiv={{type: 'avatarRootDiv'}}
        />
    );

    test(' Should render component', () => {
        // when
        const wrapper = shallow(component);
        // then
        expect(wrapper.find('div')).toHaveLength(1);
        expect(wrapper.find('div').find({className: 'styles1'})).toHaveLength(1);
        expect(wrapper.find('div').find('p')).toHaveLength(1);
        expect(wrapper.find('div').find('p').find({className: 'styles2'})).toHaveLength(1);
        expect(wrapper.find('div').find('p').find({children: 'Разложите многочлен на множители:'})).toHaveLength(1);
        expect(wrapper.find('div').find(ComponentListView)).toHaveLength(1);
    });

    test(' Should transmitted getComponentClassName arguments', () => {
        // when
        shallow(component);
        //then
        expect(getComponentClassName.mock.calls[0]).toContain(styles);
        expect(getComponentClassName.mock.calls[0]).toContainEqual({styleName: 'style'});
        expect(getComponentClassName.mock.calls[0][2]).toEqual('type-tasks-view');
        expect(getComponentClassName.mock.calls[1]).toContain(styles);
        expect(getComponentClassName.mock.calls[1]).toContainEqual({styleName: 'style'});
        expect(getComponentClassName.mock.calls[1][2]).toEqual('common-desc');
    })
});

describe('TypeTaskView, without TaskDesc', () => {

    let component;
    let wrapper;

    test(' Should render without task description', () => {
        // given
        component = (
            <TypeTasksView
                contextStyles={{styleName: 'style'}}
                itemProps={{
                    componentList: {length: 5},
                    commonData: {taskDesc: ''}}}
                avatarRootDiv={{type: 'avatarRootDiv'}}
            />
        );
        // when
        wrapper = shallow(component);
        // then
        expect(wrapper.find('div').find('p')).toHaveLength(0);
    });
});

describe('TypeTaskView, "taskDesc" prop is not string', () => {

    let component;

    function callShallow() {
        shallow(component);
    }

    test(' Should throw exception', () => {

        //given
        component = (
            <TypeTasksView
                contextStyles={{styleName: 'style'}}
                itemProps={{
                    componentList: {length: 5},
                    commonData: {taskDesc: 23}}}
                avatarRootDiv={{type: 'avatarRootDiv'}}
            />
        );
        //then
        expect(callShallow).toThrowError(new Error('Expected "taskDesc" prop is a string'));

        //given
        component = (
            <TypeTasksView
                contextStyles={null}
                itemProps={{
                    componentList: {length: 5}}}
                avatarRootDiv={{type: 'avatarRootDiv'}}
            />
        );
        //then
        expect(callShallow).not.toThrowError(new Error('Expected "tascDesc" prop is a string'));
    });
});