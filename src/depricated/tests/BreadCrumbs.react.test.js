import React from 'react';
import { BrowserRouter } from "react-router-dom";
import BreadCrumbs from '../../client/entryPoints/main/components/common/BreadCrumbs'
import renderer from 'react-test-renderer'

test('BreadCrumbs', () => {
    let component = renderer.create(
        <BrowserRouter>
            <BreadCrumbs
                headings={[]}
                aliases={[]}
                view={'sections'}
            />,
        </BrowserRouter>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    component = renderer.create(
        <BrowserRouter>
            <BreadCrumbs
                headings={['Алгебра']}
                aliases={['algebra']}
                view={'topics'}
            />,
        </BrowserRouter>
    );
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    component = renderer.create(
        <BrowserRouter>
            <BreadCrumbs
                headings={["Алгебра","Вынесение общего множителя за скобки"]}
                aliases={['algebra', 'vynesenie-obshchego-mnozhitelya-za-skobki']}
                view={'topic'}
            />
        </BrowserRouter>
    );
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    component = renderer.create(
        <BrowserRouter>
            <BreadCrumbs
                headings={["Алгебра","Вынесение общего множителя за скобки", "Пример №1"]}
                aliases={['algebra', 'vynesenie-obshchego-mnozhitelya-za-skobki', 'primer-1']}
                view={'type-tasks'}
            />
        </BrowserRouter>
    );

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    component = renderer.create(
        <BrowserRouter>
            <BreadCrumbs
                headings={["Алгебра","Вынесение общего множителя за скобки", "Пример №1", "1"]}
                aliases={['algebra', 'vynesenie-obshchego-mnozhitelya-za-skobki', 'primer-1', '1']}
                view={'task'}
            />
        </BrowserRouter>
    );
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    component = renderer.create(
        <BrowserRouter>
            <BreadCrumbs
                headings={["Алгебра","Вынесение общего множителя за скобки", "Пример №1"]}
                aliases={['algebra', 'vynesenie-obshchego-mnozhitelya-za-skobki', 'primer-1']}
                view={'video-lesson'}
            />
        </BrowserRouter>
    );
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});