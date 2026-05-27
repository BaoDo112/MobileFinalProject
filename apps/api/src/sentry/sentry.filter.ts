import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import type { HttpServer } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

import { captureServerException } from "../instrument";

function shouldCaptureException(exception: unknown) {
  if (exception instanceof HttpException) {
    return exception.getStatus() >= 500;
  }

  return true;
}

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  constructor(applicationRef?: HttpServer) {
    super(applicationRef);
  }

  override catch(exception: unknown, host: ArgumentsHost) {
    if (shouldCaptureException(exception)) {
      captureServerException(exception);
    }

    super.catch(exception, host);
  }
}