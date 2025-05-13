import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";

// ensure we run under Node.js so `fs` works
export const runtime = "nodejs";

// where your system instructions live
const INSTRUCTIONS_PATH = path.join(
  process.cwd(),
  "src",
  "lib",
  "system_instructions.txt"
);

export async function POST(request) {
  // 1) load your system instructions at request time
  let systemInstructions;
  try {
    systemInstructions = await fs.readFile(INSTRUCTIONS_PATH, "utf-8");
  } catch (err) {
    console.error("Could not load system instructions:", err);
    return new Response(
      JSON.stringify({
        subject: "Server Error",
        description: "Internal: failed to load system instructions.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 2) grab the uploaded file
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file.text !== "function") {
      return new Response(
        JSON.stringify({
          subject: "Error",
          description: "No file provided.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const diffText = await file.text();

    // 3) basic git-diff format check
    const firstLine = diffText
      .split("\n")
      .find((ln) => ln.trim().length > 0);
    if (!firstLine || !/^diff --git /i.test(firstLine)) {
      return new Response(
        JSON.stringify({
          subject: "Error",
          description:
            'Invalid diff format. Please upload a git diff starting with "diff --git".',
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4) get your API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY missing");
      return new Response(
        JSON.stringify({
          subject: "Server Error",
          description: "Internal: API key not configured.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 5) call Gemini
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `${systemInstructions}\n\nDiff:\n${diffText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        // ask Gemini to give you raw JSON
        responseMimeType: "application/json",
      },
    });

    // 6) parse JSON (no backticks anymore)
    let json;
    try {
      json = JSON.parse(response.text);
    } catch (err) {
      console.error("LLM returned non-JSON:", err, response.text);
      json = {
        subject: "Error processing response",
        description: "Model did not return valid JSON.",
      };
    }

    return new Response(
      JSON.stringify({
        subject: json.subject ?? "No subject returned",
        description: json.description ?? "No description returned",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error in POST handler:", err);
    return new Response(
      JSON.stringify({
        subject: "Server Error",
        description: err.message || "An internal error occurred.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
