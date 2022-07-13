async function userRoutes(fastify, options) {
  const loginSchema = {
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string" },
        password: { type: "string" },
      },
    },
  };
  fastify.post("/login", { schema: loginSchema }, async (request, reply) => {
    try {
      const database = await fastify.pg.connect();
      const { rows } = await database.query(
        "SELECT * FROM users WHERE email=$1 AND password=$2 LIMIT 1",
        [request.body.email, request.body.password]
      );

      const user = rows[0] || null;

      if (user) {
        const token = fastify.jwt.sign({
          uid: user.id,
        });
        reply.send({ token });
      } else {
        throw new Error();
      }
    } catch (e) {
      console.log(e);
      reply.code(406).send({ error: "Login failed" });
    }
  });

  fastify.get(
    "/user/:id",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const database = await fastify.pg.connect();
        const { rows } = await database.query(
          "SELECT id, username, created_at FROM users WHERE id=$1 LIMIT 1",
          [request.params.id]
        );

        reply.send(rows[0] || {});
      } catch (e) {
        console.log(e);
        reply.code(404).send({});
      }
    }
  );

  fastify.get(
    "/user/search/:querystring",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const database = await fastify.pg.connect();
        const { rows } = await database.query(
          "SELECT id, username, created_at FROM users WHERE username=$1 LIMIT 1",
          [request.params.querystring]
        );

        reply.send(rows[0] || {});
      } catch (e) {
        console.log(e);
        reply.code(404).send({});
      }
    }
  );
}

module.exports = userRoutes;
