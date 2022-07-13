require("dotenv").config();
const fastify = require("fastify")({ logger: true });

fastify.register(require("@fastify/jwt"), {
  secret: "36715e76-7584-4e76-abac-b2e0c034cafa",
  sign: {
    expiresIn: "1h",
  },
  verify: {
    cache: true,
    maxAge: "1h",
  },
});
fastify.register(require("./plugins/authentication"));

fastify.register(require("@fastify/postgres"), {
  connectionString: process.env.DB_CONNECTION_STRING,
});

fastify.register(require("./routes/post"));
fastify.register(require("./routes/user"));

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
