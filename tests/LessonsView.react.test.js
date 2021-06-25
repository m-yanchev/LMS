import React from 'react'
import {shallow} from "enzyme";
import LessonsView from "../main/components/Body";
import styles from "../main/components/views/LessonsView/styles.css";

describe('LessonsView', () => {

    //when
    test(' Should render empty div', () => {
        //given
        const component = (
            <LessonsView
                content={{view: 'sections', videoLessons: {items: []}, taskTypes: null}}
                userModeProps={{isEditMode: false}}
            />
        );
        //when
        const wrapper = shallow(component);
        //then
        expect(wrapper.find('div')).toHaveLength(1);
        expect(wrapper.find({className: styles['lessons-view']})).toHaveLength(1);
    });

    //when
    test(' Should render videoLessons', () => {
        //given
        const component = (
            <LessonsView
                content={{view: 'topic', videoLessons: {items: []}, taskTypes: {items: []}}}
                userModeProps={{isEditMode: true}}
            />
        );
        //when
        const wrapper = shallow(component);

        //then
        expect(wrapper.find('div')).toHaveLength(3);
        expect(wrapper.find('h1')).toHaveLength(2);
        expect(wrapper.find({className: styles['lessons-view']})).toHaveLength(1);
        expect(wrapper.find({className: styles['video-lessons']})).toHaveLength(1);
        expect(wrapper.find({className: styles['task-types']})).toHaveLength(1);
        expect(wrapper.find({children: 'Видеоуроки'})).toHaveLength(1);
        expect(wrapper.find({children: 'Задачник'})).toHaveLength(1);
    });
});