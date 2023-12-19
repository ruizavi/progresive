import express, { Application } from "express";
import { RouterResolver } from "./router-resolver";

export class ApplicationConfig {
	private declare app: Application;
	private static instance: ApplicationConfig;

	private globalPrefix = "";
	private baseDir = "";

	private constructor() {
		this.app = express();
	}

	public static create() {
		if (!ApplicationConfig.instance) {
			ApplicationConfig.instance = new ApplicationConfig();
		}

		return ApplicationConfig.instance;
	}

	public getApp() {
		return this.app;
	}

	public setGlobalPrefix(prefix: string) {
		this.globalPrefix = prefix;
	}

	public getGlobalPrefix() {
		return this.globalPrefix;
	}

	public setBaseDir(dir: string) {
		this.baseDir = dir;
	}

	public getBaseDir() {
		return this.baseDir;
	}

	public start(port: number) {
		this.app.use(express.json());

		const routerResolver = new RouterResolver(ApplicationConfig.instance);

		routerResolver.resolve();

		try {
			this.app.listen(port, () => {
				console.log(`🚀 Listening on port ${port}`);
			});
		} catch (error) {}
	}
}
