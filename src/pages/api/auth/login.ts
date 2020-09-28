import { verify } from "argon2";
import { RouteHandler, createRoute, RouteHandlerResponse } from "lib/api/createRoute";
import { issueRefreshToken, signToken } from "helpers/auth/jwt";

export interface LoginHandlerArgs {
  email: string;
  password: string;
}

export interface LoginHandlerData {
  accessToken: string;
  message: string;
}

let loginHandler: RouteHandler<LoginHandlerArgs, LoginHandlerData> = async (
  { req, prismaClient, res },
  reply
) => {
  let { email, password } = req.body;

  try {
    let user = await prismaClient.user.findOne({
      where: {
        email,
      },
    });
    let passwordMatches = await verify(user?.password || "", password);
    if (passwordMatches) {
      issueRefreshToken(res, {
        count: user?.refreshTokenIssueCount!,
      });
      let accessToken = signToken({
        kind: "AccessToken",
        expiresIn: "2m",
        userId: user?.id!,
      });
      return reply.ok({
        accessToken,
      });
    }
    return reply.notOk("Invalid credentials!");
  } catch (error) {
    return reply.notOk("Invalid credentials!");
  }
};

export default createRoute({
  methods: ["POST"],
  handlers: {
    POST: loginHandler,
  },
});
