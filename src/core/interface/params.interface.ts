import { RouteParamtypes } from "@progresive/common/enums";

export interface ParamsDefinition {
	type: RouteParamtypes;
	position: number;
	data: string | object | any;
	handler: string | symbol;
	parser?: any;
}
