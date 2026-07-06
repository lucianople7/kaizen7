import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    let adapterFile = "";
    if (url.includes("github.com")) {
      adapterFile = "github-adapter.js";
    } else if (url.includes("huggingface.co")) {
      adapterFile = "huggingface-adapter.js";
    } else {
      return NextResponse.json({ error: "Only GitHub and Hugging Face URLs are supported." }, { status: 400 });
    }

    // Ruta absoluta al adapter de KAIZEN7 (ahora thefocuxOS está dentro de kaizen7)
    const kaizen7LibPath = path.resolve(process.cwd(), "../lib");
    const adapterPath = path.join(kaizen7LibPath, adapterFile);

    const { stdout, stderr } = await execAsync(`node "${adapterPath}" "${url}"`);
    
    if (stderr && !stdout) {
      console.error("Adapter Error:", stderr);
      return NextResponse.json({ error: "Adapter failed execution" }, { status: 500 });
    }

    let packet;
    try {
      packet = JSON.parse(stdout);
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse adapter output", raw: stdout }, { status: 500 });
    }

    return NextResponse.json({ success: true, packet });
  } catch (error: any) {
    console.error("Extraction API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
