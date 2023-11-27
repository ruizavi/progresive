import { NextFunction, Request, Response } from "express";
import HttpError from "./http-exception";

function Catch(error: Error, req: Request, res: Response, next: NextFunction) {
  if (error instanceof HttpError) {
    return res.status(error.code).json({
      status: error.code,
      message: error.description,
      cause: error.cause,
      stack: process.env.NODE_ENV !== "production" ? error.stack : null,
    });
  }

  return res.status(500).json({
    status: 500,
    message: "Internal Server Error",
    stack: process.env.NODE_ENV !== "production" ? error.stack : null,
  });
}

export default Catch;
