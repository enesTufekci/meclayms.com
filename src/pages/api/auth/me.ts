import { User } from "@prisma/client";
import { AuthorizedRouteHandler, createRoute } from "lib/api/createRoute";
import { guarded } from "helpers/auth/guarded";

interface MeHandlerArgs {}
interface MeHandlerData {
  user: User;
}

let meHandler: AuthorizedRouteHandler<MeHandlerArgs, MeHandlerData> = async (
  { prismaClient, userId },
  reply
) => {
  try {
    let user = await prismaClient.user.findOne({
      where: {
        id: userId,
      },
    });

    return user ? reply.ok({ user }) : reply.notAuthorized();
  } catch (error) {
    return reply.notOk(String(error));
  }
};

export default createRoute({
  methods: ["GET"],
  handlers: {
    GET: guarded(meHandler),
  },
});
