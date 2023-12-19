import { ParamsDefinition } from "@progresive/core/interface";
import { MetadataKey, RouteParamtypes } from "../enums";
import { Metadata } from "../metadata";

function createRouteParamDecorator(type: RouteParamtypes) {
	return function (data?: string): ParameterDecorator {
		return function (target, propertyKey, index) {
			const metadata = Metadata.Instance();

			const params: ParamsDefinition[] = metadata.has(MetadataKey.PARAMS, target.constructor)
				? metadata.get(MetadataKey.PARAMS, target.constructor)
				: [];

			params.push({
				data,
				handler: propertyKey,
				position: index,
				type,
			});

			metadata.set(MetadataKey.PARAMS, params, target.constructor);
		};
	};
}

export const Req = createRouteParamDecorator(RouteParamtypes.REQUEST);
export const Res = createRouteParamDecorator(RouteParamtypes.RESPONSE);
export const Next = createRouteParamDecorator(RouteParamtypes.NEXT);
export const Param = createRouteParamDecorator(RouteParamtypes.PARAM);
export const Query = createRouteParamDecorator(RouteParamtypes.QUERY);
export const Headers = createRouteParamDecorator(RouteParamtypes.HEADERS);
export const Body = createRouteParamDecorator(RouteParamtypes.BODY);
export const User = createRouteParamDecorator(RouteParamtypes.USER);
export const File = createRouteParamDecorator(RouteParamtypes.FILE);
export const Files = createRouteParamDecorator(RouteParamtypes.FILES);
