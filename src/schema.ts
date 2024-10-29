import {gql} from "apollo-server-express";
import {readFileSync} from "fs";
import {join} from "path";

const schemaPath = join(__dirname, "schema.graphql");
const typeDefs = readFileSync(schemaPath, "utf-8");
const Schema = gql`${typeDefs}`;

export default Schema;