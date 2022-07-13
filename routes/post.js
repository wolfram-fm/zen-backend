async function postRoutes(fastify, options) {
  // const loginSchema = {
  //   body: {
  //     type: "object",
  //     required: ["email", "password"],
  //     properties: {
  //       email: { type: "string" },
  //       password: { type: "string" },
  //     },
  //   },
  // };
  // fastify.post("/login", { schema: loginSchema }, async (request, reply) => {
  //   try {
  //     const database = await fastify.pg.connect();
  //     const { rows } = await database.query(
  //       "SELECT * FROM users WHERE email=$1 AND password=$2 LIMIT 1",
  //       [request.body.email, request.body.password]
  //     );

  //     const user = rows[0] || null;

  //     if (user) {
  //       const token = fastify.jwt.sign({
  //         uid: user.id,
  //       });
  //       reply.send({ token });
  //     } else {
  //       throw new Error();
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     reply.code(406).send({ error: "Login failed" });
  //   }
  // });

  // const signupSchema = {
  //   body: {
  //     type: "object",
  //     required: ["email", "password", "username"],
  //     properties: {
  //       email: { type: "string" },
  //       password: { type: "string" },
  //       username: { type: "string" },
  //     },
  //   },
  // };
  // fastify.post("/signup", { schema: signupSchema }, async (request, reply) => {
  //   const database = await fastify.pg.connect();

  //   try {
  //     const id = await database.query(
  //       "INSERT INTO users(email, password, username) VALUES ($1, $2, $3) RETURNING id",
  //       [request.body.email, request.body.password, request.body.username]
  //     );

  //     reply.send({ id });
  //   } catch (e) {
  //     console.log(e);
  //     reply.code(406).send({ error: "Sign-up failed" });
  //   }
  // });

  fastify.get(
    "/post/:id",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const database = await fastify.pg.connect();
        const { rows } = await database.query(
          "SELECT * FROM posts WHERE id=$1 LIMIT 1",
          [request.params.id]
        );

        reply.send(rows[0] || {});
      } catch (e) {
        console.log(e);
        reply.code(404).send({});
      }
    }
  );
}

module.exports = postRoutes;
