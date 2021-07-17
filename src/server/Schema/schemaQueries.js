export const CONTENT_QUERY = `query Content($path: String!) {
            content(path: $path) {
                view
                categoryId
                breadCrumbs {
                    heading
                    alias
                }
                categories {
                    id
                    heading
                    alias
                }
                problemTypes {
                    id
                    heading
                    alias
                    taskDesc
                }
                problems {
                    id
                    key
                    parentId
                    desc
                    solution
                    answer
                    isExample
                    src
                    srcNumb
                }
                videoLessons {
                    id
                    key
                    heading
                    alias
                    path
                    videoId
                }
                tests {
                    id
                    heading
                }
                paidTests {
                    id
                    heading
                }
                webinars {
                    id
                    heading
                    date
                    link
                }
                courses {
                    id
                    heading
                    alias
                    desc
                }
            }
        }`

export const COMPACT_COURSE_QUERY = `query Course($alias: String!) {
            course(alias: $alias) {
                id
                heading
                alias
                desc
            }
        }`

export const FULL_COURSE_QUERY = `query Course($alias: String!) {
                course(alias: $alias) {
                    id
                    heading
                    alias
                    desc
                    topics {
                        id
                        date
                        topic {
                            id
                            heading
                        }
                        videoLessons {
                            id
                            videoLesson {
                                id
                                key
                                heading
                                videoId
                            }
                        }
                    }
                    webinars {
                        id
                        webinar {
                            id
                            heading
                            date
                            link
                        }
                    }
                }
            }`