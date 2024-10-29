import {ApolloServer} from "apollo-server-express";
import express from "express";
import {ApolloServerPluginDrainHttpServer} from "apollo-server-core";
import * as http from "node:http";
import Schema from "./schema";
import Resolver from "./resolver";

async function startApplication(schema: any, resolvers: any) {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}


startApplication(Schema, Resolver).then(() => console.log("Server started"));