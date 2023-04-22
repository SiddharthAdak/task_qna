import mongoose from "mongoose"
mongoose.set('strictQuery', true);
const Connection = async (username, password) => {
    const URL = `mongodb+srv://${username}:${password}@cluster0.y2yomrp.mongodb.net/?retryWrites=true&w=majority`;
    try{
        await mongoose.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true });
        console.log("Database connected successfully.")
        
    }
    catch(e){
        console.log("Error while connecting with the database ", e);
        
    }
}
export default Connection;