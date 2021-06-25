const Page = require('./page')

class MainPage extends Page {

    get description() {
        return $('[name="Description"]')
    }

    open() {
        super.open('')
    }
}

module.exports = new MainPage()