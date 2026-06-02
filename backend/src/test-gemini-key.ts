import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function testChatFlow() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing in env");
    return;
  }

  console.log("Using API Key:", `${apiKey.substring(0, 8)}...`);
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    console.log("Initializing gemini-flash-latest with structured systemInstruction Content object...");
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest"
    });

    const chatSession = model.startChat({
      systemInstruction: {
        role: "system",
        parts: [{ text: "You are a fitness coach. Answer in exactly 5 words." }]
      },
      history: [
        {
          role: "user",
          parts: [{ text: "Hello coach!" }]
        },
        {
          role: "model",
          parts: [{ text: "Welcome! Let's get fit." }]
        }
      ]
    });

    console.log("Sending message: 'What should I eat?'");
    const result = await chatSession.sendMessage("What should I eat?");
    console.log("--- SUCCESS! Chat Response: ---");
    console.log(result.response.text().trim());
  } catch (err: any) {
    console.error("--- FAILURE! startChat flow error: ---");
    console.error(err);
  }
}

testChatFlow();
