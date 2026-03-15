import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@as-integrations/express5";
import express from "express";
import {ApolloServerPluginDrainHttpServer} from "@apollo/server/plugin/drainHttpServer";
import * as http from "node:http";
import Schema from "./graphql/schema";
import Resolver from "./graphql/resolver";
import {setupRabbit} from "./rabbit/rabbit";
import {setupEndpoints} from "./rest/endpoints";
import cors from "cors";

async function startApplication(schema: any, resolvers: any) {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(express.json());
  app.use(cors());

  // authenticateToken is a middleware function that checks if the user is authenticated
  // app.use(authenticateToken);

  setupEndpoints(app);

  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  app.use("/graphql", expressMiddleware(server));

  await new Promise<void>((resolve) => httpServer.listen({port: 4000}, resolve));
  console.log("Server ready at http://localhost:4000/graphql");
}


startApplication(Schema, Resolver).then(() => console.log("Server started"));
setupRabbit().catch(console.error);