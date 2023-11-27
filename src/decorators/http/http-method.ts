import { NextFunction, Request, Response } from "express";
import "reflect-metadata";
import { HTTP_METHOD_METADATA, HTTP_REQUEST_METADATA } from "../../const";
import { HttpMethod, HttpRequest } from "../../types";

enum HttpMethods {
	GET = "get",
	POST = "post",
	PUT = "put",
	PATCH = "patch",
	DELETE = "delete",
}

interface HttpMethodOptions {
	version: string | number;
}

function fillArgs(propertyKey: string | symbol, httpRequest: HttpRequest[], req: Request): any[] {
	const args = [];

	if (httpRequest) {
		for (const { type, name, handler, parser } of httpRequest) {
			if (handler === propertyKey) {
				const arg = name ? (parser ? parser(req[type][name]) : req[type][name]) : req[type];

				args.push(arg);
			}
		}
	}

	return args;
}

function buildHandler(propertyKey: string | symbol, httpRequest: HttpRequest[], originalMethod: any) {
	return async function (req: Request, res: Response, next: NextFunction) {
		const args = fillArgs(propertyKey, httpRequest, req);

		try {
			const result = await originalMethod?.apply(this, args);
			res.json(result);
		} catch (error) {
			next(error);
		}
	};
}

function HttpMethodFactory(http: HttpMethods) {
	return (path: string, options?: HttpMethodOptions): MethodDecorator => {
		let uri = path.startsWith("/") ? path : `/${path}`;

		if (options?.version) {
			uri = `/v${options.version}${uri}`;
		}

		return (target, propertyKey, descriptor: PropertyDescriptor) => {
			const controller = target.constructor;
			const routes: HttpMethod[] = Reflect.hasMetadata(HTTP_METHOD_METADATA, controller)
				? Reflect.getMetadata(HTTP_METHOD_METADATA, controller)
				: [];

			const originalMethod = descriptor.value;
			const httpRequest: HttpRequest[] = Reflect.getMetadata(HTTP_REQUEST_METADATA, controller);

			httpRequest?.sort((a, b) => a.position - b.position);

			descriptor.value = buildHandler(propertyKey, httpRequest, originalMethod);

			routes.push({
				url: uri,
				handler: propertyKey,
				method: http,
			});

			Reflect.defineMetadata(HTTP_METHOD_METADATA, routes, controller);

			return descriptor;
		};
	};
}

const Get = HttpMethodFactory(HttpMethods.GET);

const Post = HttpMethodFactory(HttpMethods.POST);

const Put = HttpMethodFactory(HttpMethods.PUT);

const Patch = HttpMethodFactory(HttpMethods.PATCH);

const Delete = HttpMethodFactory(HttpMethods.DELETE);

export { Delete, Get, Patch, Post, Put };