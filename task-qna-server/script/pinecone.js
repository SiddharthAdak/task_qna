import { PineconeClient } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const client = new PineconeClient();

await client.init({
  environment: process.env.PINECONE_ENV,
  apiKey: process.env.PINECONE_API_KEY,
});
export const pineconeIndex = client.Index(process.env.PINECONE_INDEX);