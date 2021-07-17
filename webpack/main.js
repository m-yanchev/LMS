module.exports = {
    entry: {
        main: './src/client/entryPoints/main/index.js'
    },
    watchOptions: {
        ignored: ['courseSolutionAdmin/**', 'server/**', "landing/**", "course/**", "teacher/**"]
    }
};