async function postRoutes(fastify, options) {
  fastify.get(
    "/news/:id",
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

  fastify.get(
    "/news",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const count = request.query?.count || 5;
      let startDate = request.query?.startDate;

      if (!startDate) {
        let today = new Date();
        startDate = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      }

      try {
        const database = await fastify.pg.connect();
        const { rows } = await database.query(
          `SELECT *
          FROM news
          WHERE date_trunc('day', created_at) <= $1
          ORDER BY created_at DESC
          LIMIT $2;`,
          [startDate, count]
        );

        reply.send(rows || []);
      } catch (e) {
        console.log(e);
        reply.send([]);
      }
    }
  );

  const createNewsSchema = {
    body: {
      type: "object",
      properties: {
        title: { type: "string", nullable: true },
        journal: { type: "string", nullable: true },
        location: { type: "string", nullable: true },
        frame_color: { type: "string", nullable: true },
        background_photo: { type: "string", nullable: true },
      },
    },
  };
  fastify.post(
    "/news",
    { schema: createNewsSchema, onRequest: [fastify.authenticate] },
    async (request, reply) => {
      if (request.headers.jwt.uid !== 1) {
        reply.code(403).send({ error: "Unauthorized posting of news article" });
        return;
      }

      // check title and journal keys are sent
      if (!(request.body?.title && request.body?.journal)) {
        reply
          .code(406)
          .send({ error: "Missing `title` and `journal` fields in Request" });
      }

      try {
        const database = await fastify.pg.connect();

        let { rows } = await database.query(
          `INSERT INTO news(
            title,
            journal,
            location,
            frame_color,
            background_photo
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id`,
          [
            request.body.title,
            request.body.journal,
            request.body?.location,
            request.body?.frame_color,
            request.body?.background_photo,
          ]
        );

        reply.send({ id: rows[0].id });
      } catch (e) {
        console.log(e);
        reply.code(500).send({ error: "News article creation failed" });
      }
    }
  );

  fastify.patch(
    "/news/:id",
    { schema: createNewsSchema, onRequest: [fastify.authenticate] },
    async (request, reply) => {
      if (request.headers.jwt.uid !== 1) {
        reply.code(403).send({ error: "Unauthorized posting of news article" });
        return;
      }

      let columns = [];
      let values = [];
      [
        "title",
        "journal",
        "location",
        "frame_color",
        "background_photo",
      ].forEach((key) => {
        if (request.body?.[key]) {
          columns.push(`${key} = $${columns.length + 1}`);
          values.push(request.body[key]);
        }
      });

      values.push(request.params.id);

      try {
        const database = await fastify.pg.connect();

        let { rows } = await database.query(
          `UPDATE news SET ${columns.join()} WHERE id = $${
            values.length
          } RETURNING *`,
          values
        );

        reply.send(rows[0]);
      } catch (e) {
        console.log(e);
        reply.code(500).send({ error: "News article update failed" });
      }
    }
  );

  fastify.delete(
    "/news/:id",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      if (request.headers.jwt.uid !== 1) {
        reply.code(403).send({ error: "Unauthorized posting of news article" });
        return;
      }

      const database = await fastify.pg.connect();

      let { rows } = await database.query(`DELETE FROM news WHERE id=$1`, [
        request.params.id,
      ]);

      reply.send({ success: true });
    }
  );
}

module.exports = postRoutes;
