import { RouteDefinition } from "@progresive/core/interface";
import { MetadataKey, RequestMethod } from "../enums";
import { Metadata } from "../metadata";

function requestMethodFactory(method: RequestMethod) {
	return function (prefix: string): MethodDecorator {
		const path = prefix.startsWith("/") ? prefix : `/${prefix}`;

		return function (target, propertyKey, descriptor) {
			const metadata = Metadata.Instance();

			const routes: RouteDefinition[] = metadata.has(MetadataKey.ROUTES, target.constructor)
				? metadata.get(MetadataKey.ROUTES, target.constructor)
				: [];

			routes.push({
				handler: { descriptor: descriptor.value, name: propertyKey },
				method,
				path,
			});

			metadata.set(MetadataKey.ROUTES, routes, target.constructor);
		};
	};
}

export const All = requestMethodFactory(RequestMethod.ALL);
export const Delete = requestMethodFactory(RequestMethod.DELETE);
export const Get = requestMethodFactory(RequestMethod.GET);
export const Head = requestMethodFactory(RequestMethod.HEAD);
export const Options = requestMethodFactory(RequestMethod.OPTIONS);
export const Patch = requestMethodFactory(RequestMethod.PATCH);
export const Post = requestMethodFactory(RequestMethod.POST);
export const Put = requestMethodFactory(RequestMethod.PUT);
export const Search = requestMethodFactory(RequestMethod.SEARCH);
