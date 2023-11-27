import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: true,
	splitting: false,
	sourcemap: false,
	clean: true,
	minify: true,
	cjsInterop: true,
	platform: "node",
	outDir: "dist/redo",
});