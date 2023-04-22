import { llm } from "../index.js";
import { loadQAStuffChain } from "langchain/chains";
import {vectorStore} from "../index.js";



export const findAns = async (req, res) => {
    
    const {data} = req.body;
    console.log(data);
    if(data.trim().length === 0){
        return res.status(402).json("question field cannot be empty");
    }
    try{
        const docs = await vectorStore.then(function(value) {
            return value.similaritySearch(data)
        });
        
    
        const chain = loadQAStuffChain(llm);
        const result = await chain.call({
            input_documents: docs,
            question: data,
        });
        
    console.log(result);
        res.status(200).json(result);
    }
    catch(error){
        res.status(400).json("some error ocurred");
    }
    
}