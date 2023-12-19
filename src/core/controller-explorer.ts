import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DEFAULT = "default";

export class ControllerExplorer {
	private declare controllers: Record<string, any>;

	private explorer(dir: string, result: Record<string, any> = {}) {
		const files = readdirSync(dir);

		for (const file of files) {
			const filePath = join(dir, file);
			const isDirectory = statSync(filePath).isDirectory();

			if (isDirectory) {
				this.explorer(filePath, result);
			} else if (file.endsWith(".controller.ts")) {
				const controllerName = file.replace(".controller.ts", "");
				const controller = require(filePath);
				result[controllerName] = controller[DEFAULT];
			}
		}

		this.controllers = result;
	}

	public get(dir: string) {
		this.explorer(dir);

		return this.controllers;
	}
}
