import { verify } from "argon2";
import { RouteHandler, createRoute } from "lib/api/createRoute";
import { issueRefreshToken, signToken } from "helpers/auth/jwt";

export interface LoginHandlerArgs {
  email: string;
  password: string;
}

export interface LoginHandlerData {
  accessToken: string;
}

let loginHandler: RouteHandler<LoginHandlerArgs, LoginHandlerData> = async ({
  req,
  prismaClient,
  res,
}) => {
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
      return {
        status: "not ok",
        data: {
          accessToken: signToken({
            kind: "AccessToken",
            expiresIn: "2m",
            userId: user?.id!,
          }),
        },
      };
    }
    return {
      status: "not ok",
      error: {
        messages: ["Invalid credentials!"],
      },
    };
  } catch (error) {
    return {
      status: "not ok",
      error: {
        messages: ["Invalid credentials!"],
      },
    };
  }
};

export default createRoute({
  methods: ["POST"],
  handlers: {
    POST: loginHandler,
  },
});
