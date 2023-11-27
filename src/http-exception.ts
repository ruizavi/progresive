import { HttpStatusCode } from "./const";

export default class HttpError extends Error {
  declare code: number;
  declare description: string;
  declare cause: string | undefined;

  constructor(description: string, code: HttpStatusCode);
  constructor(
    description: string,
    code: HttpStatusCode,
    options?: { cause: string }
  ) {
    super();
    this.code = code;
    this.description = description;
    this.cause = options?.cause;
  }
}
