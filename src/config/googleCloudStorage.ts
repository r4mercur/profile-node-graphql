import * as path from "node:path";
import {Storage} from "@google-cloud/storage";

const googleCloudStorage = new Storage({
    keyFilename: path.join(__dirname, "./nodegraphqlmagestore-d8be30e1e471.json"),
    projectId: "nodegraphqlmagestore",
})

const bucketName = " nodegraphql-user-avatar";
const bucket = googleCloudStorage.bucket(bucketName);

export {bucket}