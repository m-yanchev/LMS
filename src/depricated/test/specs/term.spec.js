const termPage = require('../pageObjects/term.page')

describe('Term page', () => {
    it('should have header "Пользовательское соглашение"', () => {
        termPage.open()
        expect(termPage.header).toHaveText('Пользовательское соглашение');
    })
    it('should have section1 "1.Общие условия"', () => {
        termPage.open()
        expect(termPage.section1).toHaveText('1.Общие условия');
    })
    it('should have section2 "2. Обязательства Пользователя"', () => {
        termPage.open()
        expect(termPage.section2).toHaveText('2. Обязательства Пользователя');
    })
    it('should have section3 "3. Прочие условия"', () => {
        termPage.open()
        expect(termPage.section3).toHaveText('3. Прочие условия');
    })
})