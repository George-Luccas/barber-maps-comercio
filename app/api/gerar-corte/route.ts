import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validar body e imagem (agora opcional)
    const hasImage = !!body?.image;
    
    // Validar token
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "Token da API não configurado. Adicione REPLICATE_API_TOKEN ao .env" }, { status: 500 });
    }

    // Configuração do input do SDXL
    const input: Record<string, unknown> = {
      prompt: hasImage 
        ? `close up photo of a man with ${body.prompt}, professional barber shop photography, 8k, realistic, sharp focus`
        : `professional portrait of a man with ${body.prompt} hairstyle, barber shop background, 8k, realistic, sharp focus`,
      num_outputs: 1,
      scheduler: "K_EULER",
      num_inference_steps: 30,
      guidance_scale: 7.5
    };

    // Se tiver imagem, adiciona parâmetros de img2img
    if (hasImage) {
      input.image = body.image;
      input.prompt_strength = 0.65;
    }

    console.log(`🚀 Iniciando geração com SDXL (Modo: ${hasImage ? 'Img2Img' : 'Text2Image'})...`);

    // Usando SDXL oficial da Stability AI
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      { input }
    );

    console.log("✅ Resultado recebido (Raw):", output);

    let imageUrl = "";

    // Helper para converter stream em buffer
    const streamToBuffer = async (stream: ReadableStream) => {
        const reader = stream.getReader();
        const chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }
        // Concatenar chunks (Uint8Array)
        const length = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }
        return result;
    };

    // Lógica principal de tratamento do output
    if (Array.isArray(output) && output.length > 0) {
        const item = output[0];
        
        // Se for um Stream (Replicate às vezes retorna stream de bytes para imagens)
        if (item instanceof ReadableStream || (item && typeof item.getReader === 'function')) {
            console.log("🔄 Convertendo Stream para Base64...");
            const buffer = await streamToBuffer(item);
            const base64 = Buffer.from(buffer).toString('base64');
            imageUrl = `data:image/png;base64,${base64}`;
        } 
        // Se for URL string
        else if (typeof item === 'string') {
            imageUrl = item;
        }
        // Se for objeto com toString (fallback)
        else {
            imageUrl = String(item);
        }
    } else if (typeof output === "object" && output !== null && 'url' in output) {
        imageUrl = (output as { url: () => string }).url().toString();
    } else {
        imageUrl = String(output);
    }
    
    console.log("✅ URL/Base64 Final:", imageUrl.substring(0, 50) + "...");

    return NextResponse.json({ url: imageUrl });

  } catch (error) {
    console.error("❌ ERRO API:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: "Erro ao gerar corte: " + errorMessage }, { status: 500 });
  }
}