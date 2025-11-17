/**
 * Convert text to speech using Gemini Speech Generation API
 * @param {string} text - The text to convert to speech
 * @returns {Promise<{audioContent: string}>}
 */
export const convertTextToSpeech = async (text) => {
  // Validate input
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Text parameter is required and cannot be empty");
  }

  // Limit text length to prevent excessive API usage
  const MAX_TEXT_LENGTH = 5000;
  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Text length exceeds maximum of ${MAX_TEXT_LENGTH} characters`);
  }

  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  try {
    // Use the correct Gemini TTS models from Google AI Studio
    // These are the actual TTS models available in AI Studio
    const modelsToTry = [
      "gemini-2.5-pro-preview-tts",
      "gemini-2.5-flash-preview-tts"
    ];

    let lastError = null;
    
    for (const model of modelsToTry) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateSpeech?key=${apiKey}`;
      
      console.log("[TTS Controller] Trying model:", model);
      console.log("[TTS Controller] Calling Gemini Speech API:", {
        url: apiUrl.replace(apiKey, "***"),
        textLength: text.length,
        textPreview: text.substring(0, 50) + "..."
      });

      const requestBody = {
        input: text
      };

      console.log("[TTS Controller] Request body:", JSON.stringify(requestBody).substring(0, 100) + "...");

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("[TTS Controller] Response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorData = {};
        try {
          const errorText = await response.text();
          console.error("[TTS Controller] Error response text:", errorText);
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error("[TTS Controller] Could not parse error response:", parseError);
        }

        console.error("[TTS Controller] Gemini Speech API error for model", model, ":", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        // If it's a 404, try next model
        if (response.status === 404) {
          console.log("[TTS Controller] Model", model, "not found (404), trying next model...");
          lastError = new Error(`Model ${model} not found (404)`);
          continue; // Try next model
        }

        // For other errors, throw immediately (don't try other models)
        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your GEMINI_API_KEY.");
        }

        if (response.status === 429) {
          throw new Error("API quota exceeded. Please try again later.");
        }

        lastError = new Error(
          `Gemini Speech API error: ${response.status} ${response.statusText}. ` +
          `Details: ${errorData.error?.message || JSON.stringify(errorData)}`
        );
        continue; // Try next model for other errors too
      }

      // Success! Parse the response
      const data = await response.json();
      console.log("[TTS Controller] Response data keys:", Object.keys(data));
      console.log("[TTS Controller] Has audio.data:", !!data.audio?.data);

      if (!data.audio?.data) {
        console.error("[TTS Controller] No audio data in response for model", model);
        lastError = new Error("No audio content received from Gemini Speech API");
        continue; // Try next model
      }

      console.log("[TTS Controller] Successfully received audio data from model", model, ", length:", data.audio.data.length);

      return {
        audioContent: data.audio.data,
      };
    }

    // If we get here, all models failed
    throw lastError || new Error(
      "All Gemini TTS models (gemini-2.5-pro-preview-tts, gemini-2.5-flash-preview-tts) failed to generate speech. " +
      "Please check: 1) Your GEMINI_API_KEY is valid, 2) Speech generation is enabled for your API key, 3) You have sufficient quota."
    );
  } catch (error) {
    // Re-throw if it's already a formatted error
    if (error.message && error.message.includes("API")) {
      throw error;
    }

    // Handle network errors
    console.error("Gemini Speech API request error:", {
      message: error.message,
      stack: error.stack,
    });

    throw new Error(
      `Failed to generate speech: ${error.message || "Unknown error"}`
    );
  }
};
