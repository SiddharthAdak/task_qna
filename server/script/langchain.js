import fs from 'fs'
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter"
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { pineconeIndex } from './pinecone.js';
import { PineconeStore } from "langchain/vectorstores/pinecone";

export const createEmbeddings = async() => {
    if (!fs.existsSync("success.txt")) {
        const text = fs.readFileSync("transcript.txt", 'utf-8');
        const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 1000});
        const docs = await textSplitter.createDocuments([text]);
        
        const embeddingModel = new OpenAIEmbeddings({openAIApiKey: process.env.OPENAI_KEY});
        
        const vectorStore = await PineconeStore.fromDocuments(
            docs,
            embeddingModel,
            { pineconeIndex }
        );
        fs.writeFile("success.txt", "success", (err) => {
            if (err)
              console.log(err);
            else {
              console.log("File written successfully\n");
              
            }
        });
        
        return vectorStore;
    }
    else{
        console.log("vector");
        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings({openAIApiKey: process.env.OPENAI_KEY}),
            { pineconeIndex }
        );
        
        return vectorStore;
    }
    

} 

