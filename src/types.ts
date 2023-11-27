import { NextFunction, Request, Response } from "express";
import { HttpMethods, RequestInformation } from "./const";
import {
  ArrayParser,
  BooleanParser,
  DateParser,
  FloatParser,
  IntegerParser,
  StringParser,
} from "./decorators/middleware/parser";

export interface HttpMethod {
  url: string;
  handler: string | symbol;
  method: HttpMethods;
}

export interface HttpRequest {
  name?: string;
  parser?:
    | typeof IntegerParser
    | typeof StringParser
    | typeof BooleanParser
    | typeof DateParser
    | typeof ArrayParser
    | typeof FloatParser;
  handler: string | symbol;
  position: number;
  type: RequestInformation;
}

export interface Handler {
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export interface ControllerGuardian {
  guardian: Handler | Function;
}

export interface ControllerPolicy {
  policy: Handler | Function;
}

export interface ControllerInterceptor {
  interceptor: Handler | Function;
}

export interface RoutePolicy {
  handler: string | symbol;
  policy: Handler | Function;
}

export interface RouteGuardian {
  handler: string | symbol;
  guardian: Handler | Function;
}

export interface RouteInterceptor {
  handler: string | symbol;
  interceptor: Handler | Function;
}
