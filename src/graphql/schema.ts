import {readFileSync} from "fs";
import {join} from "path";

const schemaPath = join(__dirname, "schema.graphql");
const Schema = readFileSync(schemaPath, "utf-8");

export default Schema;