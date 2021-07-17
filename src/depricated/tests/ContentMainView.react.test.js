import React from 'react';
import {shallow} from "enzyme";
import ContentMainView from "../../client/entryPoints/main/components/views/ContentMainView";
import WrapComponentFunctionStack from '../../client/entryPoints/main/HOC/WrapComponentFunctionStack'
import MainView from './ContentMainView.react.test'
import UserMode from "../common/components/UserMode";
import ComponentLoader from "../../client/entryPoints/main/HOC/ComponentLoader";
import LessonsView from "../../client/entryPoints/main/components/Body";

const mockComponent = MainView;

jest.mock("../client/Loader", () => ({load: () => 'load'}));
jest.mock('../client/components/views/MainView/', () => () => 'MainView');
jest.mock('../client/HOC/WrapComponentFunctionStack', () => {
    return jest.fn(() => {
        return mockComponent
    })
});

describe('ContentMainView', () => {

    test(' Render MainView ', () => {
        const wrapper = shallow(
            <ContentMainView path={'algebra/'}/>);
        expect(wrapper.find(MainView)).toHaveLength(1);
    });

    test(' Call WrapComponentFunctionStack', () => {

        shallow(
            <ContentMainView
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/'}
            />);

        expect(WrapComponentFunctionStack).toBeCalled();
    });

    test(' Transmitted funcStack for ComponentListView', () => {

        shallow(
            <ContentMainView
                response='response'
                path={'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
            />);

        const funcStack = [{
            name: MainView
        }, {
            name: UserMode,
        }, {
            name: ComponentLoader,
            otherProps: {response: 'response', path: 'algebra/vynesenie-obshchego-mnozhitelya-za-skobki/primer-1/'}
        }];
        expect(WrapComponentFunctionStack.mock.calls[0]).toMatchObject([LessonsView, funcStack]);
    });
});