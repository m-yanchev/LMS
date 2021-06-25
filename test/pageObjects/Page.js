class Page {

    constructor() {
        this.title = 'Тетрадка в клеточку'
    }

    get page() {
        return browser;
    }

    open(path) {
        browser.url(path)
    }
}

module.exports = Page;