import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export enum ErrorMessages {
  METHOD_NOT_ALLOWED = "Method not allowed",
  NOT_AUTHORIZED = "Not authorized",
  INVALID_CREDENTIALS = "Invalid credentials!",
}

interface Request<T> extends NextApiRequest {
  body: T;
}

export interface Context<T> {
  req: Request<T>;
  res: NextApiResponse;
  prismaClient: PrismaClient;
}

interface AuthorizedContext<T> extends Context<T> {
  userId: string;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RouteHandlerResponse<T> {
  status: "ok" | "not ok";
  statusCode?: number;
  data?: T;
  accessToken?: string;
  error?: {
    messages: string[];
  };
}

export type RouteHandler<Args, Data> = (ctx: Context<Args>) => Promise<RouteHandlerResponse<Data>>;

export type AuthorizedRouteHandler<Args, Data> = (
  ctx: AuthorizedContext<Args>
) => Promise<RouteHandlerResponse<Data>>;

interface RouteConfig<T extends HttpMethod, Args, Data> {
  methods: T[];
  handlers: Record<T, RouteHandler<Args, Data>>;
}

export function createRoute<T extends HttpMethod, Args, Data>(
  config: RouteConfig<T, Args, Data>
): NextApiHandler {
  let { handlers, methods } = config;
  return async (req, res) => {
    if (!methods.includes(req.method as T)) {
      res.statusCode = 405;
      res.json({
        ok: false,
        error: ErrorMessages.METHOD_NOT_ALLOWED,
      });
    }
    let handler = handlers[req.method as T];
    let prismaClient = new PrismaClient();

    let { data = {}, error = { messages: [] }, statusCode = 200, ...rest } = await handler({
      req,
      res,
      prismaClient,
    });

    res.statusCode = statusCode;

    res.json({
      data,
      error,
      ...rest,
    });

    res.end();
  };
}
