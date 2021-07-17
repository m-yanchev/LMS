export function description(req) {
    const {content} = req.data || {};
    const {view, breadCrumbs} = content || {}
    if (view === 'sections') {
        req.metaDescription = mainDesc()
    } else if (view === 'topics') {
        const section = breadCrumbs[0].heading;
        req.metaDescription = mainDesc(`из раздела ${section}`)
    } else if (view === 'topic') {
        const topic = breadCrumbs[1].heading;
        req.metaDescription = mainDesc(`по теме ${topic}`)
    } else if (view === 'video-lesson') {
        const lesson = breadCrumbs[2].heading;
        req.metaDescription = videoLessonDesc(lesson)
    } else if (view === 'type-problems') {
        const topic = breadCrumbs[1].heading;
        const type = breadCrumbs[2].heading;
        req.metaDescription = typeTasksDesc(topic, type)
    } else if (view === 'problem') {
        const topic = breadCrumbs[1].heading;
        const type = breadCrumbs[2].heading;
        req.metaDescription = taskDesc(topic, type)
    }

    function mainDesc(spec) {
        return `Материалы для подготовки к ЕГЭ по математике${spec ? ' ' + spec: ''}.`
    }

    function videoLessonDesc(spec) {
        return `Видеоурок ${spec}`
    }

    function typeTasksDesc(topic, type) {
        return `Задания на тему ${topic}. ${type}`
    }

    function taskDesc(topic, type) {
        return `Задание на тему ${topic}. ${type}`
    }
}