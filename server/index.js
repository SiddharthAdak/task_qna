import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import Connection from "./database/db.js";
import youtubeTranscribe from "./script/whisper.js"
import Routes from "./routes/routes.js";
import { OpenAI } from "langchain/llms/openai";

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json({limit: '15mb', extended:true}));
app.use(express.urlencoded({limit: '15mb', extended: true}));

const PORT = process.env.PORT || 8000;
 

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
console.log(username);
Connection(username, password);


const llm = new OpenAI({openAIApiKey: process.env.OPENAI_KEY });
const vectorStore = youtubeTranscribe();


app.use('/',Routes);

app.listen(PORT, function(){
    console.log(`Server started on port ${PORT}`);
    
})

export {llm, vectorStore};