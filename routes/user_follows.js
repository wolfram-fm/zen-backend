async function userFollowsRoutes(fastify, options) {
  const followSchema = {
    body: {
      type: "object",
      required: ["user_id"],
      properties: {
        user_id: { type: "number" },
      },
    },
  };

  fastify.post(
    "/follow",
    { schema: followSchema, onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const currentUserId = request.headers.jwt.uid;

        // cannot follow yourself
        if (currentUserId === request.body.user_id) {
          reply.code(400).send({ error: "Cannot (un)follow yourself" });
          return;
        }

        const database = await fastify.pg.connect();

        await database.query(
          "INSERT INTO user_follows(user_id_1, user_id_2) VALUES ($1, $2);",
          [currentUserId, request.body.user_id]
        );

        reply.send({ success: true });
      } catch (e) {
        if (e.code === "23505") {
          // duplicate entry, return as success
          reply.send({ success: true });
        } else {
          console.log(e);
          reply.code(500).send({ error: "Follow action failed" });
        }
      }
    }
  );

  fastify.post(
    "/unfollow",
    { schema: followSchema, onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const currentUserId = request.headers.jwt.uid;

        // cannot follow yourself
        if (currentUserId === request.body.user_id) {
          reply.code(400).send({ error: "Cannot (un)follow yourself" });
          return;
        }

        const database = await fastify.pg.connect();

        await database.query(
          "DELETE FROM user_follows WHERE user_id_1 = $1 AND user_id_2 = $2;",
          [currentUserId, request.body.user_id]
        );

        reply.send({ success: true });
      } catch (e) {
        console.log(e);
        reply.code(500).send({ error: "Unfollow action failed" });
      }
    }
  );
}

module.exports = userFollowsRoutes;
