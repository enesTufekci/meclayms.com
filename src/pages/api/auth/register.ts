import { hash } from "argon2";
import { createRoute, RouteHandler } from "lib/api/createRoute";

export interface RegisterHandlerArgs {
  email: string;
  username: string;
  password: string;
  invitationCode: string;
}

export interface RegisterHandlerData {}

let registerHandler: RouteHandler<RegisterHandlerArgs, RegisterHandlerData> = async (
  { req, prismaClient },
  reply
) => {
  let { email, password, username, invitationCode } = req.body;

  try {
    let invitation = await prismaClient.invitation.findOne({
      where: {
        code: invitationCode,
      },
    });
    if (invitation?.consumerId) {
      return reply.notOk("Invitaion code is invalid.");
    }
    await prismaClient.user.create({
      data: {
        email,
        password: await hash(password),
        username,
      },
    });

    return reply.ok({});
  } catch (error) {
    return reply.notOk(String(error));
  }
};

export default createRoute({
  methods: ["POST"],
  handlers: {
    POST: registerHandler,
  },
});
