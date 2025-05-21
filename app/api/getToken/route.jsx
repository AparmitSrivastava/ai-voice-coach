import  {AssemblyAI}  from "assemblyai"
import { NextResponse } from "next/server"

const assemblyAi = new AssemblyAI({apiKey:process.env.ASSEMBLY_API_KEY})
// console.log("Loaded ASSEMBLY_API_KEY:", process.env.ASSEMBLY_API_KEY  ? "Available" : "Missing"); // TEMP

export async function GET(req) {
  try {
    const token = await assemblyAi.realtime.createTemporaryToken({ expires_in: 3600 });
    return NextResponse.json(token);
  } catch (error) {
    console.error("Error fetching AssemblyAI token:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}