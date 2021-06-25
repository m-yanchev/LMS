module.exports = {
    entry: {
        course: './entryPoints/course.js'
    },
    watchOptions: {
        ignored: ['courseSolutionAdmin/**', 'server/**', "main/**", "landing/**"]
    }
};