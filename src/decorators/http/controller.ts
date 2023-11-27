import "reflect-metadata";
import { CONTROLLER_METADATA } from "../../const";

interface ControllerOptions {
  version?: number | string;
}

function Controller(basePath: string): ClassDecorator;
function Controller(
  basePath: string,
  options: ControllerOptions
): ClassDecorator;
function Controller(
  basePath: string,
  options?: ControllerOptions
): ClassDecorator {
  let base = basePath.startsWith("/") ? basePath : `/${basePath}`;

  if (options?.version) {
    base = `/v${options.version}${base}`;
  }

  return function (target) {
    Reflect.defineMetadata(CONTROLLER_METADATA, base, target);
  };
}

export default Controller;
