import { decodeToken, signToken } from "./jwt";
import { AuthorizedRouteHandler, RouteHandler } from "lib/api/createRoute";

export function guarded<Args, Data>(
  handler: AuthorizedRouteHandler<Args, Data>
): RouteHandler<Args, Data> {
  return async (ctx) => {
    let { req } = ctx;
    let { authorization } = req.headers;
    let { refreshToken } = req.cookies;

    try {
      let accessTokenPayload = decodeToken({ token: authorization });
      let userId: string | null = null;
      let issueNewAccessToken = false;
      if (accessTokenPayload) {
        userId = accessTokenPayload.userId;
      } else {
        issueNewAccessToken = true;
        userId = decodeToken({ token: refreshToken })?.userId || null;
      }

      if (userId) {
        let data = await handler({ ...ctx, userId });
        return issueNewAccessToken
          ? {
              ...data,
              accessToken: signToken({
                kind: "AccessToken",
                userId,
                expiresIn: "2m",
              }),
            }
          : data;
      } else {
        return {
          status: "not ok",
          error: {
            messages: ["Not authorized!"],
          },
        };
      }
    } catch (error) {
      return {
        status: "not ok",
        error: {
          messages: ["Not authorized!"],
        },
      };
    }
  };
}
