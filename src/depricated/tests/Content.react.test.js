import React from 'react'
import {shallow} from "enzyme";
import Content from "../../client/entryPoints/main/components/common/Content";
import Formula from "../../client/entryPoints/main/components/common/Formula";

describe('Content component. Ready text block', () => {

    test(' Should render p block', () => {
        //given
        const component = <Content>Григорий является владельцем двух заводов в разных городах.</Content>;
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.find('p')).toHaveLength(1);
        expect(wrapper.find('p').prop('children')).toContain('Григорий является владельцем двух заводов в разных городах.');
        expect(wrapper.containsMatchingElement(
            <p>Григорий является владельцем двух заводов в разных городах.</p>
        )).toEqual(true)
    });

    test(' Should render b block', () => {
        //given
        const component = <Content>Найдите .жн.наибольший.жк. размер кредита</Content>;
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.find('p')).toHaveLength(1);
        expect(wrapper.find('p').prop('children')).toContain('Найдите ');
        expect(wrapper.find('p').prop('children')).toContain(' размер кредита');
        expect(wrapper.find('p').find('b')).toHaveLength(1);
        expect(wrapper.find('p').find('b').prop('children')).toContain('наибольший');
        expect(wrapper.containsMatchingElement(
            <p>Найдите <b>наибольший</b> размер кредита</p>
        )).toEqual(true)
    });

    test(' Should render two b blocks', () => {
        //given
        const component =
            <Content>
                Найдите .жн.наибольший.жк. размер кредита, при котором общая сумма выплат заёмщика будет .жн.меньше 7 млн рублей.жк..
            </Content>;
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.containsMatchingElement(
            <p>Найдите <b>наибольший</b> размер кредита, при котором общая сумма выплат заёмщика будет <b>меньше 7 млн рублей</b>.</p>
        )).toEqual(true)
    });

    test(' Should render b block in string end', () => {
        //given
        const component =
            <Content>
                Найдите .жн.наибольший.жк. размер кредита, при котором общая сумма выплат заёмщика будет .жн.меньше 7 млн рублей.жк.
            </Content>;
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.find('p')).toHaveLength(1);
        expect(wrapper.find('p').prop('children')).toContain('Найдите ');
        expect(wrapper.find('p').prop('children')).toContain(' размер кредита, при котором общая сумма выплат заёмщика будет ');
        expect(wrapper.find('p').find('b')).toHaveLength(2);
        expect(wrapper.find('p').children()).toHaveLength(4);
        expect(wrapper.find('p').childAt(1).prop('children')).toContain('наибольший');
        expect(wrapper.find('p').childAt(3).prop('children')).toContain('меньше 7 млн рублей')
    });

    test(' Should render b block in string begin', () => {
        //given
        const component =
            <Content>
                .жн.Найдите наибольший.жк. размер кредита, при котором общая сумма выплат заёмщика будет .жн.меньше 7 млн рублей.жк.
            </Content>;
        //when
        const wrapper = shallow(component);
        //then
        //then
        expect(wrapper.find('p')).toHaveLength(1);
        expect(wrapper.find('p').prop('children')).toContain(' размер кредита, при котором общая сумма выплат заёмщика будет ');
        expect(wrapper.find('p').find('b')).toHaveLength(2);
        expect(wrapper.find('p').children()).toHaveLength(3);
        expect(wrapper.find('p').childAt(0).prop('children')).toContain('Найдите наибольший');
        expect(wrapper.find('p').childAt(2).prop('children')).toContain('меньше 7 млн рублей');
    });

    test(' Should render mathJax block', () => {
        //given
        const component =
            <Content>
                трудятся суммарно `t^2` часов в неделю
            </Content>;
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.containsMatchingElement(
            <p>трудятся суммарно <Formula>`t^2`</Formula> часов в неделю</p>
        )).toEqual(true)
    });

    test(' Should render mathJax block in string end', () => {
        //given
        const component =
            <Content>
                трудятся суммарно `t^2`
            </Content>;
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.find('p')).toHaveLength(1);
        expect(wrapper.find('p').prop('children')).toContain('трудятся суммарно ');
        expect(wrapper.find('p').find(Formula)).toHaveLength(1);
        expect(wrapper.find('p').children()).toHaveLength(2);
        expect(wrapper.find('p').find(Formula).prop('children')).toContain('`t^2`');
    });

    test(' Should render mathJax block in string begin', () => {
        //given
        const component =
            <Content>
                `t^2` часов в неделю
            </Content>;
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.find('p')).toHaveLength(1);
        expect(wrapper.find('p').prop('children')).toContain(' часов в неделю');
        expect(wrapper.find('p').find(Formula)).toHaveLength(1);
        expect(wrapper.find('p').children()).toHaveLength(2);
        expect(wrapper.find('p').find(Formula).prop('children')).toContain('`t^2`');
    });

    test(' Should render mathJax and b block', () => {
        //given
        const component =
            <Content>
                трудятся суммарно `t^2` часов в .жн.неделю.жк.
            </Content>;
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.find('p')).toHaveLength(1);
        expect(wrapper.find('p').prop('children')).toContain('трудятся суммарно ');
        expect(wrapper.find('p').prop('children')).toContain(' часов в ');
        expect(wrapper.find('p').find(Formula)).toHaveLength(1);
        expect(wrapper.find('p').find('b')).toHaveLength(1);
        expect(wrapper.find('p').children()).toHaveLength(4);
        expect(wrapper.find('p').find(Formula).prop('children')).toContain('`t^2`');
        expect(wrapper.find('p').find('b').prop('children')).toContain('неделю');
    });
});