import { NextFunction, Request, Response } from "express";
import { HttpStatusCode, POLICY_CONTROLLER_METADATA, POLICY_ROUTER_METADATA } from "../../const";
import HttpError from "../../http-exception";
import { RoutePolicy } from "../../types";

function Policy<T = unknown>(cb: (data: T) => Promise<boolean>) {
	return function (target: any, propertyKey?: string | symbol) {
		const ControllerClass = target instanceof Function ? target : target.constructor;

		const routerPolicy: RoutePolicy[] = Reflect.hasMetadata(POLICY_ROUTER_METADATA, ControllerClass)
			? Reflect.getMetadata(POLICY_ROUTER_METADATA, ControllerClass)
			: [];

		const handler = async (req: Request, res: Response, next: NextFunction) => {
			try {
				const user = <T>req.user;

				if (!user) throw new HttpError("User not authenticated", HttpStatusCode.UNAUTHORIZED);

				const isAbility = await cb(user);

				if (!isAbility) throw new HttpError("User is not authorized", HttpStatusCode.UNAUTHORIZED);

				next();
			} catch (error) {
				next(error);
			}
		};

		if (propertyKey) {
			routerPolicy.push({
				handler: propertyKey,
				policy: handler,
			});
			Reflect.defineMetadata(POLICY_ROUTER_METADATA, routerPolicy, ControllerClass);
		}

		if (!propertyKey) {
			Reflect.defineMetadata(POLICY_CONTROLLER_METADATA, handler, ControllerClass);
		}
	};
}

export default Policy;
