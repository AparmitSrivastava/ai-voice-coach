import { NextResponse } from "next/server";
import { convertTextToSpeech } from "@/controllers/ttsController.js";

/**
 * POST /api/tts
 * Converts text to speech using Gemini Speech Generation API
 * 
 * Request body:
 * {
 *   "text": "The text to convert to speech"
 * }
 * 
 * Response:
 * {
 *   "audioContent": "<base64 encoded audio>"
 * }
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { text } = body;

    // Validate text parameter
    if (!text) {
      return NextResponse.json(
        {
          error: "Missing required parameter: text",
          message: "Please provide text in the request body",
        },
        { status: 400 }
      );
    }

    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Invalid text parameter",
          message: "Text must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Generate speech
    const result = await convertTextToSpeech(text);

    // Return audio content
    return NextResponse.json(
      {
        audioContent: result.audioContent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("TTS API Error:", {
      message: error.message,
      stack: error.stack,
    });

    // Return appropriate error response
    const statusCode = error.message?.includes("API key") ? 401 :
                      error.message?.includes("quota") ? 429 :
                      error.message?.includes("Invalid") ? 400 : 500;

    return NextResponse.json(
      {
        error: "Text-to-speech conversion failed",
        message: error.message || "An unexpected error occurred",
      },
      { status: statusCode }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "Only POST method is supported",
    },
    { status: 405 }
  );
}

