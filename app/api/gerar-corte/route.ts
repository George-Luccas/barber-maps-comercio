import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.image) return NextResponse.json({ error: "Foto não recebida" }, { status: 400 });

    console.log("🚀 Lendo Stream do Flux Schnell...");

    const output: any = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `A professional barbershop photo of the man from the reference image with a ${body.prompt} haircut, high resolution, realistic`,
          image: body.image,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "2:3",
          output_format: "webp",
          num_inference_steps: 4
        }
      }
    );

    // CORREÇÃO AQUI: O Flux Schnell no Replicate às vezes retorna um Stream. 
    // Precisamos transformar isso em texto.
    let imageUrl = "";
    
    if (typeof output === "object" && output.url) {
        imageUrl = output.url().toString();
    } else if (Array.isArray(output)) {
        imageUrl = output[0].toString();
    } else {
        imageUrl = output.toString();
    }

    console.log("✅ URL FINAL EXTRAÍDA:", imageUrl);
    return NextResponse.json({ url: imageUrl });

  } catch (error: any) {
    console.error("❌ ERRO API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}