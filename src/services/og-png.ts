import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';

let wasmInitialized = false;

async function ensureWasm() {
  if (!wasmInitialized) {
    await initWasm(resvgWasm);
    wasmInitialized = true;
  }
}

export async function svgToPng(svgString: string): Promise<Uint8Array> {
  await ensureWasm();
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}
