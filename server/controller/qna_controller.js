// import { llm } from "../index.js";
import { loadQAStuffChain } from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import * as blobUtil from 'blob-util';
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import dotenv from "dotenv";
import {nanoid} from "nanoid";
import fs from "fs";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
// import { OpenAI } from "langchain/llms/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const directory = "vector_store/";
dotenv.config();
const llm = new ChatGoogleGenerativeAI({
    modelName: "gemini-pro",
    apiKey: process.env.GOOGLE_API_KEY,
    // maxOutputTokens: 2048,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  });
const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001", // 768 dimensions
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document title",
    apiKey: process.env.GOOGLE_API_KEY
  });
// const embeddings = new OpenAIEmbeddings({
//     openAIApiKey: process.env.OPENAI_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
//     batchSize: 1000, // Default value if omitted is 512. Max is 2048
//   });
export const findAns = async (req, res) => {
    
    const {ques, id} = req.body;
    console.log(ques, id);
    if(ques.trim().length === 0){
        return res.status(402).json("question field cannot be empty");
    }
    try{
        const dir = directory + id;
        const loadedVectorStore = await FaissStore.load(
            dir,
            embeddings
          );
        const docs = await loadedVectorStore.similaritySearch(ques);
        console.log(docs.length);
        
        // const chain = loadQAStuffChain(llm);
        let input_text = docs.map((e) => {
            return e.pageContent
        });
        input_text = input_text.join(" ");
        console.log(input_text);
        const prompt = " Based on the given context give answer to the following query (if the query is not related to the context give a generic answer): ";
        const result = await llm.invoke([
            [
              "human",
              "this is the context / document: " + input_text + prompt + ques,
            ],
          ]);
        console.log(result.content);
        res.status(200).json(result.content);
    }
    catch(error){
        res.status(400).json("some error ocurred");
        console.log(error);
    }
    
}
export const processDoc = async(req, res) => {

    const data = req.file.buffer;
    const file_name = req.body.file_name;
    const blob = blobUtil.arrayBufferToBlob(data);
    console.log(file_name);
    const loader = new PDFLoader(blob, {
        splitPages: false,
      });
    let text = await loader.load();
    text = text[0].pageContent;
    
    // console.log(text);
    const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 1000});
    const docs = await textSplitter.createDocuments([text]);
    let chunks = docs.map((e) => {
        return e.pageContent
    })
    // console.log(chunks);
    console.log(chunks.length); 

    
    
    
    let id_array = [];
    for (let index = 1; index <= chunks.length; index++) {
        id_array.push({id: index});
    }
    const vectorStore = await FaissStore.fromTexts(chunks, id_array, embeddings);
    let vector_dir_name = nanoid();
    let dir = directory + vector_dir_name;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        await vectorStore.save(dir);
    }
    const cookie_data = {vector_dir_name: vector_dir_name, file_name: file_name};
    const cookie_str = JSON.stringify(cookie_data);
    res.cookie("user_data", cookie_str, { httpOnly: true,sameSite: "none", secure: true});
    
    // console.log(vectorStore);
    
    return res.status(200).json(cookie_data);
} 
export const deleteUserData = async(req, res) => {
    try {
        const id = req.params.id;
        const dir = directory + id;
        console.log(dir);
        res.cookie('user_data', '' , { httpOnly: true, maxAge: 1, sameSite: "none", secure: true });
        fs.rmSync(dir, { recursive: true, force: true });
        res.status(200).json("deleted successfully");
    } catch (error) {
        res.status(200).json("deletion failed");
    }
    
}
export const findUserData = async(req, res) => {
    let data = req.cookies.user_data;
    // console.log(data);
    if(!data){
        return res.status(200).json("no data");
    }
    data = JSON.parse(data);
    return res.status(200).json(data);
}