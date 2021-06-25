const NumbModel = require('./NumbModel');

class HeadingsModel extends NumbModel {

    constructor(db) {
        super(db, "headings")
    }

    async remove({id}) {
        try {
            const headingChildren = await this.find({parentId: id})
            if (headingChildren.length > 0) return this.result.remove.withChildren
            const videoLessonsModel = new NumbModel(this.db, 'videoLessons');
            const videoLessonChildren = await videoLessonsModel.find({parentId: id});
            if (videoLessonChildren.length > 0) return this.result.remove.withChildren
            const webinarsModel = new NumbModel(this.db, 'webinars');
            const webinarChildren = await webinarsModel.find({parentId: id});
            if (webinarChildren.length > 0) return this.result.remove.withChildren
            return await super.remove({id});
        } catch (e) {
            throw e
        }
    }

}

module.exports = HeadingsModel;