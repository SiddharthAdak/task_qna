import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import cookieParser from "cookie-parser";
import Routes from "./routes/routes.js";

dotenv.config();

const app = express();  
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: true,
}));

app.use(express.json({limit: '15mb', extended:true}));
app.use(express.urlencoded({limit: '15mb', extended: true}));

const PORT = process.env.PORT || 8000;






app.use('/',Routes);

app.listen(PORT, function(){
    console.log(`Server started on port ${PORT}`);
    
})

// export {llm};