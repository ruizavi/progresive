import "reflect-metadata";
import { INTERCEPTORS_CONTROLLER_METADATA, INTERCEPTORS_ROUTER_METADATA } from "../../const";
import { Handler, RouteInterceptor } from "../../types";

function Interceptor(interceptor: Handler | Function) {
	return function (target: any, propertyKey?: string | symbol) {
		const ControllerClass = target instanceof Function ? target : target.constructor;

		const routerInterceptor: RouteInterceptor[] = Reflect.hasMetadata(INTERCEPTORS_ROUTER_METADATA, ControllerClass)
			? Reflect.getMetadata(INTERCEPTORS_ROUTER_METADATA, ControllerClass)
			: [];

		if (propertyKey) {
			routerInterceptor.push({
				handler: propertyKey,
				interceptor,
			});

			Reflect.defineMetadata(INTERCEPTORS_ROUTER_METADATA, routerInterceptor, ControllerClass);
		}

		if (!propertyKey) {
			Reflect.defineMetadata(INTERCEPTORS_CONTROLLER_METADATA, interceptor, ControllerClass);
		}
	};
}

export default Interceptor;
// Para definir middlewares
