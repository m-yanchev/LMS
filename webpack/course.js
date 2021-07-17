module.exports = {
    entry: {
        course: './src/client/entryPoints/course.js'
    },
    watchOptions: {
        ignored: ['courseSolutionAdmin/**', 'server/**', "main/**", "landing/**", "teacher/**"]
    }
};