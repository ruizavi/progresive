import cors, { CorsOptions } from "cors";
import express, { Application as ExpressApplication, Router } from "express";
import session, { SessionOptions } from "express-session";
import { readdirSync, statSync } from "fs";
import morgan from "morgan";
import passport from "passport";
import { join } from "path";
import "reflect-metadata";
import {
  CONTROLLER_METADATA,
  DEFAULT,
  GUARDIAN_CONTROLLER_METADATA,
  GUARDIAN_ROUTER_METADATA,
  HTTP_METHOD_METADATA,
  INTERCEPTORS_ROUTER_METADATA,
  POLICY_CONTROLLER_METADATA,
  POLICY_ROUTER_METADATA,
} from "./const";
import ErrorCatch from "./error-catch";
import {
  HttpMethod,
  RouteGuardian,
  RouteInterceptor,
  RoutePolicy,
} from "./types";

class InternalRedo {
  declare dir: string;
  declare prefix: string;
  declare port: number;
  declare instance: ExpressApplication;
  declare controllers: Record<string, any>;
  declare corsOptions: CorsOptions;
  declare sessionOptions: SessionOptions;
  declare passportPath: string;

  private defineConfig() {
    require(this.passportPath);

    this.instance.use(cors(this.corsOptions || "*"));
    this.instance.use(express.urlencoded({ extended: true }));
    this.instance.use(express.json());
    this.instance.use(
      session(
        this.sessionOptions || {
          secret: "secret",
          resave: false,
          saveUninitialized: false,
        }
      )
    );
    this.instance.use(passport.initialize());
    this.instance.use(passport.session());
  }

  private controllerDiscovery(dir: string, result: Record<string, any> = {}) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const isDirectory = statSync(filePath).isDirectory();

      if (isDirectory) {
        this.controllerDiscovery(filePath, result);
      } else if (file.endsWith(".controller.ts")) {
        const controllerName = file.replace(".controller.ts", "");
        const controller = require(filePath);
        result[controllerName] = controller[DEFAULT];
      }
    }

    this.controllers = result;
  }

  private resolveRoutes() {
    for (const ControllerClass of Object.values(this.controllers)) {
      const routes: HttpMethod[] = Reflect.getMetadata(
        HTTP_METHOD_METADATA,
        ControllerClass
      );

      const ControllerInstance = new ControllerClass();

      const AppRouter: Router = express.Router();

      for (const { handler, method, url } of routes) {
        const middlware = this.routerMiddleware(ControllerClass, handler);

        AppRouter[method](
          url,
          ...middlware,
          ControllerInstance[String(handler)].bind(ControllerInstance)
        );
      }

      const basePath = Reflect.getMetadata(
        CONTROLLER_METADATA,
        ControllerClass
      );

      const controllerMiddleware = this.controllerMiddleware(ControllerClass);

      this.instance.use(basePath, ...controllerMiddleware, AppRouter);
    }
  }

  private routerMiddleware(
    ControllerClass: any,
    handler: string | symbol
  ): any {
    const middlware = [];

    const routerGuardian: RouteGuardian[] = Reflect.getMetadata(
      GUARDIAN_ROUTER_METADATA,
      ControllerClass
    );

    const routerPolicy: RoutePolicy[] = Reflect.getMetadata(
      POLICY_ROUTER_METADATA,
      ControllerClass
    );

    const routerInterceptor: RouteInterceptor[] = Reflect.getMetadata(
      INTERCEPTORS_ROUTER_METADATA,
      ControllerClass
    );

    if (routerGuardian) {
      middlware.push(
        ...routerGuardian
          .filter((r) => r.handler === handler)
          .map(({ guardian }) => guardian)
      );
    }

    if (routerPolicy) {
      middlware.push(
        ...routerPolicy
          .filter((r) => r.handler === handler)
          .map(({ policy }) => policy)
      );
    }

    if (routerInterceptor) {
      middlware.push(
        ...routerInterceptor
          .filter((r) => r.handler === handler)
          .map(({ interceptor }) => interceptor)
      );
    }

    return middlware;
  }

  private controllerMiddleware(ControllerClass: any): any {
    const controllerGuardian = Reflect.getMetadata(
      GUARDIAN_CONTROLLER_METADATA,
      ControllerClass
    );

    const controllerPolicy = Reflect.getMetadata(
      POLICY_CONTROLLER_METADATA,
      ControllerClass
    );

    const controllerInterceptor = Reflect.getMetadata(
      POLICY_CONTROLLER_METADATA,
      ControllerClass
    );

    const controllerMiddleware: any[] = [];

    if (controllerGuardian) {
      controllerMiddleware.push(controllerGuardian);
    }

    if (controllerPolicy) {
      controllerMiddleware.push(controllerPolicy);
    }

    if (controllerInterceptor) {
      controllerMiddleware.push(controllerInterceptor);
    }

    return controllerMiddleware;
  }

  private postResolveRoutes() {
    this.instance.use(ErrorCatch);
  }

  public initialize() {
    try {
      this.defineConfig();
      this.controllerDiscovery(this.dir);
      this.resolveRoutes();
      this.postResolveRoutes();

      this.instance.listen(this.port);

      console.log(`🚀 Listening on port ${this.port}`);
    } catch (error) {
      console.error(error);
    }
  }
}

interface ConfigRedo {
  addGlobalPrefix(prefix: string): void;
  enableMorgan(): void;
  importPassport(path: string): void;
  setAppDir(dir: string): void;
  setCorsOptions(options: CorsOptions): void;
  setSessionOptions(options: SessionOptions): void;
  start(): void;
}

class RedoOptions extends InternalRedo {
  addGlobalPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  setAppDir(dir: string) {
    this.dir = dir;
  }

  setCorsOptions(options: CorsOptions): void {
    this.corsOptions = options;
  }

  setSessionOptions(options: SessionOptions): void {
    this.sessionOptions = options;
  }

  enableMorgan() {
    this.instance.use(morgan("dev"));
  }

  importPassport(path: string) {
    this.passportPath = path;
  }

  start(): void {
    this.initialize();
  }
}

class Redo extends RedoOptions {
  create(port: number): ConfigRedo {
    this.port = port;
    this.instance = express();
    return this;
  }
}

export default new Redo().create;
