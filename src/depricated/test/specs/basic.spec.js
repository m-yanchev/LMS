const mainPage = require('../pageObjects/main.page')

describe('Main page', () => {
    it('should have title "Тетрадка в клеточку"', () => {
        mainPage.open()
        expect(mainPage.page).toHaveTitle('Тетрадка в клеточку');
    })
    it('should have description "Материалы для подготовки к ЕГЭ по математике."', () => {
        mainPage.open()
        expect(mainPage.description).toHaveAttr('content', 'Материалы для подготовки к ЕГЭ по математике.');
    })
})