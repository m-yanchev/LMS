module.exports = {
    entry: {
        landing: './src/client/entryPoints/landing/index.js'
    },
    watchOptions: {
        ignored: ['courseSolutionAdmin/**', 'server/**', "main/**", "course/**", "teacher/**"]
    }
};