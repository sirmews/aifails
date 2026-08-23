declare module '*.wasm' {
  const content: WebAssembly.Module | WebAssembly.Source;
  export default content;
}

declare module '@resvg/resvg-wasm/index_bg.wasm' {
  const content: WebAssembly.Module | WebAssembly.Source;
  export default content;
}
