import { MetadataKey } from "../enums";
import { Metadata } from "../metadata";

export function Controller(): ClassDecorator;
export function Controller(prefix: string): ClassDecorator;
export function Controller(prefix?: string): ClassDecorator {
	const metadata = Metadata.Instance();

	const defaultPath = "/";

	const path = prefix ? (prefix.startsWith("/") ? prefix : `/${prefix}`) : defaultPath;

	return function (target) {
		metadata.set(MetadataKey.CONTROLLER, path, target);
	};
}
