const webdriverio = require("webdriverio")

const browser = webdriverio.remote({
    host: "localhost",
    port: "4444",
    path: "wd/hub",
    baseUrl: "http://localhost:3000",
    desiredCapabilities: {
        browserName: "chrome"
    }
})

browser
    .url("/")
    .isExisting(".root")
    .then(exist => {
        if(exist) {
            console.log("Блок root появился")
        } else {
            console.error("Блок root не появился")
        }
    })