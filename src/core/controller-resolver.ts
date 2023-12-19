import { MetadataKey } from "@progresive/common/enums";
import { Metadata } from "@progresive/common/metadata";

export class ControllerResolver {
	private metadata = Metadata.Instance();

	public resolveBasePath(target: Object) {
		const basePath = this.metadata.get(MetadataKey.CONTROLLER, target);

		return basePath;
	}
}
