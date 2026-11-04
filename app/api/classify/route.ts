
import { NextResponse } from "next/server";

export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 25_000;

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type Classification = {
  item: string;
  category: string;
  confidence: number;
  recyclable: boolean;
  disposalInstructions: string;
  safetyNote: string;
};

const PROMPT = `
Identify the main waste item in the supplied image.

Return ONLY valid JSON with these fields:
{
  "item": "identified item name",
  "category": "Plastic, Paper, Glass, Metal, Organic, Electronic, Hazardous, or General Waste",
  "confidence": 0.95,
  "recyclable": true,
  "disposalInstructions": "practical disposal instructions",
  "safetyNote": "relevant safety warning or an empty string"
}

Rules:
- confidence must be a number from 0 to 1.
- recyclable must be a boolean.
- Do not claim certainty if the image is unclear.
- If no waste item can be identified, explain that in the item field.
- Never recommend unsafe handling of hazardous waste.
- Return valid JSON only, without Markdown.
`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseClassification(text: string): Classification {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Groq returned invalid JSON. Please try again.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Groq returned an invalid classification.");
  }

  return {
    item:
      typeof parsed.item === "string"
        ? parsed.item
        : "Unknown item",
    category:
      typeof parsed.category === "string"
        ? parsed.category
        : "General Waste",
    confidence:
      typeof parsed.confidence === "number" &&
      Number.isFinite(parsed.confidence)
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0,
    recyclable:
      typeof parsed.recyclable === "boolean"
        ? parsed.recyclable
        : false,
    disposalInstructions:
      typeof parsed.disposalInstructions === "string"
        ? parsed.disposalInstructions
        : "Check your local waste disposal guidelines.",
    safetyNote:
      typeof parsed.safetyNote === "string"
        ? parsed.safetyNote
        : "",
  };
}

async function classifyWithGroq(
  base64Image: string,
  mimeType: string,
  apiKey: string
): Promise<Classification> {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: PROMPT,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_completion_tokens: 800,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    const details = (await response.text()).slice(0, 1000);
    console.error(`Groq HTTP ${response.status}:`, details);

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Groq rejected your API key. Check GROQ_API_KEY in .env.local."
      );
    }

    if (response.status === 429) {
      throw new Error(
        "Groq rate limit or usage limit reached. Please wait and try again."
      );
    }

    if (response.status === 400) {
      throw new Error(
        "Groq rejected the request. Check the model ID and image format."
      );
    }

    throw new Error(`Groq request failed with status ${response.status}.`);
  }

  const data: unknown = await response.json();

  if (!isRecord(data) || !Array.isArray(data.choices)) {
    throw new Error("Groq returned an unexpected response.");
  }

  const choice: unknown = data.choices[0];

  if (!isRecord(choice) || !isRecord(choice.message)) {
    throw new Error("Groq returned no classification result.");
  }

  const content = choice.message.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Groq returned an empty response.");
  }

  return parseClassification(content);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is missing. Add it to .env.local and restart the server.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an image to classify." },
        { status: 400 }
      );
    }

    if (!SUPPORTED_TYPES.includes(image.type)) {
      return NextResponse.json(
        {
          error: "Unsupported image format. Use JPG, PNG, WEBP, or GIF.",
        },
        { status: 415 }
      );
    }

    if (image.size === 0) {
      return NextResponse.json(
        { error: "The uploaded image is empty." },
        { status: 400 }
      );
    }

    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image is too large. Maximum size is 10 MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const result = await classifyWithGroq(
      base64Image,
      image.type,
      apiKey
    );

    return NextResponse.json({
      result,
      provider: "groq",
    });
  } catch (error: unknown) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    const message = isTimeout
      ? "Groq request timed out. Please try again."
      : error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    console.error("Waste classification error:", message);

    const status = isTimeout
      ? 504
      : message.toLowerCase().includes("rate limit") ||
          message.toLowerCase().includes("usage limit")
        ? 429
        : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
