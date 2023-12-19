import { RequestMethod } from "@progresive/common/enums";

export interface RouteDefinition {
	path: string;
	handler: {
		name: string | symbol;
		descriptor: any;
	};
	method: RequestMethod;
}
