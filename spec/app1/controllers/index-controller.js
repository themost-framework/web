import {httpPost} from '../../../decorators';

const { HttpController } = require('../../../index');
const { httpGet, httpAction, httpController } = require('../../../decorators');

@httpController()
class IndexController extends HttpController {
    constructor(context) {
        super(context);
    }

    /**
     * GET /hello.html
     */
    @httpGet()
    @httpAction('index')
    async index() {
        return {
            message: 'Hello World'
        };
    }

    @httpPost()
    @httpAction('index')
    async postIndex(data) {
        return {
            message: 'Hello World',
            data
        };
    }

    @httpPost()
    @httpAction('form')
    async postForm(message) {
        return {
            message: 'Hello World',
            data: {
                message
            }
        };
    }

    @httpPost()
    @httpAction('upload')
    async postFile(attachment, attachmentType) {
        return {
            attachmentType,
            attachment: {
                originalFilename: attachment.originalFilename,
            }
        };
    }
}

export default IndexController;
