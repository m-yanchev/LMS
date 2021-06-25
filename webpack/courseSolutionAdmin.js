module.exports = {
    entry: {
        courseSolutionAdmin: './courseSolutionAdmin/index.js'
    },
    watchOptions: {
        ignored: ['server/**', "landing/**", "course/**", "main/**"]
    }
};