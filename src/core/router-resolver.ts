import { MetadataKey } from "@progresive/common/enums";
import { Metadata } from "@progresive/common/metadata";
import { NextFunction, Request, Response, Router } from "express";
import { ApplicationConfig } from "./application-config";
import { ControllerExplorer } from "./controller-explorer";
import { ControllerResolver } from "./controller-resolver";
import { ParamsDefinition, RouteDefinition } from "./interface";
import { RouteParamsFactory } from "./params-resolver";

export class RouterResolver {
	private readonly metadata = Metadata.Instance();
	private readonly paramsFactory = new RouteParamsFactory();
	private readonly controllerExplorer = new ControllerExplorer();
	private readonly controllerResolver = new ControllerResolver();
	private readonly application: ApplicationConfig;

	constructor(application: ApplicationConfig) {
		this.application = application;
	}

	public resolve() {
		const controllers = this.controllerExplorer.get(this.application.getBaseDir());

		for (const cls of Object.values(controllers)) {
			this.registerRoute(cls);
		}
	}

	private registerRoute(target: Object) {
		const basePath = this.controllerResolver.resolveBasePath(target);

		const router = this.generateRouter(target);

		const app = this.application.getApp();

		app.use(`${this.application.getGlobalPrefix()}${basePath}`, router);
	}

	private generateRouter(target: any) {
		const routes: RouteDefinition[] = this.metadata.get(MetadataKey.ROUTES, target);

		const router = Router();

		const instanceController = new target() as any;

		for (const { handler, method, path } of routes) {
			const finalHandler = this.buildHandler(handler, target);

			router[method](path, finalHandler.bind(instanceController));
		}

		return router;
	}

	private buildHandler(handler: any, target: any) {
		const self = this;

		const params: ParamsDefinition[] = this.metadata.get(MetadataKey.PARAMS, target);

		return async function (req: Request, res: Response, next: NextFunction) {
			const args = params
				.filter((p) => p.handler === handler.name)
				.sort((a, b) => a.position - b.position)
				.map(({ type, data, parser }) =>
					parser
						? parser(
								self.paramsFactory.changekeyForValue(type, data, {
									req,
									res,
									next,
								}),
						  )
						: self.paramsFactory.changekeyForValue(type, data, {
								req,
								res,
								next,
						  }),
				);

			try {
				const resultOfHandler = await handler.descriptor.apply(this, args);

				res.json(resultOfHandler);
			} catch (error) {
				next(error);
			}
		};
	}
}
