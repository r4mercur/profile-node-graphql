import * as path from "node:path";
import {Storage} from "@google-cloud/storage";

/**
 * Google Cloud Storage
 *
 * Credentials, project and bucket can be set with GCS_KEY_FILE, GCS_PROJECT_ID and GCS_BUCKET.
 * Setting STORAGE_EMULATOR_HOST (e.g. http://localhost:4443) points the client at a local
 * emulator such as fake-gcs-server instead of Google; the integration tests use that.
 * @type {Storage} make sure to change the keyFilename to your own
 */
const googleCloudStorage = new Storage({
    keyFilename: process.env.GCS_KEY_FILE ?? path.join(__dirname, "./nodegraphqlmagestore-f842e81864fd.json"),
    projectId: process.env.GCS_PROJECT_ID ?? "nodegraphqlmagestore",
})

const bucketName = process.env.GCS_BUCKET ?? "nodegraphql-user-avatar";
const bucket = googleCloudStorage.bucket(bucketName);

export {bucket}
