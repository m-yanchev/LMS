import React from 'react'
import {shallow} from "enzyme";
import Updater from "../main/HOC/Updater";

describe('Updater', () => {

    //given
    class ReactComponent extends React.Component {
        render() {
            return <div>Hello</div>
        }
    }
    const Component = Updater(ReactComponent, {
        aliases: ['algebra', 'vynesenie_za_skobki_obchsego_mnogitelya', 'primer_1', '1']});
    const component = (
        <Component
            content={{
                task: {desc: 'desc'}, headings: ['Алгебра', 'Вынесение за скобки общего множителя', 'Пример 1', '1']}}
            userModeProps={{isEditMode: true}}
            modalProps={{onInput: jest.fn()}}
            loaderProps={{update: jest.fn()}}
            prop1={'prop1'}
            prop2={'prop2'}
        />
    );

    //when
    const wrapper = shallow(component);

    test(' Should render ComponentName Component', () => {
        //given
        //when
        //then
        expect(wrapper.containsMatchingElement(
            <ReactComponent
                prop1={'prop1'}
                prop2={'prop2'}
            />
        )).toEqual(true);
    })
});