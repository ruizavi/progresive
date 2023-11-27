import "reflect-metadata";
import { GUARDIAN_CONTROLLER_METADATA, GUARDIAN_ROUTER_METADATA } from "../../const";
import { Handler, RouteGuardian } from "../../types";

function Guardian(guardian: Handler | Function) {
	return function (target: any, propertyKey?: string | symbol) {
		const ControllerClass = target instanceof Function ? target : target.constructor;

		const routerGuardian: RouteGuardian[] = Reflect.hasMetadata(GUARDIAN_ROUTER_METADATA, ControllerClass)
			? Reflect.getMetadata(GUARDIAN_ROUTER_METADATA, ControllerClass)
			: [];

		if (propertyKey && guardian) {
			routerGuardian.push({
				handler: propertyKey,
				guardian,
			});

			Reflect.defineMetadata(GUARDIAN_ROUTER_METADATA, routerGuardian, ControllerClass);
		}

		if (!propertyKey && guardian) {
			Reflect.defineMetadata(GUARDIAN_CONTROLLER_METADATA, guardian, ControllerClass);
		}
	};
}

export default Guardian;
