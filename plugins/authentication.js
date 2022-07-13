const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  fastify.decorate("authenticate", async function (request, reply) {
    try {
      request.headers = { jwt: await request.jwtVerify() };
    } catch (err) {
      reply.send(err);
    }
  });
});
