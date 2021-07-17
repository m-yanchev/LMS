// @flow

import React from 'react';
import NavBar from "../../viewComponents/NavBar";
import Segment from "../../viewComponents/Segment";
import Footer from "../../viewComponents/Footer";

const ABOUT_HEADER = "Обо мне"
const PRICE_HEADER = "Форматы занятий"
const REVIEWS_HEADER = "Отзывы"

export default function TeacherPage() {

    const links = [
        {title: "Обо мне", href: "/teacher/#about"},
        {title: "Форматы и цены", href: "/teacher/#price"},
        {title: "Отзывы", href: "/teacher/#reviews"},
    ]

    return (
        <>
            <NavBar links={links}/>
            <Segment header={ABOUT_HEADER}/>
            <Segment header={PRICE_HEADER}/>
            <Segment header={REVIEWS_HEADER}/>
            <Footer/>
        </>
    )
}