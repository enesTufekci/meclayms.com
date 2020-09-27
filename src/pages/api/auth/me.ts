import { User } from "@prisma/client";
import { AuthorizedRouteHandler, createRoute } from "lib/api/createRoute";
import { guarded } from "helpers/auth/guarded";

interface MeHandlerArgs {}
interface MeHandlerData {
  user: User;
}

let meHandler: AuthorizedRouteHandler<MeHandlerArgs, MeHandlerData> = async ({
  prismaClient,
  userId,
}) => {
  try {
    let user = prismaClient.user.findOne({
      where: {
        id: userId,
      },
    });
    if (user) {
      return {
        status: "ok",
        user,
      };
    }
    return {
      status: "not ok",
    };
  } catch (error) {
    return {
      status: "not ok",
      error: {
        messages: [String(error)],
      },
    };
  }
};

export default createRoute({
  methods: ["GET"],
  handlers: {
    GET: guarded(meHandler),
  },
});
