import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = 3000;
const API_KEY = process.env.API_KEY; 
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(API_KEY);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

async function fetchAndExtractText(link) {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(link);
      const allText = transcript.map(item => item.text).join(" ");
      //console.log(allText);
      return allText;
    } catch (error) {
      console.error('Error fetching or extracting the transcript:', error);
      return null;
    }
}

async function run(transcript) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = "Write the 200 words paragraph summary without headings or points of the provided transcript of youtube video start with your video is about and do not add any headings or points\n" + transcript;
  //console.log(prompt);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}


app.get("/" , async(req,res) => {
    //const allText = await fetchAndExtractText();
    //const summary = await run(allText);
    res.render("index.ejs", { content: "Waiting for data..." });
});
app.post("/getsummary" , async(req,res) => {
    const link = req.body.url; // Declare and assign the value of req.body.url to link
    console.log(link);
    if (!link) {
      return res.status(400).send("URL is required");
    }
    const allText = await fetchAndExtractText(link);
    const summary = await run(allText);
    res.render("summary.ejs", { summary });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});