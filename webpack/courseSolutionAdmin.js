module.exports = {
    entry: {
        courseSolutionAdmin: './src/client/entryPoints/courseSolutionAdmin/index.js'
    },
    watchOptions: {
        ignored: ['server/**', "landing/**", "course/**", "main/**", "teacher/**"]
    }
};