import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Construct the absolute path to the instructions file
const instructionsPath = path.join(process.cwd(), 'src', 'lib', 'system_instructions.txt');
// Read the file content
let systemInstructions;
try {
  systemInstructions = fs.readFileSync(instructionsPath, 'utf-8');
} catch (error) {
  console.error("Error reading system instructions file:", error);
  // Provide a fallback or handle the error appropriately
  systemInstructions = "Error: Could not load system instructions."; 
}

const MODEL_NAME = "gemini-2.0-flash"; // Using flash for potentially faster responses

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const diffText = await file.text();

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }

    // Initialize GoogleGenAI with apiKey
    const genAI = new GoogleGenAI({ apiKey: apiKey }); 

    const prompt = systemInstructions + "\n\nDiff:\n" + diffText;

    // Generate content using the specified model and prompt
    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    // Extract the text response
    const text = result.text; 
    
    // Attempt to parse the response as JSON
    let commitData;
    try {
      // Remove potential markdown backticks if present
      const cleanedText = text.replace(/^```json\n?|\n?```$/g, '');
      commitData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Error parsing LLM response:", parseError, "Raw response:", text);
      // Fallback if JSON parsing fails
       commitData = {
         subject: 'Error processing response',
         description: 'Could not parse the generated commit message.',
       };
    }

    return new Response(JSON.stringify({
      subject: commitData.subject || 'Subject not generated',
      description: commitData.description || 'Description not generated'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in API route:", error);
    return new Response(JSON.stringify({ 
      subject: "Server Error", 
      description: error.message || "An internal server error occurred." 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 