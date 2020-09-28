import { decodeToken, signToken } from "./jwt";
import { AuthorizedRouteHandler, RouteHandler, reply } from "lib/api/createRoute";

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
        let data = await handler({ ...ctx, userId }, reply);
        if (!issueNewAccessToken) {
          return data;
        } else {
          return reply.withAccessToken(
            data,
            signToken({
              kind: "AccessToken",
              userId,
              expiresIn: "2m",
            })
          );
        }
      } else {
        return reply.notAuthorized();
      }
    } catch (error) {
      return reply.notAuthorized();
    }
  };
}
