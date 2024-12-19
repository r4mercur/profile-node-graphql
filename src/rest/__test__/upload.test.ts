import request from 'supertest';
import express from 'express';
import {setupEndpoints} from '../endpoints';
import {uploadImage} from '../../cloud/cloud-resolver';

jest.mock('../../cloud/cloud-resolver');

const app = express();
app.use(express.json());
setupEndpoints(app);

describe('POST /api/v1/avatar/upload', () => {
    it('should upload an image and return the file URL', async () => {
        const mockFileUrl = 'https://example.com/file.jpg';
        (uploadImage as jest.Mock).mockResolvedValue(mockFileUrl);

        const response = await request(app)
            .post('/api/v1/avatar/upload')
            .attach('file', Buffer.from('dummy file content'), 'test.jpg');

        expect(response.status).toBe(200);
        expect(response.body.fileUrl).toBe(mockFileUrl);
    });

    it('should return 400 if no file is uploaded', async () => {
        const response = await request(app)
            .post('/api/v1/avatar/upload');

        expect(response.status).toBe(400);
        expect(response.text).toBe('No file uploaded.');
    });

    it('should return 500 if uploadImage throws an error', async () => {
        (uploadImage as jest.Mock).mockRejectedValue(new Error('Upload failed'));

        const response = await request(app)
            .post('/api/v1/avatar/upload')
            .attach('file', Buffer.from('dummy file content'), 'test.jpg');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Upload failed');
    });
});