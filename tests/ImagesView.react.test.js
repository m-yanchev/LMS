import React from 'react'
import {shallow} from "enzyme";
import ImagesView from "../main/components/views/ImagesView/";
import styles from "../main/components/views/ImagesView/styles.css";
import ComponentListView from "../main/components/views/ComponentListView/"

jest.mock('../client/components/views/ImagesView/styles.css', () => ({imagesView: 'styles'}));

describe('ImagesView', () => {

    //given
    const imagesViewComponent = (
        <ImagesView
            itemProps='itemProps'
        />
    );

    test(' Should render ImagesView Component', () => {
        //when
        const wrapper = shallow(imagesViewComponent);
        //then
        expect(wrapper.find(ComponentListView)).toHaveLength(1);
        expect(wrapper.find({contextStyles: {imagesView: 'styles'}})).toHaveLength(1);
        expect(wrapper.find({itemProps: 'itemProps'})).toHaveLength(1);
        expect(wrapper.containsMatchingElement(
            <ComponentListView
                contextStyles={{imagesView: 'styles'}}
                itemProps={'itemProps'}
            />
        )).toEqual(true)
    })
});