import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

import * as dotenv from "dotenv";
import ecommercerouter from "./router/ecommerce.router.js";
import usertouter from "./router/user.router.js";
dotenv.config();

export const app = express();
const Port = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;
export const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");
app.use(cors());
app.use(express.json());

app.use("/", ecommercerouter);
app.use("/", usertouter);
app.listen(Port, () => console.log(`${Port} is running`));
