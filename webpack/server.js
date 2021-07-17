module.exports = {
    target: "node",
    entry: {
        server: './src/server/index.js'
    },
    externals: {
        "passport-vkontakte": "commonjs passport-vkontakte"
    },
    watchOptions: {
        ignored: ['courseSolutionAdmin/**', "course/**"]
    }
};