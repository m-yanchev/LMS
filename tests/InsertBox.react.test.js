import React from 'react';
import InsertBox from '../main/components/common/InsertBox'
import  renderer from 'react-test-renderer'
import {shallow} from "enzyme";
import {getComponentClassName} from "../common/helpers";
import styles from "../main/components/views/TypeTasksView/styles.css";

jest.mock('../common/helpers', () => ({
    getComponentClassName: jest.fn().mockReturnValueOnce('styles')
}));

describe('InsertBox', () => {

    test(' Should render component', () => {
        //given
        const component = renderer.create(
            <InsertBox contextStyles={{styleName: 'style'}} onClick={jest.fn()}/>,
        );
        //when
        let tree = component.toJSON();
        //then
        expect(tree).toMatchSnapshot();
    });

    test(' Should transmitted getComponentClassName arguments', () => {
        //given
        const component = (
            <InsertBox contextStyles={{styleName: 'style'}} onClick={jest.fn()}/>
        );
        // when
        shallow(component);
        //then
        expect(getComponentClassName.mock.calls[0]).toContain(styles);
        expect(getComponentClassName.mock.calls[0]).toContainEqual({styleName: 'style'});
        expect(getComponentClassName.mock.calls[0][2]).toEqual('insert-box');
    });

    test(' Should call onClick', () => {
        //given
        const onClick = jest.fn();
        const component = (
            <InsertBox contextStyles={{styleName: 'style'}} onClick={onClick}/>
        );
        const wrapper = shallow(component);
        // when
        wrapper.find('div').simulate('click');
        //then
        expect(onClick.mock.calls).toHaveLength(1);
    })

});