import * as path from "node:path";
import {Storage} from "@google-cloud/storage";


/**
 * Google Cloud Storage
 * @type {Storage} make sure to change the keyFilename to your own
 */
const googleCloudStorage = new Storage({
    keyFilename: path.join(__dirname, "./nodegraphqlmagestore-f842e81864fd.json"),
    projectId: "nodegraphqlmagestore",
})

const bucketName = "nodegraphql-user-avatar";
const bucket = googleCloudStorage.bucket(bucketName);

export {bucket}