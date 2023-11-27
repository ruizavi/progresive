import "reflect-metadata";
import { HTTP_REQUEST_METADATA, RequestInformation } from "../../const";
import { HttpRequest } from "../../types";
import {
  ArrayParser,
  BooleanParser,
  DateParser,
  FloatParser,
  IntegerParser,
  StringParser,
} from "../middleware/parser";

function HttpRequestFactory(type: RequestInformation) {
  return function (
    name?: string,
    parser?:
      | typeof IntegerParser
      | typeof StringParser
      | typeof BooleanParser
      | typeof DateParser
      | typeof ArrayParser
      | typeof FloatParser
  ): ParameterDecorator {
    return function (target, propertyKey, index) {
      const controllerClass = target.constructor;

      const params: HttpRequest[] = Reflect.hasMetadata(
        HTTP_REQUEST_METADATA,
        controllerClass
      )
        ? Reflect.getMetadata(HTTP_REQUEST_METADATA, controllerClass)
        : [];

      if (propertyKey) {
        params.push({
          name,
          type,
          parser,
          handler: propertyKey,
          position: index,
        });
      }

      Reflect.defineMetadata(HTTP_REQUEST_METADATA, params, controllerClass);
    };
  };
}

const Param = HttpRequestFactory(RequestInformation.PARAMS);
const Body = HttpRequestFactory(RequestInformation.BODY);
const Query = HttpRequestFactory(RequestInformation.QUERY);
const Header = HttpRequestFactory(RequestInformation.HEADERS);
const User = HttpRequestFactory(RequestInformation.USER);
const File = HttpRequestFactory(RequestInformation.FILE);

export { Body, File, Header, Param, Query, User };
