import React from 'react'
import {shallow} from "enzyme";
import HeadingAliasInput from "../../client/entryPoints/main/components/input/HeadingAliasInput";
import renderer from "react-test-renderer";

describe('HeadingAliasInput', () => {

    test(' Should render', () => {
        //given
        const values = {heading: 'ЕГЭ профильного уровня', alias: 'ege_profil'};
        const options = {size: 30, autoFocus: true};
        const onKeyUp = jest.fn();
        const onChange = jest.fn();
        const component = renderer.create(
            <HeadingAliasInput values={values} options={options} onKeyUp={onKeyUp} onChange={onChange}/>);
        //when
        let tree = component.toJSON();
        //then
        expect(tree).toMatchSnapshot();
    });

    test(' Should keyup heading field', () => {
        //given
        const values = {heading: 'Алгебра', alias: 'algebra'};
        const options = {size: 10, autoFocus: false};
        const onKeyUp = jest.fn();
        const onChange = jest.fn();
        const component = <HeadingAliasInput values={values} options={options} onKeyUp={onKeyUp} onChange={onChange}/>;
        const wrapper = shallow(component);
        //when
        wrapper.find({id: 'heading'}).simulate('keyup');
        //then
        expect(onKeyUp.mock.calls).toHaveLength(1);
    });

    test(' Should keyup alias field', () => {
        //given
        const values = {heading: 'Планиметрия', alias: 'planimetriya'};
        const options = {size: 100, autoFocus: true};
        const onKeyUp = jest.fn();
        const onChange = jest.fn();
        const component = <HeadingAliasInput values={values} options={options} onKeyUp={onKeyUp} onChange={onChange}/>;
        const wrapper = shallow(component);
        //when
        wrapper.find({id: 'alias'}).simulate('keyup');
        //then
        expect(onKeyUp.mock.calls).toHaveLength(1);
    });

    test(' Should empty heading string, when heading value is undefined', () => {
        //given
        const values = {alias: 'ege_profil'};
        const options = {size: 30, autoFocus: true};
        const onKeyUp = jest.fn();
        const onChange = jest.fn();
        const component = renderer.create(
            <HeadingAliasInput values={values} options={options} onKeyUp={onKeyUp} onChange={onChange}/>);
        //when
        let tree = component.toJSON();
        //then
        expect(tree).toMatchSnapshot();
    });

    test(' Should empty heading string, when heading value is not string', () => {
        //given
        const values = {heading: {}, alias: 'ege_profil'};
        const options = {size: 30, autoFocus: true};
        const onKeyUp = jest.fn();
        const onChange = jest.fn();
        const component = renderer.create(
            <HeadingAliasInput values={values} options={options} onKeyUp={onKeyUp} onChange={onChange}/>);
        //when
        let tree = component.toJSON();
        //then
        expect(tree).toMatchSnapshot();
    });

    test(' Should empty alias string, when alias value is undefined', () => {
        //given
        const values = {heading: 'Планиметрия'};
        const options = {size: 30, autoFocus: true};
        const onKeyUp = jest.fn();
        const onChange = jest.fn();
        const component = renderer.create(
            <HeadingAliasInput values={values} options={options} onKeyUp={onKeyUp} onChange={onChange}/>);
        //when
        let tree = component.toJSON();
        //then
        expect(tree).toMatchSnapshot();
    });

    test(' Should empty alias string, when alias value is not string', () => {
        //given
        const values = {heading: 'Планиметрия', alias: 12};
        const options = {size: 30, autoFocus: true};
        const onKeyUp = jest.fn();
        const onChange = jest.fn();
        const component = renderer.create(
            <HeadingAliasInput values={values} options={options} onKeyUp={onKeyUp} onChange={onChange}/>);
        //when
        let tree = component.toJSON();
        //then
        expect(tree).toMatchSnapshot();
    });
});