module.exports = {
    entry: {
        teacher: './src/client/entryPoints/teacher.js'
    },
    watchOptions: {
        ignored: ['courseSolutionAdmin/**', 'server/**', "main/**", "landing/**", "course/**"]
    }
};