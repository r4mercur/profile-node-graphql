import {ApolloServer} from "apollo-server-express";
import express from "express";
import {ApolloServerPluginDrainHttpServer} from "apollo-server-core";
import * as http from "node:http";
import Schema from "./graphql/schema";
import Resolver from "./graphql/resolver";
import {generateToken} from "./auth/authtoken";
import {setupRabbit} from "./rabbit/rabbit";

async function startApplication(schema: any, resolvers: any) {
  const app = express();
  app.use(express.json());

  app.post("/login", (req, res) => {
    const username = req.body.username;
    const user = {name: username};

    const token = generateToken(user);
    res.json({token});
  });

  // authenticateToken is a middleware function that checks if the user is authenticated
  // app.use(authenticateToken);

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
setupRabbit().catch(console.error);