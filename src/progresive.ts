import { readdirSync, statSync } from "fs";
import { join } from "path";
import cors, { CorsOptions } from "cors";
import express, { Application as ExpressApplication, Router } from "express";
import session, { SessionOptions } from "express-session";
import morgan from "morgan";
import passport from "passport";
import "reflect-metadata";
import {
	CONTROLLER_METADATA,
	DEFAULT,
	GUARDIAN_CONTROLLER_METADATA,
	GUARDIAN_ROUTER_METADATA,
	HTTP_METHOD_METADATA,
	INTERCEPTORS_ROUTER_METADATA,
	POLICY_CONTROLLER_METADATA,
	POLICY_ROUTER_METADATA,
} from "./const";
import ErrorCatch from "./error-catch";
import { HttpMethod, RouteGuardian, RouteInterceptor, RoutePolicy } from "./types";

class InternalProgresive {
	protected declare dir: string;
	protected declare prefix: string;
	protected declare port: number;
	protected declare instance: ExpressApplication;
	protected declare controllers: Record<string, any>;

	private defineConfig() {
		this.instance.use(express.urlencoded({ extended: true }));
		this.instance.use(express.json());
	}

	private controllerDiscovery(dir: string, result: Record<string, any> = {}) {
		const files = readdirSync(dir);

		for (const file of files) {
			const filePath = join(dir, file);
			const isDirectory = statSync(filePath).isDirectory();

			if (isDirectory) {
				this.controllerDiscovery(filePath, result);
			} else if (file.endsWith(".controller.ts")) {
				const controllerName = file.replace(".controller.ts", "");
				const controller = require(filePath);
				result[controllerName] = controller[DEFAULT];
			}
		}

		this.controllers = result;
	}

	private resolveRoutes() {
		for (const ControllerClass of Object.values(this.controllers)) {
			const routes: HttpMethod[] = Reflect.getMetadata(HTTP_METHOD_METADATA, ControllerClass);
			routes;

			const ControllerInstance = new ControllerClass();

			const AppRouter: Router = express.Router();

			for (const { handler, method, url } of routes) {
				const middlware = this.routerMiddleware(ControllerClass, handler);

				AppRouter[method](url, ...middlware, ControllerInstance[String(handler)].bind(ControllerInstance));
			}

			const basePath = Reflect.getMetadata(CONTROLLER_METADATA, ControllerClass);

			const controllerMiddleware = this.controllerMiddleware(ControllerClass);

			this.instance.use(basePath, ...controllerMiddleware, AppRouter);
		}
	}

	private routerMiddleware(ControllerClass: any, handler: string | symbol): any {
		const middlware = [];

		const routerGuardian: RouteGuardian[] = Reflect.getMetadata(GUARDIAN_ROUTER_METADATA, ControllerClass);

		const routerPolicy: RoutePolicy[] = Reflect.getMetadata(POLICY_ROUTER_METADATA, ControllerClass);

		const routerInterceptor: RouteInterceptor[] = Reflect.getMetadata(INTERCEPTORS_ROUTER_METADATA, ControllerClass);

		if (routerGuardian) {
			middlware.push(...routerGuardian.filter((r) => r.handler === handler).map(({ guardian }) => guardian));
		}

		if (routerPolicy) {
			middlware.push(...routerPolicy.filter((r) => r.handler === handler).map(({ policy }) => policy));
		}

		if (routerInterceptor) {
			middlware.push(
				...routerInterceptor.filter((r) => r.handler === handler).map(({ interceptor }) => interceptor),
			);
		}

		return middlware;
	}

	private controllerMiddleware(ControllerClass: any): any {
		const controllerGuardian = Reflect.getMetadata(GUARDIAN_CONTROLLER_METADATA, ControllerClass);

		const controllerPolicy = Reflect.getMetadata(POLICY_CONTROLLER_METADATA, ControllerClass);

		const controllerInterceptor = Reflect.getMetadata(POLICY_CONTROLLER_METADATA, ControllerClass);

		const controllerMiddleware: any[] = [];

		if (controllerGuardian) {
			controllerMiddleware.push(controllerGuardian);
		}

		if (controllerPolicy) {
			controllerMiddleware.push(controllerPolicy);
		}

		if (controllerInterceptor) {
			controllerMiddleware.push(controllerInterceptor);
		}

		return controllerMiddleware;
	}

	private postResolveRoutes() {
		this.instance.use(ErrorCatch);
	}

	public initialize() {
		try {
			this.defineConfig();
			this.controllerDiscovery(this.dir);
			this.resolveRoutes();
			this.postResolveRoutes();

			this.instance.listen(this.port || 3000);

			console.log(`🚀 Listening on port ${this.port || 3000}`);
		} catch (error) {
			console.error(error);
		}
	}
}

interface ConfigProgresive {
	addGlobalPrefix(prefix: string): void;
	useMorgan(mode: string): void;
	usePassport(path: string): void;
	setStatic(path: string): void;
	setAppDir(dir: string): void;
	setCors(options: CorsOptions): void;
	setSession(options: SessionOptions): void;
	accessInstance(): ExpressApplication;
	start(): void;
}

class ProgresiveOptions extends InternalProgresive implements ConfigProgresive {
	setStatic(path: string): void {
		this.instance.use(express.static(path));
	}

	addGlobalPrefix(prefix: string): void {
		this.prefix = prefix;
	}

	setAppDir(dir: string) {
		this.dir = dir;
	}

	setCors(options: CorsOptions): void {
		this.instance.use(cors(options));
	}

	setSession(options: SessionOptions): void {
		this.instance.use(session(options));
	}

	useMorgan(mode: "combined" | "short" | "common" | "dev" | "tiny") {
		this.instance.use(morgan(mode));
	}

	usePassport(path: string) {
		require(path);
		this.instance.use(passport.initialize());
		this.instance.use(passport.session());
	}

	accessInstance(): ExpressApplication {
		return this.instance;
	}

	start(): void {
		this.initialize();
	}
}

class Progresive extends ProgresiveOptions {
	create(port: number): ConfigProgresive {
		this.port = port;
		this.instance = express();
		return this;
	}
}

export default Progresive;
