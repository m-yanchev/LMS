const Page = require('./page')

class TermPage extends Page {

    get header() { return $('#header') }
    get section1() { return $('#section1') }
    get section2() { return $('#section2') }
    get section3() { return $('#section3') }

    open() {
        super.open('term')
    }
}

module.exports = new TermPage()