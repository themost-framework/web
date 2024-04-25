const {HttpApplication} = require('../index');
const path = require('path');
const express = require('express');
const request = require('supertest');

class TestApplication extends HttpApplication {
    constructor() {
        super(path.resolve(__dirname, 'app1'));
    }
}

describe('PostHandler', () => {
    /**
     * @type {express.Application}
     */
    let app;
    beforeAll(() => {
        // runs before all tests in this block
        app = express();
        const service = new TestApplication();
        app.use(service.runtime());
    });
    it('should handle json', async () => {
        const response = await request(app).post('/').set(
            'Accept', 'application/json'
        ).send({
            message: 'Hello from client'
        })
        expect(response.status).toBe(200);
        const body = response.body;
        expect(body.data).toBeTruthy();
        expect(body.data.message).toEqual('Hello from client');
    });

    it('should handle application\/x-www-form-urlencoded request', async () => {
        const response = await request(app).post('/form').set(
            'Accept', 'application/json'
        ).type('application/x-www-form-urlencoded').send({
            message: 'Form from client'
        });
        expect(response.status).toBe(200);
        const body = response.body;
        expect(body.data).toBeTruthy();
        expect(body.data.message).toEqual('Form from client');
    });

    it('should handle multipart-form request', async () => {
        const response = await request(app).post('/form').set(
            'Accept', 'application/json'
        ).field('message', 'Form message').field('sender', 'client');
        expect(response.status).toBe(200);
        const body = response.body;
        expect(body.data).toBeTruthy();
        expect(body.data.message).toEqual('Form message');
    });

    it('should handle multipart-form request with files', async () => {
        const response = await request(app).post('/upload').set(
            'Accept', 'application/json'
        ).field('attachmentType', 'applicationForm')
            .attach('attachment', path.resolve(__dirname, 'files/lorem-ipsum.pdf'), {
                filename: 'form.pdf',
                contentType: 'application/pdf'
            });
        expect(response.status).toBe(200);
        const body = response.body;
        expect(body.attachmentType).toEqual('applicationForm');
        expect(body.attachment.originalFilename).toEqual('form.pdf');
    });
});
