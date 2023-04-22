import fs from 'fs'
import Data from "../schema/data-schema.js"
import { Configuration, OpenAIApi } from "openai";
import { createEmbeddings } from "./langchain.js"

let key = process.env.OPENAI_KEY
const configuration = new Configuration({
  apiKey: key,
});
async function youtubeTranscribe() {
  if (!fs.existsSync("transcript.txt")) {

    let audioData = fs.createReadStream("audio.mp3");

    const openai = new OpenAIApi(configuration);
    try {
      const response = await openai.createTranscription(
        audioData, // The audio file to transcribe.
        "whisper-1", // The model to use for transcription.
        undefined, // The prompt to use for transcription.
        'json', // The format of the transcription.
        1, // Temperature
        'en' // Language
      )
      console.log(response.data.text);
      try {
        const data = await Data.create({ text: response.data.text })
        console.log("success");
      } catch (error) {
        console.log(error);
      }
      fs.writeFile("transcript.txt", response.data.text, (err) => {
        if (err)
          console.log(err);
        else {
          console.log("File written successfully\n");
          return createEmbeddings();
        }
      });
    }
    catch (error) {
      console.log(error);
    }
  }
  else {
    return createEmbeddings();
  }

}

export default youtubeTranscribe
