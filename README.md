# AI Voice Coach

A mock-interview web application with voice interaction capabilities.

## Features

- **Speech-to-Text (STT)**: Uses Web Speech API for real-time transcription
- **AI Responses**: Powered by Gemini via OpenRouter
- **Text-to-Speech (TTS)**: Uses Gemini Speech Generation API for high-quality voice synthesis

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Gemini API key from [ai.google.dev](https://ai.google.dev)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-voice-coach
```

2. Install dependencies:
```bash
npm install
```

### Gemini API Setup

1. **Get Your Gemini API Key**:
   - Go to [Google AI Studio](https://ai.google.dev/)
   - Sign in with your Google account
   - Click "Get API Key" or navigate to API Keys section
   - Create a new API key (or use an existing one)
   - Copy the API key

2. **Set Environment Variable**:
   - Create a `.env.local` file in the project root (if it doesn't exist)
   - Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Note**: The Gemini API key is different from Google Cloud credentials. You don't need:
   - Google Cloud Console setup
   - Service accounts
   - Billing accounts
   - Any JSON credential files

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
NEXT_PUBLIC_AI_OPENROUTER=your_openrouter_api_key
NEXT_PUBLIC_CONVEX_URL=your_convex_url
GEMINI_API_KEY=your_gemini_api_key_from_ai_google_dev
```

### Running the Application

1. **Development mode**:
```bash
npm run dev
```

2. **Production build**:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### POST /api/tts

Converts text to speech using Gemini Speech Generation API.

**Request Body**:
```json
{
  "text": "The text you want to convert to speech"
}
```

**Response**:
```json
{
  "audioContent": "<base64 encoded audio>"
}
```

**Error Response**:
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request (missing or invalid text)
- `401`: Invalid API key
- `429`: Quota exceeded
- `500`: Server error

## Project Structure

```
ai-voice-coach/
├── app/
│   ├── api/
│   │   └── tts/
│   │       └── route.js          # TTS API endpoint
│   └── (main)/
│       └── discussion-room/     # Main interview interface
├── controllers/
│   └── ttsController.js         # TTS business logic (Gemini API)
├── services/
│   └── GlobalServices.jsx       # AI model and TTS service
└── package.json
```

## Troubleshooting

### TTS API Errors

1. **"GEMINI_API_KEY environment variable is not set" error**:
   - Ensure you've created a `.env.local` file in the project root
   - Add `GEMINI_API_KEY=your_key_here` to the file
   - Restart your development server after adding the key

2. **"Invalid API key" error**:
   - Verify your API key is correct
   - Make sure you're using the key from [ai.google.dev](https://ai.google.dev), not Google Cloud Console
   - Check that the key hasn't been revoked or expired

3. **"Quota exceeded" error**:
   - Check your API usage in Google AI Studio
   - Free tier has rate limits - wait a moment and try again
   - Consider upgrading if you need higher limits

4. **"Invalid text parameter" error**:
   - Ensure text is a non-empty string
   - Maximum text length is 5000 characters

### Development Tips

- The Gemini Speech API uses the `gemini-2.0-flash` model
- No billing or service account setup required
- API key management is simple - just add it to `.env.local`
- The API returns base64-encoded audio that can be played directly in the browser

## License

[Add your license here]
