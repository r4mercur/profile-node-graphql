import {bucket} from '../config/googleCloudStorage';
import {randomUUID} from 'node:crypto';
import * as path from 'node:path';

export interface MulterFile {
    originalname: string;
    buffer: Buffer;
}

export async function uploadImage(file: MulterFile): Promise<string> {
    const blob = bucket.file(randomUUID() +path.extname(file.originalname));
    const blobStream = blob.createWriteStream({
        resumable: false,
    });

    return new Promise((resolve, reject) => {
        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        }).on('error', (err) => {
            reject(`Unable to upload image, something went wrong: ${err}`);
        }).end(file.buffer);
    });
}