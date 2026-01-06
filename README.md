***

## AI Voice Coach 🎙️

**AI Voice Coach** is a next-generation mock interview web application that simulates real-world interview experiences through **voice interaction**. Powered by **OpenAI**, **AssemblyAI**, and **AWS Polly**, it helps users improve communication, confidence, and preparedness for technical and behavioral interviews.

***

### 🚀 Features

- **Interactive Mock Interviews** — Practice live interviews with an AI interviewer.  
- **Voice Interaction** — Speak naturally; the app understands your responses and replies in real-time.  
- **Smart Evaluation** — Get instant feedback on tone, speed, and clarity.  
- **Session History** — Track past interview sessions and score improvements.  
- **Custom Question Sets** — Tailor questions for specific roles or difficulty levels.  
- **Dark/Light Mode** — Seamless theme toggling with `next-themes`.

***


### 🧠 Tech Stack

| Component | Technology |
|------------|-------------|
| **Framework** | Next.js 15 (App Router) |
| **Frontend** | React 18, TailwindCSS |
| **Backend** | Convex (real-time serverless functions) |
| **Speech Recognition** | AssemblyAI |
| **Speech Synthesis** | AWS Polly |
| **AI Model** | OpenAI API |
| **UI Components** | Radix UI, Lucide React Icons |
| **Animation** | Motion |
| **Notifications** | Sonner |

***

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-voice-coach.git
   cd ai-voice-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**  
   Create a `.env.local` file in the root directory and include:
   ```bash
   OPENAI_API_KEY=your_openai_key
   ASSEMBLYAI_API_KEY=your_assemblyai_key
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=your_aws_region
   CONVEX_DEPLOYMENT=your_convex_deployment_url
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

***

### 🧩 Folder Structure

```
ai-voice-coach/
│
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── lib/                 # Utility and service functions
├── public/              # Static assets
├── styles/              # Tailwind and global styles
├── convex/              # Convex backend logic
├── package.json
└── README.md
```

***

### 🗣️ How It Works

1. The user begins a mock interview session.  
2. The app sends audio input to **AssemblyAI** for transcription.  
3. The transcribed text is processed by **OpenAI** to generate interview responses.  
4. Responses are converted to speech using **AWS Polly** for a lifelike voice reply.  
5. Performance insights are displayed at the end of the session.

***

### 🧰 Scripts

| Command | Description |
|----------|--------------|
| `npm run dev` | Run development server |
| `npm run build` | Build the production app |
| `npm start` | Run the production build |
| `npm run lint` | Lint and fix code issues |

***
