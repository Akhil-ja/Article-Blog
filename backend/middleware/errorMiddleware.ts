import { Response, Request, NextFunction } from "express";

interface AppErrorInterface {
  statusCode: number;
  message: string;
  isOperational: boolean;
  stack?: string;
}

const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong!";

  if (err && typeof err === "object" && "isOperational" in err) {
    const appError = err as AppErrorInterface;
    statusCode = appError.isOperational ? appError.statusCode : 500;
    message = appError.isOperational
      ? appError.message
      : "Something went wrong!";
  } else if (err instanceof Error) {
    message = err.message;
  }

  console.error(err);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

export default globalErrorHandler;
